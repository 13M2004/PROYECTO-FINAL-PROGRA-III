const db = firebase.firestore();

window.addEventListener("DOMContentLoaded", async () => {
  const tabla = document.getElementById("tabla-ventas");

  try {
    const snapshot = await db.collection("ventas").orderBy("fecha", "desc").get();

    if (snapshot.empty) {
      tabla.innerHTML = "<tr><td colspan='5' style='text-align:center;'>⚠️ No hay ventas registradas.</td></tr>";
      return;
    }

    snapshot.forEach(doc => {
      const venta = doc.data();
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${venta.producto}</td>
        <td>${venta.cantidad || 1}</td>
        <td>Q${Number(venta.precio).toFixed(2)}</td>
        <td>${venta.fecha}</td>
        <td>${venta.correo}</td>
      `;

      tabla.appendChild(tr);
    });
  } catch (error) {
    console.error("❌ Error al cargar historial:", error);
    tabla.innerHTML = "<tr><td colspan='5' style='text-align:center;'>❌ Error al cargar historial.</td></tr>";
  }
});

// Función de sidebar
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("hidden");
  document.body.classList.toggle("collapsed");
}


