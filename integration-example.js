// integration-example.js
// Example integration: how to inject the Firebase config and wire new-db.js listeners
// Place the following snippet in your production index.html before loading modules:
//
// <script>
//   window.__FIREBASE_CONFIG__ = {
//     apiKey: "SUA_API_KEY_REAL",
//     authDomain: "jcempreendimentos-ea208.firebaseapp.com",
//     databaseURL: "https://jcempreendimentos-ea208-default-rtdb.firebaseio.com",
//     projectId: "jcempreendimentos-ea208",
//     storageBucket: "jcempreendimentos-ea208.appspot.com",
//     messagingSenderId: "403582280551",
//     appId: "1:403582280551:web:SEU_CODIGO",
//     measurementId: "G-2J5TSC3HEC"
//   };
// </script>
// <script type="module" src="./integration-example.js"></script>

import { subscribeOrders, addOrder } from './new-db.js';

// Safe wrappers that call your existing UI functions if present
function safeCall(fnName, ...args) {
  if (typeof window[fnName] === 'function') {
    try { window[fnName](...args); } catch (err) { console.error('Erro ao executar', fnName, err); }
  }
}

// Subscribe to realtime updates and update the UI
const unsubscribe = subscribeOrders((ordersList) => {
  console.log('[Realtime] Pedidos atualizados', ordersList);
  // These functions are expected to exist in your current index.js
  safeCall('renderOrdersTableFromDB', ordersList);
  safeCall('calculateOrdersAggregates', ordersList);
  safeCall('renderRankingFromOrders', ordersList);
});

// Bind save button (if you don't use inline onclick handlers) — fallback
const saveBtn = document.querySelector('.btn-save');
if (saveBtn) {
  saveBtn.addEventListener('click', async (e) => {
    // Gather fields from the form
    const motoboy = document.getElementById('order-motoboy') ? document.getElementById('order-motoboy').value : '';
    const code = document.getElementById('order-code') ? document.getElementById('order-code').value : '';
    const bairro = document.getElementById('order-bairro') ? document.getElementById('order-bairro').value : '';
    const fee = document.getElementById('order-fee') ? parseFloat(document.getElementById('order-fee').value) || 0 : 0;
    const status = document.getElementById('order-status') ? document.getElementById('order-status').value : 'OK';

    await addOrder({ motoboy, code, bairro, fee, status });
    // UI will update automatically via the realtime listener
  });
} else {
  console.warn('Botão .btn-save não encontrado; mantenha seu onclick atual ou adicione um botão com essa classe para integração automática.');
}

// Export unsubscribe so you can stop listening if needed
export { unsubscribe };
