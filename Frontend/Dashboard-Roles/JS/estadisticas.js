const db = firebase.firestore();

async function cargarEstadisticas() {
  const spinner = document.getElementById("spinner");
  const mensajeNoDatos = document.getElementById("mensajeNoDatos");
  const tituloDinamico = document.getElementById("titulo-dinamico");

  spinner.style.display = "block"; // Mostrar spinner mientras carga

  const contador = {
    laptop: 0,
    teclado: 0,
    mouse: 0
  };

  try {
    const snapshot = await db.collection("ventas").get();

    if (snapshot.empty) {
      spinner.style.display = "none";
      mensajeNoDatos.style.display = "block";
      tituloDinamico.innerText = "No hay ventas registradas hasta el momento";
      return;
    }

    snapshot.forEach(doc => {
      const venta = doc.data();
      const producto = venta.producto.toLowerCase();

      if (producto.includes("laptop")) contador.laptop++;
      else if (producto.includes("teclado")) contador.teclado++;
      else if (producto.includes("mouse")) contador.mouse++;
    });

    generarGrafico(contador);
  } catch (error) {
    console.error("❌ Error al cargar ventas:", error);
  } finally {
    spinner.style.display = "none"; // Quitar spinner después de cargar
  }
}

function generarGrafico(contador) {
  const ctx = document.getElementById("graficoVentas").getContext("2d");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Laptops", "Teclados", "Mouse"],
      datasets: [{
        label: "Ventas Totales",
        data: [contador.laptop, contador.teclado, contador.mouse],
        backgroundColor: ["#3498db", "#e67e22", "#2ecc71"],
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: "Ventas por Categoría" }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Cantidad Vendida" }
        }
      }
    }
  });
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("hidden");
}

function cerrarSesion() {
  window.location.href = "../../HTML/login.html";
}

// 🔥 Ejecutar cuando cargue
cargarEstadisticas();
