const firebaseConfig = {
    apiKey: "AIzaSyCkiu1BVSbDJlZKeGVZWIfrVJp63z3faGs",
    authDomain: "doceriaencanto-f9e74.firebaseapp.com",
    projectId: "doceriaencanto-f9e74",
    storageBucket: "doceriaencanto-f9e74.firebasestorage.app",
    messagingSenderId: "623675521052",
    appId: "1:623675521052:web:8287e01047aeed38aa87d9"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();