// Aguarda o Firebase carregar
function initializeCloudSync() {
    if (typeof firebase === 'undefined') {
        console.error('[integration-example] Firebase SDK não carregado.');
        return;
    }
    const firebaseConfig = window.__FIREBASE_CONFIG__;
    if (!firebaseConfig) {
        console.error('[integration-example] Configuração não encontrada.');
        return;
    }
    const app = firebase.initializeApp(firebaseConfig);
    window.db = firebase.database();
    console.log('[integration-example] Firebase inicializado.');
}

function startLiveListening() {
    if (!window.db) return;
    // Usa o namespace global firebase.database
    firebase.database().ref('motoboys').on('child_added', (snapshot) => {
        if (typeof window.renderMotoboysCrud === 'function') window.renderMotoboysCrud();
    });
}
