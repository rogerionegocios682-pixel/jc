// --- Sincronização Firebase sem módulos ---
function initializeCloudSync() {
    const firebaseConfig = window.__FIREBASE_CONFIG__;
    if (!firebaseConfig) {
        console.error('[integration-example] window.__FIREBASE_CONFIG__ não encontrada.');
        return;
    }
    const app = initializeApp(firebaseConfig);
    window.db = getDatabase(app);
    console.log('[integration-example] Firebase inicializado com sucesso.');
}

function startLiveListening() {
    if (!window.db) return;
    onChildAdded(ref(window.db, 'motoboys'), (snapshot) => {
        if (typeof window.renderMotoboysCrud === 'function') window.renderMotoboysCrud();
    });
}
