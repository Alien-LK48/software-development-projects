const admin = require("firebase-admin");
const fs = require("fs");

// Initialize Firebase Admin SDK
const serviceAccount = require("./servicekey.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    //databaseURL: "https://boi-brekkho-default-rtdb.firebaseio.com"
    databaseURL: "https://sd2-cse2291-default-rtdb.firebaseio.com"
});

const firestore = admin.firestore();

// Load JSON file
const data = JSON.parse(fs.readFileSync("alldata.json", "utf8"));

async function importData() {
    try {
        // Flatten the books array to get the books directly
        const books = data.__collections__.books[0]; // Access the first array inside books
        const batch = firestore.batch();

        books.forEach((guide) => {
            const docRef = firestore.collection("books").doc(); // Auto-generate ID
            batch.set(docRef, guide);
        });

        await batch.commit();
        console.log("Data imported successfully with auto-generated IDs!");
    } catch (error) {
        console.error("Error importing data:", error);
    }
}

importData();
