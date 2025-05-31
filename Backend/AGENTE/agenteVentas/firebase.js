// agenteVentas/firebase.js

import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// 🧭 Obtener ruta absoluta del archivo actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Ruta absoluta hacia claveFirebase.json
const rutaClave = path.join(__dirname, "claveFirebase.json");

let serviceAccount;
try {
  const rawData = fs.readFileSync(rutaClave, "utf-8");
  serviceAccount = JSON.parse(rawData);
} catch (err) {
  console.error("❌ Error leyendo claveFirebase.json:", err.message);
  process.exit(1);
}

// ✅ Inicializar Firebase Admin solo una vez
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// 📦 Exportar instancia de Firestore
const db = admin.firestore();
export { db };
