import { db } from "../agenteVentas/firebase.js";
import fetch from "node-fetch";

/**
 * Genera la factura y la envía al webhook de n8n para procesamiento y PDF.
 */
export async function generarFactura(datosVenta) {
  const { productos, total, fecha, correo } = datosVenta;

  // 🧠 Generar descripción detallada con cantidades
  const descripcionGPT = productos.map(p =>
    `• ${p.producto} x${p.cantidad} - Q${(p.precio * p.cantidad).toFixed(2)}`
  ).join("\n");

  // Arma la info que se mandará a n8n
  const factura = { fecha, correo, total, productos, descripcionGPT };

  // 🔎 Verificar salida en consola (debug)
  console.log("📄 Factura generada (simulada):", factura);

  // 🚀 Enviar al webhook de n8n (factura-agente)
  const webhook = "https://primary-production-8238a.up.railway.app/webhook/b8e25908-f899-4a5c-b7d4-1494f35b2216";
  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(factura),
    });

    if (!response.ok) {
      throw new Error("❌ Error enviando la factura a n8n (factura-agente).");
    }
  } catch (err) {
    console.error(err.message);
  }

  // Puedes retornar la factura si necesitas seguir usando la info
  return factura;
}
