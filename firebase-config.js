// =====================================================
// CONFIGURAÇÃO FIREBASE - SINCRONIZAÇÃO EM TEMPO REAL
// =====================================================
// Substitua as credenciais pelas suas do Firebase Console

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue, push, remove, update } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// 🔧 CONFIGURE COM SUAS CREDENCIAIS DO FIREBASE
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Autenticação anônima (muda depois para email se necessário)
let currentUser = null;
signInAnonymously(auth)
  .then(() => console.log("✅ Conectado ao Firebase"))
  .catch(error => console.error("❌ Erro de autenticação:", error));

onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

// =====================================================
// FUNÇÕES DE SINCRONIZAÇÃO
// =====================================================

// 📊 SALVAR CUSTO DIÁRIO (com sincronização em tempo real)
export function saveDailyCostToCloud(costData) {
  if (!currentUser) {
    console.warn("⚠️ Usuário não autenticado");
    return;
  }

  const costRef = ref(db, `companies/${currentUser.uid}/daily-costs/${Date.now()}`);
  set(costRef, {
    ...costData,
    timestamp: new Date().toISOString(),
    synced: true
  }).then(() => {
    console.log("✅ Custo diário salvo na nuvem");
    showSyncNotification("Custo salvo com sucesso na nuvem!");
  }).catch(err => console.error("❌ Erro ao salvar:", err));
}

// 📝 SALVAR PEDIDO/ENTREGA (com sincronização em tempo real)
export function saveOrderToCloud(orderData) {
  if (!currentUser) {
    console.warn("⚠️ Usuário não autenticado");
    return;
  }

  const orderRef = ref(db, `companies/${currentUser.uid}/orders/${Date.now()}`);
  set(orderRef, {
    ...orderData,
    timestamp: new Date().toISOString(),
    synced: true
  }).then(() => {
    console.log("✅ Pedido salvo na nuvem");
    showSyncNotification("Pedido registrado com sucesso!");
  }).catch(err => console.error("❌ Erro ao salvar:", err));
}

// 👥 SINCRONIZAR LISTA DE MOTOBOYS
export function syncMotoboysList() {
  if (!currentUser) return;

  const motoboyRef = ref(db, `companies/${currentUser.uid}/motoboys`);
  
  onValue(motoboyRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const motoboysList = Object.values(data).map(m => m.name);
      localStorage.setItem('registeredMotoboysDB', JSON.stringify(motoboysList));
      console.log("🔄 Motoboys sincronizados:", motoboysList);
      // Renderizar atualizado
      if (window.renderMotoboysCrud) {
        window.renderMotoboysCrud();
        window.renderSelectorCheckboxes();
      }
    }
  });
}

// 📋 SINCRONIZAR PEDIDOS EM TEMPO REAL
export function syncOrdersRealtime() {
  if (!currentUser) return;

  const ordersRef = ref(db, `companies/${currentUser.uid}/orders`);
  
  onValue(ordersRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const ordersList = Object.values(data);
      localStorage.setItem('ordersReportDB_v1', JSON.stringify(ordersList));
      console.log("🔄 Pedidos sincronizados em tempo real");
      // Renderizar atualizado
      if (window.renderOrdersTable) {
        window.renderOrdersTable();
        window.calculateOrdersAggregates();
        window.renderRanking();
      }
    }
  });
}

// 📊 SINCRONIZAR CUSTOS DIÁRIOS EM TEMPO REAL
export function syncDailyCostsRealtime() {
  if (!currentUser) return;

  const costsRef = ref(db, `companies/${currentUser.uid}/daily-costs`);
  
  onValue(costsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const costsList = Object.values(data);
      localStorage.setItem('deliveryReportDB_v6', JSON.stringify(costsList));
      console.log("🔄 Custos sincronizados em tempo real");
      // Renderizar atualizado
      if (window.renderReportTable) {
        window.renderReportTable();
      }
    }
  });
}

// ✅ ADICIONAR MOTOBOY À NUVEM
export function addMotoboyToCloud(name) {
  if (!currentUser) return;

  const motoboyRef = ref(db, `companies/${currentUser.uid}/motoboys`);
  const newMotoboyRef = push(motoboyRef);
  set(newMotoboyRef, {
    name: name,
    addedAt: new Date().toISOString()
  }).then(() => {
    console.log("✅ Motoboy adicionado à nuvem");
  }).catch(err => console.error("❌ Erro:", err));
}

// ❌ DELETAR MOTOBOY
export function deleteMotoboyFromCloud(name) {
  if (!currentUser) return;

  const motoboyRef = ref(db, `companies/${currentUser.uid}/motoboys`);
  get(motoboyRef).then(snapshot => {
    snapshot.forEach(child => {
      if (child.val().name === name) {
        remove(child.ref);
      }
    });
  });
}

// 🔄 SINCRONIZAR TUDO (chamar ao abrir a página)
export function initializeCloudSync() {
  syncMotoboysList();
  syncOrdersRealtime();
  syncDailyCostsRealtime();
  console.log("☁️ Sincronização em tempo real iniciada");
}

// 📱 MOSTRAR NOTIFICAÇÃO DE SINCRONIZAÇÃO
function showSyncNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #22c55e;
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

export { db, auth, currentUser };
