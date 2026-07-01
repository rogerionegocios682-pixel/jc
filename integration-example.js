// integration-example.js
// Integração com Firebase Realtime Database para sincronizar motoboys, orders e dailyReports
// Política adotada: Firebase é a fonte da verdade ("Firebase wins").

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
if (!firebaseConfig) {
  console.error('[integration-example] window.__FIREBASE_CONFIG__ não encontrado. Verifique index.html.');
}

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const PATHS = {
  motoboys: '/motoboys',
  orders: '/orders',
  dailyReports: '/dailyReports'
};

// --- Helpers de conversão ---
function objectValuesToArray(obj) {
  if (!obj) return [];
  if (Array.isArray(obj)) return obj.filter(Boolean);
  return Object.entries(obj).map(([k, v]) => {
    if (v && typeof v === 'object') {
      v._id = v._id || k;
      return v;
    }
    return v;
  });
}

function mapSnapshotObjectToArray(snapshotObj) {
  if (!snapshotObj) return [];
  return Object.keys(snapshotObj).map(k => {
    const o = snapshotObj[k];
    o._id = k;
    return o;
  });
}

// --- Sincronização localStorage / UI ---
function setLocalMotoboys(list) {
  localStorage.setItem('registeredMotoboysDB', JSON.stringify(list));
}

function setLocalOrders(list) {
  localStorage.setItem('ordersReportDB_v1', JSON.stringify(list));
}

function setLocalDailyReports(list) {
  localStorage.setItem('deliveryReportDB_v6', JSON.stringify(list));
}

function callIfExists(fnName) {
  try {
    const fn = window[fnName];
    if (typeof fn === 'function') fn();
  } catch (e) {
    console.warn('[integration-example] erro ao chamar', fnName, e);
  }
}

// --- Handlers de sincronização ---
function handleMotoboysValue(snapshot) {
  const val = snapshot.val();
  const list = objectValuesToArray(val).map(item => {
    if (!item) return null;
    if (typeof item === 'string') return item;
    if (typeof item === 'object') return item.name || item.nome || item.label || item._id || JSON.stringify(item);
    return item;
  }).filter(Boolean);

  // Firebase is source of truth -> replace localStorage
  setLocalMotoboys(list);
  callIfExists('renderMotoboysCrud');
  callIfExists('renderSelectorCheckboxes');
  callIfExists('renderOrdersTable');
}

function syncOrdersFromSnapshot(snapshotObj) {
  const list = mapSnapshotObjectToArray(snapshotObj || {});
  const normalized = list.map(o => ({
    _id: o._id,
    motoboy: o.motoboy || o.driver || 'Desconhecido',
    code: o.code || o.orderCode || o._id,
    bairro: o.bairro || o.neighborhood || '',
    fee: parseFloat(o.fee || o.tax || 0) || 0,
    status: o.status || 'OK',
    createdAt: o.createdAt || o.timestamp || null,
    ...o
  }));

  // Firebase wins
  setLocalOrders(normalized);
  callIfExists('renderOrdersTable');
  callIfExists('calculateOrdersAggregates');
  callIfExists('renderRanking');
}

function syncDailyReportsFromSnapshot(snapshotObj) {
  const list = mapSnapshotObjectToArray(snapshotObj || {});
  const normalized = list.map(r => ({
    _id: r._id,
    name: r.name || r.identificacao || r.title || '',
    date: r.date || r.data || null,
    gas: parseFloat(r.gas || r.gasolina || 0) || 0,
    q1: parseInt(r.q1 || r.qtd1 || 0) || 0,
    v1: parseFloat(r.v1 || r.valor1 || 0) || 0,
    q2: parseInt(r.q2 || r.qtd2 || 0) || 0,
    v2: parseFloat(r.v2 || r.valor2 || 0) || 0,
    fixedPerMoto: parseFloat(r.fixedPerMoto || r.custoFixo || 0) || 0,
    motosCount: parseInt(r.motosCount || r.qtdMotos || 0) || 0,
    createdAt: r.createdAt || r.timestamp || null,
    ...r
  }));

  setLocalDailyReports(normalized);
  if (typeof window.renderMotoboysCrud === 'function') window.renderMotoboysCrud();
  if (typeof window.renderSelectorCheckboxes === 'function') window.renderSelectorCheckboxes();
}

// --- Listeners ---
let listenersInitialized = false;
export function initRealtimeSync() {
  if (listenersInitialized) return;
  listenersInitialized = true;

  const motoboysRef = ref(db, PATHS.motoboys);
  onValue(motoboysRef, snapshot => {
    console.info('[integration-example] motoboys snapshot recebida.');
    handleMotoboysValue(snapshot);
  }, err => {
    console.error('[integration-example] erro ao escutar motoboys:', err);
  });

  const ordersRef = ref(db, PATHS.orders);
  get(ordersRef).then(snap => {
    syncOrdersFromSnapshot(snap.exists() ? snap.val() : {});
  }).catch(err => console.warn('[integration-example] erro ao obter orders (initial):', err));

  onChildAdded(ordersRef, () => {
    get(ordersRef).then(fullSnap => syncOrdersFromSnapshot(fullSnap.exists() ? fullSnap.val() : {}));
  });
  onChildChanged(ordersRef, () => {
    get(ordersRef).then(fullSnap => syncOrdersFromSnapshot(fullSnap.exists() ? fullSnap.val() : {}));
  });
  onChildRemoved(ordersRef, () => {
    get(ordersRef).then(fullSnap => syncOrdersFromSnapshot(fullSnap.exists() ? fullSnap.val() : {}));
  });

  const dailyRef = ref(db, PATHS.dailyReports);
  get(dailyRef).then(snap => {
    syncDailyReportsFromSnapshot(snap.exists() ? snap.val() : {});
  }).catch(err => console.warn('[integration-example] erro ao obter dailyReports (initial):', err));

  onChildAdded(dailyRef, () => get(dailyRef).then(fullSnap => syncDailyReportsFromSnapshot(fullSnap.exists() ? fullSnap.val() : {})));
  onChildChanged(dailyRef, () => get(dailyRef).then(fullSnap => syncDailyReportsFromSnapshot(fullSnap.exists() ? fullSnap.val() : {})));
  onChildRemoved(dailyRef, () => get(dailyRef).then(fullSnap => syncDailyReportsFromSnapshot(fullSnap.exists() ? fullSnap.val() : {})));

  console.info('[integration-example] Listeners inicializados para motoboys, orders e dailyReports.');
}

// --- Funções de escrita (helpers públicos) ---
export function pushOrderToFirebase(orderObj) {
  const ordersRef = ref(db, PATHS.orders);
  const payload = { ...orderObj, createdAt: orderObj.createdAt || Date.now() };
  return push(ordersRef, payload);
}

export function updateOrderInFirebase(id, partial) {
  if (!id) return Promise.reject(new Error('id obrigatório'));
  const node = ref(db, PATHS.orders + '/' + id);
  return update(node, partial);
}

export function removeOrderFromFirebase(id) {
  if (!id) return Promise.reject(new Error('id obrigatório'));
  return remove(ref(db, PATHS.orders + '/' + id));
}

export function pushMotoboyToFirebase(motoboyName) {
  if (!motoboyName) return Promise.reject(new Error('motoboyName obrigatório'));
  const motRef = ref(db, PATHS.motoboys);
  return push(motRef, motoboyName);
}

export function removeMotoboyFromFirebase(id) {
  if (!id) return Promise.reject(new Error('id obrigatório'));
  return remove(ref(db, PATHS.motoboys + '/' + id));
}

export function pushDailyReportToFirebase(reportObj) {
  const dailyRef = ref(db, PATHS.dailyReports);
  const payload = { ...reportObj, createdAt: reportObj.createdAt || Date.now() };
  return push(dailyRef, payload);
}

export function updateDailyReportInFirebase(id, partial) {
  if (!id) return Promise.reject(new Error('id obrigatório'));
  return update(ref(db, PATHS.dailyReports + '/' + id), partial);
}

export function removeDailyReportFromFirebase(id) {
  if (!id) return Promise.reject(new Error('id obrigatório'));
  return remove(ref(db, PATHS.dailyReports + '/' + id));
}

// Expondo helpers no window para que index.html possa chamar sem import
window._jcFirebase = window._jcFirebase || {};
window._jcFirebase.initRealtimeSync = initRealtimeSync;
window._jcFirebase.pushOrderToFirebase = pushOrderToFirebase;
window._jcFirebase.updateOrderInFirebase = updateOrderInFirebase;
window._jcFirebase.removeOrderFromFirebase = removeOrderFromFirebase;
window._jcFirebase.pushMotoboyToFirebase = pushMotoboyToFirebase;
window._jcFirebase.removeMotoboyFromFirebase = removeMotoboyFromFirebase;
window._jcFirebase.pushDailyReportToFirebase = pushDailyReportToFirebase;
window._jcFirebase.updateDailyReportInFirebase = updateDailyReportInFirebase;
window._jcFirebase.removeDailyReportFromFirebase = removeDailyReportFromFirebase;

// Auto-initialize listeners (Firebase wins policy)
// Se preferir inicializar manualmente, comente a linha abaixo.
initRealtimeSync();

console.info('[integration-example] script carregado e sync iniciado (Firebase wins).');
