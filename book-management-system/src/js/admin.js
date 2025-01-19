import { initializeApp } from 'firebase/app';
import {
    getFirestore, getDocs, onSnapshot, collection, query, where
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import { firebaseConfig } from './firebaseconfig.js';


initializeApp(firebaseConfig);


const db = getFirestore();
const auth = getAuth();

const totalbooks = collection(db, 'books');
const totalaccounts = collection(db, 'users');
const totalcomments = collection(db, 'comments');
const totalorders = collection(db, 'orders');

let allbooks
let allaccounts
let allcomments
let allorders


function displaytotal(collection_reference, items, dom) {
    onSnapshot(collection_reference, (snapshot) => {
        items = [];
        snapshot.docs.forEach((doc) => {
            items.push({ ...doc.data(), id: doc.id });
        });
        document.querySelector(`.${dom}`).innerHTML = items.length;
    });
}


onAuthStateChanged(auth, (user) => {
    if (user) {
        displaytotal(totalbooks, allbooks, 'totalbooks');
        displaytotal(totalcomments, allcomments, 'totalcomments');
        displaytotal(totalorders, allorders, 'totalorders');
        displaytotal(totalaccounts, allaccounts, 'totalaccounts');

    } else {
        console.log("No user is logged in");
    }
});
