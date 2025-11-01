// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC7draXchRUCkK1Hut1eD-Km1_Y4f_AtCU",
    authDomain: "goatique-536bd.firebaseapp.com",
    projectId: "goatique-536bd",
    storageBucket: "goatique-536bd.firebasestorage.app",
    messagingSenderId: "63709506575",
    appId: "1:63709506575:web:864e9369dcf7021859077a",
    measurementId: "G-63D52N4Z66"
};

// Initialize Firebase only if it hasn't been initialized yet
let app, auth, db, storage;

try {
    if (!firebase.apps.length) {
        app = firebase.initializeApp(firebaseConfig);
        console.log('Firebase initialized successfully');
    } else {
        app = firebase.app();
        console.log('Using existing Firebase app');
    }

    // Initialize services
    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage();

    // Make them globally available
    window.auth = auth;
    window.db = db;
    window.storage = storage;

    // Enable offline persistence
    db.enablePersistence()
        .catch((err) => {
            if (err.code === 'failed-precondition') {
                console.log('Persistence failed: Multiple tabs open');
            } else if (err.code === 'unimplemented') {
                console.log('Persistence is not supported by this browser');
            } else {
                console.error('Error enabling offline persistence:', err);
            }
        });

    console.log('Firebase services initialized');
} catch (error) {
    console.error('Firebase initialization error:', error);
    
    // If there's an error, try to delete the app and reinitialize
    if (firebase.apps.length) {
        firebase.app().delete()
            .then(() => {
                console.log('Deleted existing Firebase app, please refresh the page');
            })
            .catch(deleteError => {
                console.error('Error deleting Firebase app:', deleteError);
            });
    }
}
