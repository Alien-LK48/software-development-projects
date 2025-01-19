import { initializeApp } from 'firebase/app'
import {
    getFirestore, getDocs, onSnapshot, addDoc, setDoc, doc, getDoc,
    deleteDoc, query, where, collection, add, serverTimestamp, orderBy, updateForm,
    updateDoc
} from "firebase/firestore"
import {
    getAuth, createUserWithEmailAndPassword, signOut,
    signInWithEmailAndPassword, onAuthStateChanged
} from "firebase/auth"

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { firebaseConfig } from './firebaseconfig.js'
initializeApp(firebaseConfig);
let books;
const db = getFirestore()
const auth = getAuth()
const collection_refference = collection(db, 'books')


function optiongenerate(books) {
    const dom = document.getElementById("authorselect");
    //  unique authors
    let authors = [...new Set(books.map(a => a.author))].map(author => {
        return `<option>${author}</option>`;
    }).join("");
    dom.innerHTML += authors;
}

function publishersgenarate(books) {
    const dom = document.getElementById("publiselect");
    //  unique publishers
    let pubs = [...new Set(books.map(a => a.publications))].map(pub => {
        return `<option>${pub}</option>`;
    }).join('');
    dom.innerHTML += pubs;
}


function detaildisplay(books) {
    const dom = document.getElementById("listbooks");

    let mapedbooks = books.map(a => {
        return `<div class="ml-[45px] mb-[10px] w-[250px] h-[310px] shadow-2xl rounded-lg bg-white p-4 overflow-hidden">
    <img src="${a.bgpic}" alt="" class="w-[130px] h-[185px] border-4 flex border-[black] ml-[50px] rounded-md shadow-lg">
    <div class="ml-[20px] mt-3">
        <p class="text-sm text-gray-800 font-semibold truncate">${a.titleInBng}</p>
        <p class="text-sm text-gray-600 truncate">${a.author}</p>
        <label for="${a.id}" class='text-[red] hover:underline cursor-pointer mt-2'>details</label>
    </div>
</div>


    <!-- Modal -->
    <input type="checkbox" id="${a.id}" class="modal-toggle" />
    <div class="modal" role="dialog">
        <div class="modal-box h-[900px] bg-white rounded-lg shadow-2xl p-6">

            <div class="card card-side bg-base-100 shadow-xl rounded-lg">
                <figure class="ml-[15px] mt-[40px] w-[130px] h-[186px] rounded-md overflow-hidden shadow-xl">
                    <img src="${a.bgpic}" alt="Book" class="w-[130px] h-[186px]"/>
                </figure>
                <div class="card-body space-y-2">
                    <span class="text-lg font-semibold text-gray-800">${a.titleInBng}</span>
                    <span class="text-sm text-gray-600">by ${a.author}</span>
                    <span class="text-sm text-gray-700">Publications: ${a.publications}</span>
                    <span class="text-sm text-gray-700">Price: ${a.price} BDT</span>
                    <span class="text-sm text-gray-700">Total page: ${a.pages} pages</span>
                    <span class="text-sm text-gray-700">${a.availability}</span>
                    <div class="card-actions justify-end">
                        <button class="btn btn-primary cart-btn shadow-lg hover:shadow-xl rounded-full px-4 py-2 text-white font-semibold" data-id="${a.id}">Add to cart</button>
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
    </div>`;
    }).join("");

    dom.innerHTML = mapedbooks;

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
                    alert("Added to your cart");
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



const page = window.location.pathname.split("/").pop().replace('.html', '');
let category = '';
if (page === 'liberation-war') {
    category = 'liberation war';
}
else if (page === 'language-and-law') {
    category = 'language and law';
}
else if (page === 'novel') {
    category = 'novel'
}
else if (page === 'essay') {
    category = 'Essay'
}
else if (page === 'agricltr') {
    category = "Agriculture"
}
else if (page === 'poem') {
    category = 'poem'
}
else if (page === 'politics') {
    category = 'politics'
}
else if (page === 'jurnal') {
    category = 'Journalism'
}
else if (page === 'admit') {
    category = 'admit'
}
else if (page === 'cook') {
    category = 'Cooking'
}
else if (page === 'engn') {
    category = 'Engineering'
}
else if (page === 'entn') {
    category = 'Entertainment'
}
else if (page === 'fairy') {
    category = 'Fairy tales'
}
else if (page === 'islam') {
    category = 'islamic'
}
else if (page === 'languagelearn') {
    category = 'Language'
}
else if (page === 'law') {
    category = 'Law and Justice'
}
else if (page === 'student') {
    category = 'Student Life Development'
}



let mainq = query(collection_refference, where('category', '==', category));
onSnapshot(mainq, (snapshot) => {
    books = [];
    snapshot.docs.forEach((doc) => {
        books.push({ ...doc.data(), id: doc.id });
    });

    // Display the books
    detaildisplay(books);
    optiongenerate(books);
    publishersgenarate(books);
});
console.log("Page:", page);
console.log("Category:", category);

// Global object to store selected filters
const filters = {
    author: null,
    stock: null,
    publications: null,
    language: [],
    price: null // Add price filter to the object
};

// Function to handle queries dynamically based on filters
function handleQuery() {
    const queryConditions = [];

    // Add filters to the query
    if (filters.author) {
        queryConditions.push(where("author", "==", filters.author));
    }
    if (filters.stock) {
        queryConditions.push(where("availability", "==", filters.stock));
    }
    if (filters.publications) {
        queryConditions.push(where("publications", "==", filters.publications));
    }
    if (filters.language.length > 0) {
        queryConditions.push(where("language", "in", filters.language));
    }
    if (filters.price !== null) {
        queryConditions.push(where("price", "<=", filters.price));
    }

    // Create Firestore query
    let finalQuery;
    if (queryConditions.length > 0) {
        finalQuery = query(mainq, ...queryConditions);
    } else {
        finalQuery = query(mainq); // Default query if no filters
    }

    // Execute query
    onSnapshot(finalQuery, (snapshot) => {
        const books = [];
        snapshot.docs.forEach((doc) => {
            books.push({ ...doc.data(), id: doc.id });
        });
        detaildisplay(books);
    });
}

// Event listener for author selection
const authordom = document.querySelector("#authorselect");
authordom.addEventListener("change", () => {
    filters.author = authordom.value || null;
    console.log(`Author filter: ${filters.author}`);
    handleQuery();
});

// Event listener for stock selection
const stockdom = document.querySelectorAll(".stock-radio");
stockdom.forEach((radio) => {
    radio.addEventListener("change", () => {
        filters.stock = radio.checked ? radio.value : null;
        console.log(`Stock filter: ${filters.stock}`);
        handleQuery();
    });
});

// Event listener for publications checkboxes
const pubdom = document.querySelector("#publiselect");

pubdom.addEventListener("change", () => {
    filters.publications = pubdom.value || null;
    console.log(`Publications filter: ${filters.publications}`);
    handleQuery();
});


// Event listener for language checkboxes
const checkboxeslang = document.querySelectorAll(".lang-checkbox");
checkboxeslang.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
        filters.language = Array.from(checkboxeslang)
            .filter((cb) => cb.checked)
            .map((cb) => cb.value);
        console.log(`Language filter: ${filters.language}`);
        handleQuery();
    });
});

// Get range input and display element for price
const priceRange = document.getElementById('priceRange');
const priceValue = document.getElementById('priceValue');

// Add event listener to the range input
priceRange.addEventListener('input', (event) => {
    const selectedPrice = event.target.value;
    priceValue.textContent = `Price: ${selectedPrice} BDT`;

    // Update the filters object with the selected price
    filters.price = Number(selectedPrice); // Set the price filter

    console.log('Price filter:', selectedPrice);

    // Perform query with the updated price filter
    handleQuery(); // Call handleQuery to apply all filters, including price
});


//search bar
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");

    searchInput.addEventListener("keyup", () => {
        const query = searchInput.value.toLowerCase(); // Get the search query in lowercase
        const filteredBooks = books.filter(book =>
            book.titleInBng.toLowerCase().includes(query) // Match search query with book titles
        );
        detaildisplay(filteredBooks); // Re-render books based on the search results
    });
});

let currentUser = null;
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user === null) {

    }
    else {
        const userCartRef = collection(db, "users", user.uid, "cart");
        const cartcount = document.querySelector("#cartcount")
        onSnapshot(userCartRef, (snapshot) => {
            books = [];
            snapshot.docs.forEach((doc) => {
                books.push({ ...doc.data(), id: doc.id });
            });
            cartcount.innerHTML = books.length
        });
    }
})