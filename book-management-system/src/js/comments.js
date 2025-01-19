import { initializeApp } from 'firebase/app'
import { getFirestore, getDocs, onSnapshot, addDoc, setDoc, doc, getDoc, deleteDoc, query, where, collection, add, serverTimestamp, orderBy } from "firebase/firestore"
import {
    getAuth, createUserWithEmailAndPassword, signOut,
    signInWithEmailAndPassword, onAuthStateChanged
} from "firebase/auth"

import { firebaseConfig } from './firebaseconfig.js'

initializeApp(firebaseConfig);
let coms

const db = getFirestore()
const auth = getAuth()

const collection_refference = collection(db, 'comments')

onAuthStateChanged(auth, (user) => {
    if (user === null) {

    }
    else {
        onSnapshot(collection_refference, (snapshot) => {
            coms = []
            snapshot.docs.forEach((doc) => {
                coms.push({ ...doc.data(), id: doc.id })
            })
            comsmap(coms)
        })
    }
})

function comsmap(coms) {
    const displaycomms = document.querySelector('.displaycomms');
    const limitedComs = coms.slice(0, 6);
    let coment = limitedComs.map(a => {
        const stars = '⭐'.repeat(a.star);
        return `<div
    class="flex flex-col w-[330px] h-[280px] items-center shadow-2xl mr-[5px] mb-[10px] px-[10px] py-[20px] rounded-2xl border-t-2 border-l-2">
    <div class="avatar">
        <div class="ring-primary ring-offset-base-100 w-24 rounded-full ring ring-offset-2">
            <img src="https://e7.pngegg.com/pngimages/348/800/png-clipart-man-wearing-blue-shirt-illustration-computer-icons-avatar-user-login-avatar-blue-child.png" alt="User Avatar" />
        </div>
    </div><br>
    <p class="text-center break-words w-full">${a.username}</p>
    <p class="text-center break-words w-full">${a.email}</p>
    <p class="text-center break-words w-full max-h-[4.5rem] overflow-hidden text-ellipsis">${a.givencomment}</p>
    <p class="text-center">${stars}</p>
</div>`;
    }).join('');
    displaycomms.innerHTML = coment;
}
