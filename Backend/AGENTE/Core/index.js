// === Cargar variables de entorno (.env) ===
import dotenv from "dotenv";
dotenv.config(); // ¡Siempre primero!

// === Importar librerías principales ===
import express from "express";
import cors from "cors";

// === Importar servicios de tus agentes ===
import { procesarCompra } from "../agenteVentas/ventasService.js";
import { ejecutarInventario } from "../agenteInventario/inventarioService.js";
import { db } from "../agenteVentas/firebase.js";

// === Definir Whitelist de dominios frontend permitidos ===
const whitelist = [
  "http://127.0.0.1:5500",                                 // Tu frontend local (Live Server)
  "http://localhost:5500",                                 // Otra variante de Live Server
  "https://proyecto-final-progra-iii-production.up.railway.app" // Railway, si algún día sirves HTML ahí
];

// === Instanciar Express ===
const app = express(); // Siempre primero

// === Middleware CORS ===
app.use(
  cors({
    origin: function (origin, callback) {
      // Permite si el origin está en la whitelist o si no hay origin (ej: Postman)
      if (!origin || whitelist.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("No permitido por CORS: " + origin));
      }
    },
    credentials: true, // Permite cookies/sesiones si usas
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// === Middleware para JSON ===
app.use(express.json());

// =====================
// === RUTAS PRINCIPALES ===
// =====================

// --- Ruta raíz para prueba y status ---
app.get("/", (req, res) => {
  res.status(200).send("✅ Backend AutoGestiónTech activo.");
});

// --- Procesar una compra (Agente de Ventas) ---
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

// --- Exportar inventario a Google Sheets (Agente de Inventario) ---
app.post("/ejecutar-inventario", async (req, res) => {
  try {
    await ejecutarInventario();
    res.status(200).send("✅ Inventario exportado a Google Sheets.");
  } catch (error) {
    console.error("❌ Error exportando inventario:", error.message);
    res.status(500).send("Error exportando inventario.");
  }
});

// --- Obtener todos los productos del inventario (n8n, pruebas, etc.) ---
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

// === Arrancar servidor ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en http://localhost:${PORT} o en Railway`);
});
