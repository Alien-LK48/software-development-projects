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
function booksmap(books) {
    const displaydiv = document.querySelector(`.displaybooks`) // Use class directly without quotes
    let perbooks = books.map(a => {
        return `    <div class="indicator">
    <span class="indicator-item indicator-start badge badge-primary h-[50px] mt-[10px]">${a.price} BDT</span>
    <div class="grid w-[250px] h-[310px] shadow-2xl rounded-lg bg-white p-4 overflow-hidden place-items-center">
        <img src="${a.bgpic}" alt="" class="w-[130px] h-[185px] border-4 border-[black] rounded-md shadow-lg">
        <div class="mt-3 w-full max-w-xs flex flex-col items-center">
            <p class="text-sm text-gray-800 font-semibold overflow-hidden text-ellipsis whitespace-normal">${a.titleInBng}</p>
            <p class="text-sm text-gray-600 overflow-hidden text-ellipsis whitespace-normal">${a.author}</p>
            <label for="${a.id}" class="text-[red] hover:underline cursor-pointer mt-2">details</label>
        </div>
    </div>

    </div>
</div>

                    <input type="checkbox" id="${a.id}" class="modal-toggle" />
            <div class="modal" role="dialog">
                <div class="modal-box h-[900px] bg-white rounded-lg shadow-2xl p-6">

                    <div class="card card-side bg-base-100 shadow-xl rounded-lg">
                        <figure class="ml-[15px] mt-[40px] w-[130px] h-[186px] rounded-md overflow-hidden shadow-xl">
                            <img src="${a.bgpic}" alt="Book" class="w-[130px] h-[186px]" />
                        </figure>
                        <div class="card-body space-y-2">
                            <span class="text-lg font-semibold text-gray-800">${a.titleInBng}</span>
                            <span class="text-sm text-gray-600">by ${a.author}</span>
                            <span class="text-sm text-gray-700">Publications: ${a.publications}</span>
                            <span class="text-sm text-gray-700">Price: ${a.price} BDT</span>
                            <span class="text-sm text-gray-700">Total page: ${a.pages} pages</span>
                            <span class="text-sm text-gray-700">${a.availability}</span>
                            <div class="card-actions justify-end">
                                <button
                                    class="btn btn-primary cart-btn shadow-lg hover:shadow-xl rounded-full px-4 py-2 text-white font-semibold"
                                    data-id="${a.id}">Add to cart</button>
                            </div>
                        </div>
                    </div>

                    <br>
                    <div class="text-sm text-gray-600 mt-3">About: ${a.about}</div>

                    <!-- Close -->
                    <div class="modal-action mt-5">
                        <label for="${a.id}" class="btn btn-secondary rounded-full shadow-md">Close</label>
                    </div>
                </div>
            </div>`
    }).join('')
    displaydiv.innerHTML = perbooks
    // Add event listener for all "Add to cart" buttons
    const cartButtons = document.querySelectorAll(".cart-btn");
    const cartcount = document.querySelector("#cartcount");

    let i = 0;
    cartButtons.forEach(button => {
        button.addEventListener("click", async () => {
            button.innerHTML = '<span class="loading loading-spinner text-success"></span>';
            button.disabled = true;
            const bookId = button.getAttribute("data-id");
            const selectedBook = books.find(book => book.id === bookId);

            if (selectedBook) {
                try {
                    // Ensure the user is logged in
                    const user = auth.currentUser;
                    if (!user) {
                        alert("Please log in to add items to your cart.");
                        button.innerHTML = "Add to cart";
                        button.disabled = false;
                        return;
                    }

                    // Add book to the logged-in user's cart subcollection
                    const userCartRef = collection(db, "users", user.uid, "cart");
                    await addDoc(userCartRef, selectedBook);

                    console.log("Book added to user's cart:", selectedBook);
                    i++;
                    cartcount.innerHTML = i;
                    const notification = document.getElementById("notification");
                    notification.classList.remove("hidden");
                    const closeNotificationButton = document.getElementById("closeNotification");
                    closeNotificationButton.addEventListener("click", () => {
                        notification.classList.add("hidden");
                    });
                } catch (error) {
                    console.error("Error adding document to Firebase:", error);
                } finally {
                    // Reset button state after operation
                    button.innerHTML = "Add to cart";
                    button.disabled = false;
                }
            } else {
                console.error("Book not found with id:", bookId);
                button.innerHTML = "Add to cart";
                button.disabled = false;
            }
        });
    });
}


onAuthStateChanged(auth, (user) => {
    if (user === null) {

    }
    else {
        const collection_refference = collection(db, "users", user.uid, "bookmarks")
        onSnapshot(collection_refference, (snapshot) => {
            books = []
            snapshot.docs.forEach((doc) => {
                books.push({ ...doc.data(), id: doc.id })
            })
            booksmap(books)
        })
        const userCartRef = collection(db, "users", user.uid, "cart");
        const cartcount = document.querySelector("#cartcount");

        onSnapshot(userCartRef, (snapshot) => {
            let books = [];
            snapshot.docs.forEach((doc) => {
                books.push({ ...doc.data(), id: doc.id });
            });
            cartcount.innerHTML = books.length
        });
    }
})


document.addEventListener("DOMContentLoaded", () => {
    const counter = document.querySelector(".autocount");
    const duration = 6000;

    onSnapshot(collection_refference, (snapshot) => {
        books = [];
        snapshot.docs.forEach((doc) => {
            books.push({ ...doc.data(), id: doc.id });
        });
        const targetValue = books.length;
        const startTime = performance.now();

        // Animate the count
        function animateCount(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const currentValue = Math.floor(progress * targetValue);
            counter.innerHTML = currentValue; // Display in English
            if (progress < 1) {
                requestAnimationFrame(animateCount);
            }
        }

        // Trigger the animation
        requestAnimationFrame(animateCount);
    });
});
