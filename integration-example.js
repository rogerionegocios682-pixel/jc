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

function initializeCloudSync() {
    if (!firebaseConfig) {
        console.error('[integration-example] window.__FIREBASE_CONFIG__ não encontrada.');
        return;
    }
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    console.log('[integration-example] Firebase inicializado com sucesso.');
    
    // Ativa os ouvintes em tempo real
   // Escuta ativa para atualizar a página com as funções reais do sistema
function startLiveListening() {
    if (!db) return;

    // Quando um motoboy for adicionado por qualquer aparelho
    onChildAdded(ref(db, 'motoboys'), (snapshot) => {
        // Atualiza as listas e checkboxes de motoboys na tela
        if (typeof window.renderMotoboysCrud === 'function') {
            window.renderMotoboysCrud();
        }
        if (typeof window.renderSelectorCheckboxes === 'function') {
            window.renderSelectorCheckboxes();
        }
    });

    // Quando um pedido for adicionado por qualquer aparelho
    onChildAdded(ref(db, 'orders'), (snapshot) => {
        if (typeof window.renderOrdersTable === 'function') {
            window.renderOrdersTable();
        }
    });
};
}

// --- FUNÇÕES DE EXPORTAÇÃO QUE O INDEX.HTML PROCURA ---

function addMotoboyToCloud(motoboy) {
    if (!db) return;
    const dbRef = ref(db, 'motoboys');
    return push(dbRef, motoboy);
}

function deleteMotoboyFromCloud(id) {
    if (!db) return;
    const dbRef = ref(db, `motoboys/${id}`);
    return remove(dbRef);
}

function saveOrderToCloud(order) {
    if (!db) return;
    const dbRef = ref(db, 'orders');
    return push(dbRef, order);
}

function saveDailyCostToCloud(cost) {
    if (!db) return;
    const dbRef = ref(db, 'dailyReports');
    // (Caso houvesse mais código interno de saveDailyCost aqui, certifique-se de manter. Se era só isso:)
}

// Agora sim, a função startLiveListening totalmente fora da outra:
function startLiveListening() {
    if (!db) return;

    // Quando um motoboy for adicionado por qualquer aparelho
    onChildAdded(ref(db, 'motoboys'), (snapshot) => {
        if (typeof window.carregarMotoboys === 'function') {
            window.carregarMotoboys();
        }
    });

    // Quando um pedido for adicionado por qualquer aparelho
    onChildAdded(ref(db, 'orders'), (snapshot) => {
        if (typeof window.carregarPedidos === 'function') {
            window.carregarPedidos();
        }
    });
}
