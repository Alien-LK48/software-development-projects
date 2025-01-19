import { initializeApp } from 'firebase/app'
import {
    getFirestore, getDocs, onSnapshot, addDoc, setDoc, doc, getDoc,
    deleteDoc, query, where, collection, add, serverTimestamp, orderBy
} from "firebase/firestore"
import {
    getAuth, createUserWithEmailAndPassword, signOut,
    signInWithEmailAndPassword, onAuthStateChanged
} from "firebase/auth"
import { v4 as uuidv4 } from 'uuid';
const uniqueOrderId = uuidv4();

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { firebaseConfig } from './firebaseconfig.js'
initializeApp(firebaseConfig);

const db = getFirestore()
const auth = getAuth()
auth.onAuthStateChanged((user) => {
    if (user) {
        // Reference to the user's cart subcollection
        const userCartRef = collection(db, "users", user.uid, "cart");

        onSnapshot(userCartRef, (snapshot) => {
            let books = [];
            snapshot.docs.forEach((doc) => {
                books.push({ ...doc.data(), id: doc.id });
            });

            const showbks = document.querySelector(".cartbooks");

            if (books.length === 0) {
                showbks.innerHTML = `<p class='text-center'>You don't have any items in your cart.</p>`;
            } else {
                cart(books); // Call the `cart` function to display the books in the cart
                document.querySelector('.totalcartbooks').innerHTML = books.length
            }
        });
    } else {
        // Handle unauthenticated state
        const showbks = document.querySelector(".showbks");
        showbks.innerHTML = "Please log in to view your cart.";
    }
});
let books;
function cart(books) {
    const cartbooks = document.querySelector(".cartbooks");
    let cartmap = books.map(a => {

        return `<div id="order-${a.id}" class="ml-[195px] bg-[silver] w-[970px] h-[360px] join gap-[390px] mb-[10px]">
            <div class="card bg-base-100 image-full w-[185px] h-[280px] shadow-xl ml-[20px] mt-[20px]">
                <figure>
                    <img src="${a.bgpic}" alt="Shoes" />
                </figure>
                <div class="card-body">
                    <h2 class="card-title">${a.titleInBng}</h2>
                    <p>${a.author}</p>
                    <p> ${a.price} BDT</p>
                </div>
            </div>
            <div class="mt-[20px] pr-[20px]">
                <p class="text-2xl">Place Order</p> <br>
                <form action="">
                    <label for="" class="mb-[5px]">Amount (BDT) for <span class="totalbks-for-${a.price}">1</span> books</label><br>
                    <span class="btn decbtn-for-${a.id} mr-[5px]">-</span>
                    <input disabled type="text" id="amount-${a.id}" value="${a.price}" class="text-center w-[80px]">
                    <span class="btn incbtn-for-${a.id} ml-[5px]">+</span> <br>
                    <label for="">Discount Coupon <span class='discntof-${a.id}'>0</span>%</label> <br>
                    <input type="text" name="" id="coupon-${a.id}" placeholder="Enter valid coupon code"> <br>
                    <label for="">Final Price</label><br>
                    <input type="text" name="" id="final-price-${a.id}" disabled class="text-center w-[100px] mb-[20px]"><br>
                    <label for="${a.id}" class="btn ml-[165px] palceorders-for-${a.id}">Place Order</label> 
                </form>
            </div>
        </div>
        <input type="checkbox" id="${a.id}" class="modal-toggle" />
        <div class="modal" role="dialog">
            <div class="max-w-sm mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div class="bg-blue-500 text-white py-3 px-4">
            <h2 class="text-xl font-bold">Payment Details</h2>
        </div>
        <div class="p-4 space-y-4">
            <div>
                <h3 class="text-lg font-semibold">Order No: <span id="orderId-for-${a.id}" class="text-red-500">12345</span></h3>
                <p class="text-sm">Book: <span class="font-medium">${a.title}</span></p>
                <p class="text-sm">Author: <span class="font-medium">${a.author}</span></p>
            </div>
            <div>
                <p class="text-sm">Total Books: <span class="font-medium finaltotalbooks-for-${a.id}"></span></p>
            </div>
            <div>
                <p class="text-sm">Discount: <span class="font-medium text-green-500 isusediscount-for-${a.id}"></span></p>
            </div>
            <div>
                <p class="text-xl font-semibold">Total Price: <span
                        class="font-medium text-red-500 payfinalamount-for-${a.id}"></span></p>
            </div>
        </div>
        <div class="bg-gray-100 p-4 text-center">
            <label for="${a.id}"
                class="btn confirm-order-btn bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-700"
                data-id="${a.id}">Confirm
                Order</label>
        </div>
    </div>
        </div>`;
    }).join("");
    cartbooks.innerHTML = cartmap;

    // Add event listeners for increment and decrement buttons
    books.forEach(a => {
        const incBtn = document.querySelector(`.incbtn-for-${a.id}`)
        const decBtn = document.querySelector(`.decbtn-for-${a.id}`)
        const amountField = document.querySelector(`#amount-${a.id}`)
        const finalPriceField = document.querySelector(`#final-price-${a.id}`)
        const totalbks = document.querySelector(`.totalbks-for-${a.price}`)
        const confirmOrderBtn = document.querySelector(`.confirm-order-btn[data-id="${a.id}"]`)
        const orderContainer = document.querySelector(`#order-${a.id}`)
        const couponInput = document.querySelector(`#coupon-${a.id}`)
        const discntof = document.querySelector(`.discntof-${a.id}`)
        let i = 1

        let currentAmount = Number(amountField.value);
        finalPriceField.value = Number(amountField.value)
        document.querySelector(`.payfinalamount-for-${a.id}`).innerHTML = `${currentAmount.toFixed(2)} BDT`
        document.querySelector(`.finaltotalbooks-for-${a.id}`).textContent = `Total Books: ${i}`;
        incBtn.addEventListener("click", () => {
            i++
            totalbks.textContent = Number(i) // 
            document.querySelector(`.finaltotalbooks-for-${a.id}`).textContent = ` ${i}`;
            currentAmount += a.price; // inc by price
            amountField.value = currentAmount;
            finalPriceField.value = currentAmount; // final price
            document.querySelector(`.payfinalamount-for-${a.id}`).innerHTML = `${currentAmount.toFixed(2)} BDT`
        });

        decBtn.addEventListener("click", () => {
            if (currentAmount > a.price) { //  amount doesn't go below base price
                i--
                totalbks.textContent = Number(i)
                document.querySelector(`.finaltotalbooks-for-${a.id}`).textContent = `${i}`;
                currentAmount -= a.price;
                amountField.value = currentAmount;
                finalPriceField.value = currentAmount; //  final price
                document.querySelector(`.payfinalamount-for-${a.id}`).innerHTML = `${currentAmount.toFixed(2)} BDT`
            }
        });

        couponInput.addEventListener("input", () => {
            const couponCode = couponInput.value.trim();
            if (couponCode === "SD2PROJECT") {
                discntof.innerHTML = '10';
                const discountedPrice = currentAmount * 0.9; //  10% discount
                finalPriceField.value = discountedPrice.toFixed(2);
                document.querySelector(`.isusediscount-for-${a.id}`).textContent = `${discntof.innerHTML}%`;
            } else if (couponCode === "NEWYEAR25") {
                discntof.innerHTML = '20';
                const discountedPrice = currentAmount * 0.8; // 20% discount
                finalPriceField.value = discountedPrice.toFixed(2);
                document.querySelector(`.isusediscount-for-${a.id}`).textContent = `${discntof.innerHTML}%`;
            } else {
                discntof.innerHTML = '0'; // Reset discount display
                finalPriceField.value = currentAmount.toFixed(2);
                document.querySelector(`.isusediscount-for-${a.id}`).textContent = `${discntof.innerHTML}%`; // Reset to original if coupon is invalid
            }
        });
        // uuid
        document.querySelector(`.palceorders-for-${a.id}`).addEventListener("click", () => {
            document.getElementById(`orderId-for-${a.id}`).textContent = uniqueOrderId;
        })
        // Confirm Order button
        if (finalPriceField.value != null) {
            confirmOrderBtn.addEventListener("click", async (e) => {
                e.preventDefault();

                const user = auth.currentUser;
                if (!user) {
                    alert("Please log in to place an order.");
                    return;
                }

                const orderId = uniqueOrderId; // Generate a unique order ID
                const orderData = {
                    orderId: orderId,
                    userId: user.uid,
                    bookTitle: a.title,
                    bookAuthor: a.author,
                    totalBooks: i,
                    discount: discntof.innerHTML,
                    totalPrice: finalPriceField.value,
                    timestamp: serverTimestamp()
                };

                try {
                    // Add order to the global "orders" collection
                    await setDoc(doc(db, "orders", orderId), orderData);

                    // Add order to the user's "orders" subcollection
                    await setDoc(doc(db, "users", user.uid, "orders", orderId), orderData);

                    // Remove the book from the cart
                    const docref = doc(db, "users", user.uid, "cart", a.id);
                    await deleteDoc(docref);

                } catch (error) {
                    console.error("Error placing order: ", error);

                }
            });

        } else {
            alert("check your final price carefully")
        }

    });
}

