// Core/index.js

// Cargar variables de entorno
import dotenv from "dotenv";
dotenv.config();

// Librerías
import express from "express";
import cors from "cors";

// Servicios
import { procesarCompra } from "../agenteVentas/ventasService.js";
import { ejecutarInventario } from "../agenteInventario/inventarioService.js";
import { db } from "../agenteVentas/firebase.js";

// Inicializar Express
const app = express();

// === Configuración CORS PRO ===
const whitelist = [
  "http://127.0.0.1:5500",     // VS Code Live Server local
  "http://localhost:5500",     // Variante local (Live Server o local dev)
  // "https://TUDOMINIO.com"   // <-- Agrega aquí tu dominio en producción, si lo tienes
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Permite requests sin origin (como Postman) o si está en la whitelist
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

// --- RUTAS PRINCIPALES ---

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
