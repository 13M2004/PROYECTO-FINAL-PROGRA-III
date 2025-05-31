import fetch from "node-fetch";
import { db } from "../agenteVentas/firebase.js";

/**
 * Sincroniza el inventario completo hacia n8n mediante webhook.
 */
export const ejecutarInventario = async () => {
  // Webhook configurable por variable de entorno
  const webhookUrl = process.env.N8N_INVENTARIO_WEBHOOK ||
    "https://primary-production-8238a.up.railway.app/webhook/inventario-agente";

  try {
    // 1. Obtener todos los productos de la colección
    const snapshot = await db.collection("productos").get();
    const productos = snapshot.docs.map(doc => doc.data());

    // 2. Enviar productos al webhook de n8n
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productos }),
    });

    const resultado = await response.text();
    console.log("✅ Flujo n8n ejecutado:", resultado);
  } catch (error) {
    console.error("❌ Error ejecutando flujo de inventario:", error.message);
  }
};
