import { db } from "../agenteVentas/firebase.js";
import fetch from "node-fetch";

/**
 * Envía una alerta de stock crítico o producto agotado vía Telegram usando n8n
 * @param {string} producto - Nombre del producto
 * @param {number} stock - Stock actual del producto
 */
export async function enviarAlertaStock(producto, stock) {
  // Webhook n8n para alertas en Telegram
  const webhook = process.env.N8N_ALERTAS_WEBHOOK || "https://primary-production-8238a.up.railway.app/webhook/alertas-telegram";

  // Obtener hora exacta
  const fecha = new Date();
  const opcionesFecha = {
    timeZone: "America/Guatemala",
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  };
  const horaExacta = fecha.toLocaleString('es-GT', opcionesFecha);

  // Definir mensaje según stock
  let mensaje = "";

  if (stock === 0) {
    mensaje = `🚨 *Producto AGOTADO*\n\n🛒 Producto: *${producto}*\n📦 Stock actual: *0* unidades.\n🕒 Hora: ${horaExacta}\n\n_¡Urgente reposición requerida!_`;
  } else {
    mensaje = `⚠️ *Stock crítico detectado*\n\n🛒 Producto: *${producto}*\n📦 Stock actual: *${stock}* unidades.\n🕒 Hora: ${horaExacta}\n\n_Considera hacer nuevo pedido pronto._`;
  }

  // Enviar mensaje al webhook de n8n (alertas-telegram)
  const response = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mensaje
    }),
  });

  if (!response.ok) throw new Error("❌ Error enviando alerta a n8n (Telegram).");
}
