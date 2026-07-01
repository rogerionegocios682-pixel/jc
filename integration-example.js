import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { 
    getDatabase, 
    ref, 
    onChildAdded, 
    onChildChanged, 
    onChildRemoved, 
    onValue, 
    push, 
    update, 
    remove, 
    get 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Usa a configuração já definida em index.html
const firebaseConfig = window.__FIREBASE_CONFIG__;
let db;

export function initializeCloudSync() {
    if (!firebaseConfig) {
        console.error('[integration-example] window.__FIREBASE_CONFIG__ não encontrada.');
        return;
    }
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    console.log('[integration-example] Firebase inicializado com sucesso.');
}

// --- FUNÇÕES DE EXPORTAÇÃO QUE O INDEX.HTML PROCURA ---

export function addMotoboyToCloud(motoboy) {
    if (!db) return;
    const dbRef = ref(db, 'motoboys');
    return push(dbRef, motoboy);
}

export function deleteMotoboyFromCloud(id) {
    if (!db) return;
    const dbRef = ref(db, `motoboys/${id}`);
    return remove(dbRef);
}

export function saveOrderToCloud(order) {
    if (!db) return;
    const dbRef = ref(db, 'orders');
    return push(dbRef, order);
}

export function saveDailyCostToCloud(cost) {
    if (!db) return;
    const dbRef = ref(db, 'dailyReports');
    return push(dbRef, cost);
}
