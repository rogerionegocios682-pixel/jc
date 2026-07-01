import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue, push, remove, update } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBP1creZJ_YwNKGNq8yI3Hr3MffE4smPl4",
  authDomain: "jcempreendimentos-ea208.firebaseapp.com",
  databaseURL: "https://jcempreendimentos-ea208-default-rtdb.firebaseio.com",
  projectId: "jcempreendimentos-ea208",
  storageBucket: "jcempreendimentos-ea208.firebasestorage.app",
  messagingSenderId: "403582280551",
  appId: "1:403582280551:web:d27bc852d4684b713785c2",
  measurementId: "G-2J5TSC3HEC"
};

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

export { database, auth, ref, set, get, onValue, push, remove, update, signInAnonymously, onAuthStateChanged };
