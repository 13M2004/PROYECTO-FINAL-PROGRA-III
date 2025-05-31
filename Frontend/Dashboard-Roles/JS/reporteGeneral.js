const db = firebase.firestore();
const tablaVentas = document.getElementById("tabla-ventas").querySelector("tbody");
const spinner = document.getElementById("spinner");
const mensajeNoDatos = document.getElementById("mensajeNoDatos");
const exportarBtn = document.getElementById("exportar");

let ventas = [];

window.addEventListener("DOMContentLoaded", () => {
  cargarVentas();
  exportarBtn.addEventListener("click", exportarVentas);
});

async function cargarVentas() {
  spinner.style.display = "block"; // Mostrar spinner

  try {
    const snapshot = await db.collection("ventas").get();

    if (snapshot.empty) {
      spinner.style.display = "none";
      mensajeNoDatos.style.display = "block";
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      ventas.push(data);

      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${data.producto}</td>
        <td>Q${Number(data.precio).toFixed(2)}</td>
        <td>${data.correo}</td>
        <td>${data.fecha}</td>
      `;
      tablaVentas.appendChild(fila);
    });

  } catch (error) {
    console.error("❌ Error al obtener ventas:", error);
  } finally {
    spinner.style.display = "none"; // Ocultar spinner al terminar
  }
}

function exportarVentas() {
  if (ventas.length === 0) {
    alert("No hay datos para exportar.");
    return;
  }

  const csv = "Producto,Precio,Correo,Fecha\n" + ventas.map(v => 
    `${v.producto},${v.precio},${v.correo},${v.fecha}`).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "reporte_ventas.csv";
  a.click();
  URL.revokeObjectURL(url);
}
