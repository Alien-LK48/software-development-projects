import { initializeApp } from 'firebase/app'
import {
    getFirestore, getDocs, onSnapshot, addDoc, setDoc, doc, getDoc,
    deleteDoc, query, where, collection, add, serverTimestamp, orderBy
} from "firebase/firestore"
import { firebaseConfig } from './firebaseconfig.js'
initializeApp(firebaseConfig);
import {
    getAuth, createUserWithEmailAndPassword, signOut,
    signInWithEmailAndPassword, onAuthStateChanged
} from "firebase/auth"
const auth = getAuth()
const db = getFirestore()
let books
onAuthStateChanged(auth, (user) => {
    if (user === null) {

    }
    else {

        const collection_refference = collection(db, "users", user.uid, "orders")
        onSnapshot(collection_refference, (snapshot) => {
            books = [];
            snapshot.docs.forEach((doc) => {
                books.push({ ...doc.data(), id: doc.id });
            });
            if (books.length !== 0) {
                myorders(books)
            }
            else {
                document.querySelector(".allorders").innerHTML = `<div role="alert" class="w-[980px] alert alert-error">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-6 w-6 shrink-0 stroke-current"
    fill="none"
    viewBox="0 0 24 24">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  <span>You dont have any orders</span>
</div>`

            }
        });
    }
})
function myorders(books) {
    let allorders = document.querySelector(".allorders");
    let myorder = books.map(a => {
        let orderDate = new Date(a.timestamp.seconds * 1000); //  firestore's timestamp 
        let formattedDate = orderDate.toLocaleString(); // formats to local time

        return `<div class="w-[470px] h-[230px] p-4 space-y-4 border-black rounded-2xl border-2 mb-[-140px]">
            <div>
                <h3 class="text-lg font-semibold">Order No: <span class="text-red-500">${a.orderId}</span></h3>
                <h3 class="text-lg font-semibold">At: <span class="text-purple-700">${formattedDate}</span></h3>
                <p class="text-sm">Book: <span class="font-medium">${a.bookTitle}</span></p>
                <p class="text-sm">Author: <span class="font-medium">${a.bookAuthor}</span></p>
                <p class="text-sm">Total Books: <span class="font-medium">${a.totalBooks}</span></p>
                <p class="text-sm">Discount: <span class="font-medium text-green-500">${a.discount}</span></p>
            </div>
            <div>
                <p class="text-xl font-semibold">Total Price: <span
                        class="font-medium text-red-500">${a.totalPrice}</span></p>
            </div>
        </div>`;
    }).join("");
    allorders.innerHTML = myorder;
}
