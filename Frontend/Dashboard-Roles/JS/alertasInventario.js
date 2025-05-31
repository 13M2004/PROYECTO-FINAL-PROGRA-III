// alertasInventario.js
import { db } from "../../JS/firebaseConfig.js";

document.addEventListener("DOMContentLoaded", async () => {
  const lista = document.getElementById("lista-alertas");

  try {
    const snapshot = await db.collection("productos").get();

    snapshot.forEach(doc => {
      const producto = doc.data();
      if (producto.stock <= 5) {
        const div = document.createElement("div");
        div.classList.add("alerta");
        div.innerHTML = `
          <strong>${producto.nombre}</strong><br>
          <span class="stock">Stock bajo: ${producto.stock}</span>
        `;
        lista.appendChild(div);
      }
    });

    if (lista.innerHTML.trim() === "") {
      lista.innerHTML = "<p style='color: green;'>✅ Todos los productos tienen stock suficiente.</p>";
    }

  } catch (error) {
    console.error("Error al obtener productos:", error);
    lista.innerHTML = "<p style='color: red;'>❌ Error al cargar alertas.</p>";
  }
});
