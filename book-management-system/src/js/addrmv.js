import { initializeApp } from 'firebase/app'
import { getFirestore, getDocs, onSnapshot, addDoc, setDoc, doc, getDoc, deleteDoc, query, where, collection, add, serverTimestamp, orderBy } from "firebase/firestore"
import {
    getAuth, createUserWithEmailAndPassword, signOut,
    signInWithEmailAndPassword, onAuthStateChanged
} from "firebase/auth"

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { firebaseConfig } from './firebaseconfig.js'

initializeApp(firebaseConfig);
let book

const db = getFirestore()
const auth = getAuth()

const collection_refference = collection(db, 'books')

function newmap(book) {
    const remap = document.getElementById("addordel");
    let alldata = book.map(b => {
        return `<div class="card bg-base-100 w-[285px] h-[150px]">
            <div class="card-body">
                <h2 class="card-title">${b.titleInBng}</h2>
                <p>${b.id}</p>
            </div>
        </div>`;
    }).join('');
    remap.innerHTML = alldata;
}

onSnapshot(collection_refference, (snapshot) => {
    book = [];
    snapshot.docs.forEach((doc) => {
        book.push({ ...doc.data(), id: doc.id });
    });
    newmap(book);
});


// create a book
const bookform = document.querySelector("#create_a_book")
bookform.addEventListener("submit", (e) => {
    e.preventDefault()
    addDoc(collection_refference, {
        title: bookform.book.value,
        titleInBng: bookform.bookbng.value,
        author: bookform.author.value,
        genre: bookform.genre.value,
        pages: bookform.pages.value,
        about: bookform.about.value,
        bgpic: bookform.bgpic.value,
        publications: bookform.publications.value,
        language: bookform.language.value,
        availability: bookform.availability.value,
        price: bookform.price.value
    })
        .then(() => {
            bookform.reset()
            document.querySelector("#new_book_added").innerText = `new book added`
            setTimeout(() => {
                location.reload();
            }, 50);
        })

        .catch((err) => {
            console.log(err.message)
        })
})

// search
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");

    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();
        const filteredBooks = book.filter(book =>
            book.titleInBng.toLowerCase().includes(query)
        );
        newmap(filteredBooks);
    });
});

// remove a document

const removedoc = document.querySelector('.removedoc')
removedoc.addEventListener("submit", (e) => {
    e.preventDefault()

    const docref = doc(db, 'books', removedoc.id.value)
    deleteDoc(docref)
        .then(() => {
            removedoc.reset()
            document.querySelector(".dltmsg").innerHTML = `deleted`
            setTimeout(() => {
                document.querySelector(".dltmsg").innerHTML = ``
            }, 2000)
        })
})