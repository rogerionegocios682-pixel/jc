Realtime Sync (Firebase Realtime Database) - Integration notes

This branch adds a small realtime database wrapper (new-db.js) and an example integration file (integration-example.js) that demonstrates how to wire realtime listeners to your existing UI.

How it works
- new-db.js exposes: addOrder, updateOrder, removeOrder, subscribeOrders, subscribeOrderAdds, subscribeDailyReports, addDailyReport.
- subscribeOrders uses onValue() to receive the full orders list any time it changes; on each update it calls your rendering functions.
- integration-example.js shows a minimal way to inject the Firebase config at runtime and wire the listener to your UI functions (renderOrdersTableFromDB, calculateOrdersAggregates, renderRankingFromOrders).

Important: inject the Firebase config at runtime
- For security, you should not commit real API keys to the repository. Instead, inject them into the page before modules load:

<script>
  window.__FIREBASE_CONFIG__ = {
    apiKey: "SUA_API_KEY_REAL",
    authDomain: "jcempreendimentos-ea208.firebaseapp.com",
    databaseURL: "https://jcempreendimentos-ea208-default-rtdb.firebaseio.com",
    projectId: "jcempreendimentos-ea208",
    storageBucket: "jcempreendimentos-ea208.appspot.com",
    messagingSenderId: "403582280551",
    appId: "1:403582280551:web:SEU_CODIGO",
    measurementId: "G-2J5TSC3HEC"
  };
</script>
<script type="module" src="/integration-example.js"></script>

Testing steps (PC + Mobile)
1. Deploy or serve the site with the injected config snippet above in the index.html.
2. Open the site on PC and on a mobile device simultaneously.
3. Create a new order on one device; the other device should receive the update in seconds (via realtime listener).
4. If updates don't appear, check the browser Console for errors and confirm the databaseURL matches the Firebase project.

Security and next actions
- Rotate or regenerate API keys if they were exposed publicly.
- Update Realtime Database rules to require authentication before deploying to production.
- Consider switching to Firestore if you need stronger offline caching on web clients.
