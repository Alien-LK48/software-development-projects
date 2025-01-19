import { initializeApp } from 'firebase/app'
import {
    getFirestore, getDocs, onSnapshot, addDoc, setDoc, doc, getDoc,
    deleteDoc, query, where, collection, add, serverTimestamp, orderBy
} from "firebase/firestore"
import {
    getAuth, createUserWithEmailAndPassword, signOut,
    signInWithEmailAndPassword, onAuthStateChanged
} from "firebase/auth"

import { firebaseConfig } from './firebaseconfig.js'
initializeApp(firebaseConfig);

const db = getFirestore()
const auth = getAuth()
const collection_refference = collection(db, 'books')
// log out
const logoutButtons = document.querySelectorAll('.logout');
logoutButtons.forEach((logout) => {
    logout.addEventListener('click', (e) => {
        e.preventDefault();
        signOut(auth).then(() => {
            console.log('signed out');
        }).catch((error) => {
            console.error('Error during sign out:', error);
        });
    });
});
// log in
const loginform = document.querySelector('#log_in_form')
loginform.addEventListener("submit", (e) => {
    e.preventDefault()
    const email = loginform["log_in_email"].value
    const password = loginform["log_in_password"].value
    signInWithEmailAndPassword(auth, email, password)
        .then((cred) => {
            console.log(cred.user)
            loginform.reset()

        })
        .catch((err) => {
            loginform.reset();
            console.log(err)
        })
})

// sign up
const signupform = document.querySelector("#sign_up_form");
signupform.addEventListener('submit', (e) => {
    e.preventDefault();
    let email = signupform["sign_up_email"].value;
    let password = signupform["sign_up_password"].value;
    console.log(email, password);

    // Create the user with email and password
    createUserWithEmailAndPassword(auth, email, password)
        .then((cred) => {
            // Set user data in Firestore
            const user_collection_refference = collection(db, 'users')
            const userRef = doc(user_collection_refference, cred.user.uid);
            return setDoc(userRef, {
                nickname: signupform['sign_up_name'].value,
                phonenumber: signupform["phonenum"].value,
                email: signupform["sign_up_email"].value
            });
        })
        .then((cred) => {
            console.log(cred.user)
            console.log("User created");
            signupform.reset();
            setTimeout(() => {
                location.reload();
            }, 2000);
        })

        .catch((err) => {
            signupform.reset();
            console.log(err.message);

        });
});

let currentUser = null;
// log in or out see or hide , it can be done by firestore
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user === null) {
        hideandseek()
    }
    else {
        // onSnapshot(collection_refference, (snapshot) => {
        //     let guide = []
        //     snapshot.docs.forEach((doc) => {
        //         guide.push({ ...doc.data(), id: doc.id })
        //     })
        //     mapping(guide)
        // })
        hideandseek(user)

        const userCartRef = collection(db, "users", user.uid, "cart");
        const userBookmarkRef = collection(db, "users", user.uid, "bookmarks");
        const cartcount = document.querySelector("#cartcount");
        const bookmarkcount = document.querySelector("#bookmarkcount");

        onSnapshot(userCartRef, (snapshot) => {
            let books = [];
            snapshot.docs.forEach((doc) => {
                books.push({ ...doc.data(), id: doc.id });
            });
            cartcount.innerHTML = books.length
            bookmarkcount.innerHTML = books.length
        });
        onSnapshot(userBookmarkRef, (snapshot) => {
            let books = [];
            snapshot.docs.forEach((doc) => {
                books.push({ ...doc.data(), id: doc.id });
            });

            bookmarkcount.innerHTML = books.length
        });
    }
})
// account details
const accountis = document.querySelector(".account_details")
// log in out access the button or others 
const ifloggedout = document.querySelectorAll(".if_logged_out")
const ifloggedin = document.querySelectorAll(".if_logged_in")
function hideandseek(user) {
    if (user) {
        // Show account info
        const user_collection_refference = collection(db, 'users');
        const userRef = doc(user_collection_refference, user.uid);
        getDoc(userRef)
            .then((doc) => {
                const role = doc.data().role || 'user'; // default to 'user' if no role is found
                const detailsacc = `
                    <div class="bg-white rounded-lg shadow-md p-6 space-y-2">
                    <p class="text-gray-700">Logged in as: <span class="text-red-500 font-medium lowercase">${user.email}</span></p>
                    <p class="text-gray-700">Name: <span class="font-medium">${doc.data().nickname || "N/A"}</span></p>
                    <p class="text-gray-700">Contact no: <span class="font-medium">${doc.data().phonenumber || "N/A"}</span></p>
                    <p class="text-gray-700">Role: <span class="text-green-500 font-medium">${role || "N/A"}</span></p>
                    </div>`;
                accountis.innerHTML = detailsacc;
                // Show or hide "edit database" option based on role
                const editDatabaseOptions = document.querySelectorAll('.if_admin');

                if (role === 'admin') {
                    editDatabaseOptions.forEach(option => {
                        option.style.display = 'block';
                    });
                } else {
                    editDatabaseOptions.forEach(option => {
                        option.style.display = 'none';
                    });
                }

            });

        ifloggedin.forEach(items => { items.style.display = "block" });
        ifloggedout.forEach(items => { items.style.display = "none" });
    } else {
        accountis.innerHTML = ``;
        ifloggedin.forEach(items => { items.style.display = "none" });
        ifloggedout.forEach(items => { items.style.display = "block" });
    }
}

export { hideandseek }
let books

function displaybooks(category, classname) {
    const collectionQuery = query(collection_refference, where("category", "==", `${category}`));
    onSnapshot(collectionQuery, (snapshot) => {
        const books = [];
        snapshot.docs.forEach((doc) => {
            books.push({ ...doc.data(), id: doc.id });
        });

        const displaydiv = document.querySelector(`.${classname}`); // Use class directly
        const perbooks = books.map((a) => {
            return `<div class="indicator ml-[20px] w-[220px] h-[290px] shadow-2xl shadow-black/40 flex-shrink-0 flex flex-col">
                        <span class="indicator-item">
                            <div tabindex="0" role="button" class="btn btn-ghost btn-circle bookmarkbtn" data-book-id="${a.id}">
                                <div class="indicator">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                                    </svg>
                                </div>
                            </div>
                        </span>
                        <img src="${a.bgpic}" alt="" class="mb-[10px] w-[130px] h-[185px] border-4 border-[black] mx-auto shadow-md">
                        <div class="grid place-items-center mt-2">
                            <div class="text-center">
                                <p class="text-sm">${a.titleInBng}</p>
                                <p class="text-sm">${a.author}</p>
                            </div>
                        </div>
                    </div>`;
        }).join('');
        displaydiv.innerHTML = perbooks;

        // Add event listener for bookmark buttons
        const bookmarkButtons = displaydiv.querySelectorAll('.bookmarkbtn');
        bookmarkButtons.forEach((button) => {
            button.addEventListener('click', (e) => {
                const bookId = e.target.closest('.bookmarkbtn').getAttribute('data-book-id');
                const book = books.find((b) => b.id === bookId);
                addBookmark(book);
            });
        });
    });
}

//  add bookmark
function addBookmark(book) {
    if (!currentUser) {
        alert('Please log in to bookmark books.');
        return;
    }
    const bookmarkRef = doc(db, "users", currentUser.uid, "bookmarks", book.id);
    setDoc(bookmarkRef, {
        titleInBng: book.titleInBng,
        author: book.author,
        category: book.category,
        bgpic: book.bgpic,
        price: book.price,
        publications: book.publications,
        availability: book.availability,
        pages: book.pages
    })
        .then(() => {
            const notification = document.getElementById("notification");
            notification.classList.remove("hidden");
            const closeNotificationButton = document.getElementById("closeNotification");
            closeNotificationButton.addEventListener("click", () => {
                notification.classList.add("hidden");
            });
        })
        .catch((error) => {
            console.error('Error bookmarking book:', error);
        });
}
// Make user an admin based on email
const makeAdminForm = document.querySelector("#makeAdminForm");
makeAdminForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById("adminEmailInput").value;
    if (email) {
        const usersCollectionRef = collection(db, "users");

        // Query to find the user by email
        const userQuery = query(usersCollectionRef, where("email", "==", email));
        getDocs(userQuery)
            .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0];  // Get the first matching user
                    const userRef = doc(db, "users", userDoc.id);

                    // Update the role to "admin"
                    return setDoc(userRef, { role: "admin" }, { merge: true });
                } else {
                    throw new Error("User not found");
                }
            })
            .then(() => {
                alert(`User with email ${email} is now an admin.`);
                // Optionally, update the UI or account details
                // Call the function to refresh account details
                hideandseek(auth.currentUser);
            })
            .catch((error) => {
                alert(error.message);
            });
    }
});
displaybooks('liberation war', 'liberationwar')
displaybooks('Journalism', 'Journalism')
displaybooks('Engineering', 'Engineering')
displaybooks('politics', 'Politics')
displaybooks('Agriculture', 'Agriculture')
displaybooks('Entertainment', 'Entertainment')
displaybooks('novel', 'Novel')
displaybooks('Fairy tales', 'FairyTales')
displaybooks('Law and Justice', 'LawandJustice')
displaybooks('language and law', 'LanguageandLaw')
displaybooks('Essay', 'Essay')
displaybooks('islamic', 'Islamic')
displaybooks('Cooking', 'Cooking')
displaybooks('admit', 'Admit')
displaybooks('Student Life Development', 'StudentLifeDevelopment')
displaybooks('Language', 'Language')
let visibleDivs = 0;

document.getElementById("showButton").addEventListener("click", function () {

    const divsToUnhide = document.querySelectorAll('.hidden.to-unhide');

    // only unhide the next 2 divs each time the button is clicked
    const divsToShow = Array.from(divsToUnhide).slice(visibleDivs, visibleDivs + 2);

    divsToShow.forEach(div => {
        div.classList.remove('hidden');
    });

    // update the number of visible divs
    visibleDivs += divsToShow.length;

    if (visibleDivs >= divsToUnhide.length) {
        document.getElementById("showButton").disabled = true;
    }
});








