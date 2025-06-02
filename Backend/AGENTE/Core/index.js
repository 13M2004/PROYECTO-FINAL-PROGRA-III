// Core/index.js

import dotenv from "dotenv";
// IMPORTANTE: carga el .env desde la raíz de AGENTE (¡ya está bien ubicado!)
dotenv.config();

// DEPURACIÓN: verifica si la variable se detecta
console.log("DEBUG FIREBASE_PRIVATE_KEY:", process.env.FIREBASE_PRIVATE_KEY ? "DETECTADA" : "NO DETECTADA");

import express from "express";
import cors from "cors";

import { procesarCompra } from "../agenteVentas/ventasService.js";
import { ejecutarInventario } from "../agenteInventario/inventarioService.js";
import { db } from "../agenteVentas/firebase.js";

const app = express();

// === Configuración de CORS PRO ===
const whitelist = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  // "https://TUDOMINIO.com" // Agrega tu dominio aquí si tienes frontend en producción
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir requests desde tools sin origin (Postman, curl), o si están en whitelist
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("No permitido por CORS: " + origin));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());

// --- Rutas principales ---

// Procesar una compra (Agente de Ventas)
app.post("/comprar", async (req, res) => {
  const { productos, correo } = req.body;
  try {
    const msg = await procesarCompra(productos, correo);
    res.status(200).send(msg);
  } catch (error) {
    console.error("❌ Error procesando compra:", error.message);
    res.status(400).send(error.message);
  }
});

// Exportar el inventario a Google Sheets (Agente de Inventario)
app.post("/ejecutar-inventario", async (req, res) => {
  try {
    await ejecutarInventario();
    res.status(200).send("✅ Inventario exportado a Google Sheets.");
  } catch (error) {
    console.error("❌ Error exportando inventario:", error.message);
    res.status(500).send("Error exportando inventario.");
  }
});

// Obtener todos los productos del inventario (usado por n8n)
app.get("/productos", async (req, res) => {
  try {
    const snapshot = await db.collection("productos").get();
    const productos = snapshot.docs.map(doc => doc.data());
    res.status(200).json({ productos });
  } catch (error) {
    console.error("❌ Error al obtener productos:", error.message);
    res.status(500).send("Error obteniendo productos");
  }
});

// Puerto de ejecución
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en http://localhost:${PORT} o en Railway`);
});
