import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue, push, remove, update } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "jcempreendimentos-ea208.firebaseapp.com",
  databaseURL: "https://jcempreendimentos-ea208-default-rtdb.firebaseio.com",
  projectId: "jcempreendimentos-ea208",
  storageBucket: "jcempreendimentos-ea208.appspot.com",
  messagingSenderId: "..."
};

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

export { database, auth, ref, set, get, onValue, push, remove, update, signInAnonymously, onAuthStateChanged };
