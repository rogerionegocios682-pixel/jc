// firebase-config.js
// Versão segura: espera receber a configuração em window.__FIREBASE_CONFIG__
// (injete esse objeto no HTML/host em produção). Não commit dados sensíveis.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

if (!window.__FIREBASE_CONFIG__) {
  console.warn('Nenhuma configuração Firebase encontrada em window.__FIREBASE_CONFIG__. Injete as chaves no HTML em produção ou use um arquivo local não comitado.');
}

// Fallback com placeholders para facilitar leitura do repositório
const firebaseConfig = window.__FIREBASE_CONFIG__ || {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "SEU_AUTH_DOMAIN_AQUI",
  databaseURL: "SUA_DATABASE_URL_AQUI",
  projectId: "SEU_PROJECT_ID_AQUI",
  storageBucket: "SEU_STORAGE_BUCKET_AQUI",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID_AQUI",
  appId: "SEU_APP_ID_AQUI",
  measurementId: "SEU_MEASUREMENT_ID_AQUI"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

export { database, auth, firebaseConfig };
