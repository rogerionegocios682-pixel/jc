// new-db.js
// Wrapper module for Realtime Database operations and realtime listeners
// Usage: import { subscribeOrders, addOrder, updateOrder, removeOrder } from './new-db.js'
import { ref, push, set, update, remove, onValue, onChildAdded, onChildChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";
import { database } from './firebase-config.js';

const ORDERS_PATH = 'orders';
const DAILY_PATH = 'dailyReports';

export async function addOrder(order) {
  const node = ref(database, ORDERS_PATH);
  const newRef = push(node);
  const payload = {
    motoboy: order.motoboy || '',
    code: order.code || '',
    bairro: order.bairro || '',
    fee: Number(order.fee || 0),
    status: order.status || 'OK',
    createdAt: Date.now()
  };
  await set(newRef, payload);
  return newRef.key;
}

export async function updateOrder(key, updates) {
  const node = ref(database, `${ORDERS_PATH}/${key}`);
  await update(node, { ...updates, updatedAt: Date.now() });
}

export async function removeOrder(key) {
  const node = ref(database, `${ORDERS_PATH}/${key}`);
  await remove(node);
}

// Subscribe to the full orders list. Callback receives an array of { key, ...data }
export function subscribeOrders(callback) {
  const node = ref(database, ORDERS_PATH);
  return onValue(node, snapshot => {
    const data = snapshot.val() || {};
    const list = Object.entries(data).map(([key, val]) => ({ key, ...val }));
    callback(list);
  });
}

// Subscribe to child added events for incremental UI updates
export function subscribeOrderAdds(onAddCallback) {
  const node = ref(database, ORDERS_PATH);
  return onChildAdded(node, snapshot => {
    onAddCallback({ key: snapshot.key, ...snapshot.val() });
  });
}

// Subscribe to daily reports
export function subscribeDailyReports(callback) {
  const node = ref(database, DAILY_PATH);
  return onValue(node, snapshot => {
    const data = snapshot.val() || {};
    const list = Object.entries(data).map(([key, val]) => ({ key, ...val }));
    callback(list);
  });
}

export async function addDailyReport(report) {
  const node = ref(database, DAILY_PATH);
  const newRef = push(node);
  const payload = {
    title: report.title || '',
    date: report.date || new Date().toISOString(),
    motosCount: Number(report.motosCount || 0),
    q1: Number(report.q1 || 0),
    v1: Number(report.v1 || 0),
    q2: Number(report.q2 || 0),
    v2: Number(report.v2 || 0),
    gas: Number(report.gas || 0),
    createdAt: Date.now()
  };
  await set(newRef, payload);
  return newRef.key;
}
