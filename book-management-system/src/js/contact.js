import { initializeApp } from 'firebase/app';
import {
    getFirestore, collection, addDoc
} from "firebase/firestore";
import {
    getAuth, onAuthStateChanged
} from "firebase/auth";
import { firebaseConfig } from './firebaseconfig.js';
initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth();
const collection_reference = collection(db, 'comments');

const ratingDiv = document.getElementById('rating');

function getCheckedValue() {
    const checkedInput = document.querySelector('input[name="rating-2"]:checked');
    if (checkedInput) {
        return Number(checkedInput.value);
    } else {
        return Number('0');
    }
}

const commentform = document.querySelector('#commentform');
commentform.addEventListener('submit', (e) => {
    e.preventDefault();

    onAuthStateChanged(auth, (user) => {
        if (user) {

            addDoc(collection_reference, {
                username: commentform.name.value,
                email: commentform.email.value,
                givencomment: commentform.comment.value,
                userId: user.uid,
                star: getCheckedValue()

            })
                .then(() => {
                    const notification = document.getElementById("notification");
                    notification.classList.remove("hidden");
                    const closeNotificationButton = document.getElementById("closeNotification");
                    closeNotificationButton.addEventListener("click", () => {
                        notification.classList.add("hidden");
                    });
                    commentform.reset();
                })
                .catch((err) => {
                    console.error("Error adding comment:", err.message);
                });
        } else {
            console.log("No user is signed in.");
        }
    });
});
