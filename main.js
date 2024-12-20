const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

function generateId() {
  return +new Date().getTime();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function findBookId(id) {
  for (const bookItem of books) {
    if (bookItem.id === id) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(id) {
  for (const index in books) {
    if (books[index].id === id) {
      return index;
    }
  }
  return -1;
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function saveBook() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBook(bookObject) {
  const { id, title, author, year, isComplete } = bookObject;

  const bookTitle = document.createElement("h2");
  bookTitle.setAttribute("data-testid", "bookItemTitle");
  bookTitle.innerText = title;

  const bookAuthor = document.createElement("p");
  bookAuthor.setAttribute("data-testid", "bookItemAuthor");
  bookAuthor.innerText = `Penulis: ${author}`;

  const bookYear = document.createElement("p");
  bookYear.setAttribute("data-testid", "bookItemYear");
  bookYear.innerText = `Tahun: ${year}`;

  const bookContainer = document.createElement("div");
  bookContainer.setAttribute("data-bookid", id);
  bookContainer.setAttribute("data-testid", "bookItem");
  bookContainer.setAttribute("class", "book-item");
  bookContainer.append(bookTitle, bookAuthor, bookYear);

  const deleteButton = document.createElement("button");
  deleteButton.setAttribute("data-testid", "bookItemDeleteButton");
  deleteButton.setAttribute("class", "btn del-btn");
  deleteButton.innerText = "Hapus Buku";
  deleteButton.addEventListener("click", function () {
    deleteBookFromComplete(id);
  });

  const editButton = document.createElement("button");
  editButton.setAttribute("data-testid", "bookItemEditButton");
  editButton.setAttribute("class", "btn edit-btn");
  editButton.innerText = "Edit Buku";
  editButton.addEventListener("click", function () {
    editBook(id);
    editButton.remove();
  });
  if (isComplete) {
    const undoButton = document.createElement("button");
    undoButton.setAttribute("data-testid", "bookItemIsCompleteButton");
    undoButton.setAttribute("class", "btn status-btn");
    undoButton.innerText = "Tandai Belum Selesai Dibaca";
    undoButton.addEventListener("click", function () {
      undoBookFromComplete(id);
    });

    bookContainer.append(undoButton, deleteButton, editButton);
  } else {
    const completeButton = document.createElement("button");
    completeButton.setAttribute("data-testid", "bookItemIsCompleteButton");
    completeButton.setAttribute("class", "btn status-btn");
    completeButton.innerText = "Tandai Selesai Dibaca";
    completeButton.addEventListener("click", function () {
      addBookToComplete(id);
    });

    bookContainer.append(completeButton, deleteButton, editButton);
  }

  return bookContainer;
}

function addBook() {
  const title = document.getElementById("bookFormTitle").value;
  const author = document.getElementById("bookFormAuthor").value;
  const year = parseInt(document.getElementById("bookFormYear").value);
  const isComplete = document.getElementById("bookFormIsComplete").checked;

  const id = generateId();
  const bookObject = generateBookObject(id, title, author, year, isComplete);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBook();
  console.log(bookObject);
}

function addBookToComplete(id) {
  const bookTarget = findBookId(id);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBook();
}

function deleteBookFromComplete(id) {
  const bookTarget = findBookIndex(id);

  if (bookTarget == -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBook();
}

function undoBookFromComplete(id) {
  const bookTarget = findBookId(id);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBook();
}

function editBook(id) {
  const bookObject = findBookId(id);

  if (bookObject == null) return;

  const bookContainer = document.querySelector(`div[data-bookid="${id}"]`);
  bookContainer.style.display = "none";

  const editForm = document.createElement("form");
  editForm.setAttribute("class", "form-edit book-item");
  const titleEdit = document.createElement("input");
  titleEdit.setAttribute("type", "text");
  titleEdit.value = bookObject.title;
  const authorEdit = document.createElement("input");
  authorEdit.setAttribute("type", "text");
  authorEdit.value = bookObject.author;
  const yearEdit = document.createElement("input");
  yearEdit.setAttribute("type", "number");
  yearEdit.value = bookObject.year;

  const saveButton = document.createElement("button");
  saveButton.innerText = "Simpan";
  saveButton.setAttribute("class", "btn save-btn");
  saveButton.addEventListener("click", function (event) {
    event.preventDefault();

    bookObject.title = titleEdit.value;
    bookObject.author = authorEdit.value;
    bookObject.year = yearEdit.value;

    saveBook();

    bookContainer.style.display = "block";

    editForm.remove();
    document.dispatchEvent(new Event(RENDER_EVENT));
  });

  const cancelButton = document.createElement("button");
  cancelButton.innerText = "Batal";
  cancelButton.setAttribute("class", "btn cancel-btn");
  cancelButton.addEventListener("click", function (event) {
    event.preventDefault();

    bookContainer.style.display = "block";
    editForm.remove();

    document.dispatchEvent(new Event(RENDER_EVENT));
  });

  editForm.append(titleEdit, authorEdit, yearEdit, saveButton, cancelButton);
  bookContainer.parentNode.insertBefore(editForm, bookContainer.nextSibling);
}

function searchBook() {
  const searchInput = document.getElementById("searchBookTitle").value;
  const searchResult = books.filter((book) =>
    book.title.toLowerCase().includes(searchInput.toLowerCase())
  );
  const incompleteBookList = document.getElementById("incompleteBookList");
  const completeBookList = document.getElementById("completeBookList");
  incompleteBookList.innerHTML = "";
  completeBookList.innerHTML = "";
  searchResult.forEach((book) => {
    const bookElement = makeBook(book);
    if (book.isComplete) {
      completeBookList.append(bookElement);
    } else {
      incompleteBookList.append(bookElement);
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("bookForm");
  const searchForm = document.getElementById("searchBook");

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    searchBook();
  });

  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(SAVED_EVENT, function () {
  console.log("Data berhasil disimpan.");
});

document.addEventListener(RENDER_EVENT, function () {
  const incompleteBookList = document.getElementById("incompleteBookList");
  const completeBookList = document.getElementById("completeBookList");

  incompleteBookList.innerHTML = "";
  completeBookList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isComplete) {
      completeBookList.append(bookElement);
    } else {
      incompleteBookList.append(bookElement);
    }
  }
});
