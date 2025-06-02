import fetch from "node-fetch";
import { db } from "./firebase.js";
import { enviarAlertaStock } from "../agenteAlertas/alertasService.js";

/**
 * Procesa la compra de productos:
 * - Valida datos
 * - Registra la venta
 * - Actualiza el stock
 * - Lanza webhooks: facturación, Sheets, alertas, inventario
 */
export async function procesarCompra(productos, correo) {
  if (!Array.isArray(productos) || productos.length === 0 || !correo?.includes("@")) {
    throw new Error("Datos incompletos o inválidos.");
  }

  const fecha = new Date().toISOString().split("T")[0];
  let total = 0;
  const productosProcesados = [];

  // 🔄 Procesar cada producto del carrito
  for (const item of productos) {
    // Busca el producto en la base de datos
    const snapshot = await db.collection("productos").where("nombre", "==", item.nombre).get();

    if (snapshot.empty) {
      console.log(`❌ Producto no encontrado: ${item.nombre}`);
      continue;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    if (data.stock < item.cantidad) {
      console.log(`⚠️ Stock insuficiente para: ${item.nombre}`);
      continue;
    }

    // Registrar venta
    await db.collection("ventas").add({
      producto: item.nombre,
      precio: Number(data.precio),
      cantidad: item.cantidad,
      fecha,
      correo,
    });

    // Actualizar stock
    await db.collection("productos").doc(doc.id).update({
      stock: data.stock - item.cantidad,
    });

    productosProcesados.push({
      producto: item.nombre,
      precio: Number(data.precio),
      cantidad: item.cantidad,
      fecha,
      correo,
    });

    total += Number(data.precio) * item.cantidad;
    console.log(`✅ Venta registrada: ${item.nombre} x${item.cantidad}`);
  }

  if (total === 0) {
    throw new Error("Ningún producto fue procesado. Verifica stock.");
  }

  // 📦 Webhook → Facturación (variable de entorno para flexibilidad)
  const webhookFacturacion = process.env.N8N_FACTURACION_WEBHOOK || 
    "https://primary-production-8238a.up.railway.app/webhook/b8e25908-f899-4a5c-b7d4-1494f35b2216";
  await fetch(webhookFacturacion, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productos, fecha, total, correo }),
  }).catch(err => console.error("❌ Error en facturación:", err.message));

  // 📄 Webhook → Registro en Google Sheets
  const webhookSheets = process.env.N8N_SHEETS_WEBHOOK ||
    "https://primary-production-8238a.up.railway.app/webhook/e12b251b-7baf-4748-8f8c-c6409627cdbf";
  for (const venta of productosProcesados) {
    await fetch(webhookSheets, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(venta),
    }).catch(err => console.error("❌ Error en Sheets:", err.message));
  }

  // 🚨 Webhook → Alerta por stock crítico (vía Telegram)
  for (const item of productosProcesados) {
    const snap = await db.collection("productos").where("nombre", "==", item.producto).get();
    const info = snap.docs[0]?.data();

    if (info?.stock <= 5) {
      await enviarAlertaStock(item.producto, info.stock);
    }
  }

  // === 👉🏽 Sincronizar inventario completo con n8n (inventario-agente) ===
  try {
    // Obtener todo el inventario actualizado
    const inventarioSnapshot = await db.collection("productos").get();
    const inventarioCompleto = inventarioSnapshot.docs.map(doc => doc.data());

    // Webhook inventario-agente
    const webhookInventario = process.env.N8N_INVENTARIO_WEBHOOK ||
      "https://primary-production-8238a.up.railway.app/webhook/inventario-agente";

    // Enviar inventario completo a n8n
    await fetch(webhookInventario, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productos: inventarioCompleto }),
    });

    console.log("✅ Inventario sincronizado con n8n (inventario-agente)");
  } catch (err) {
    console.error("❌ Error al sincronizar inventario con n8n:", err.message);
  }

  return "Compra procesada correctamente.";
}
