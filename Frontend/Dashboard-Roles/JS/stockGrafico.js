import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { firebaseConfig } from "../JS/firebaseConfig.js";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Mostrar spinner
function mostrarSpinner() {
  const spinner = document.createElement("div");
  spinner.id = "spinner";
  spinner.innerHTML = "Cargando datos...";
  spinner.style.textAlign = "center";
  spinner.style.marginTop = "20px";
  document.querySelector(".content").appendChild(spinner);
}

// Ocultar spinner
function ocultarSpinner() {
  const spinner = document.getElementById("spinner");
  if (spinner) spinner.remove();
}

// Función para obtener productos y generar gráfico
async function generarGraficoStock() {
  mostrarSpinner();

  const categorias = {};
  const querySnapshot = await getDocs(collection(db, "productos"));

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (!categorias[data.categoria]) {
      categorias[data.categoria] = 0;
    }
    categorias[data.categoria] += data.stock;
  });

  ocultarSpinner();

  const labels = Object.keys(categorias);
  const dataValues = Object.values(categorias);

  const ctx = document.getElementById("graficoStock").getContext("2d");

  if (labels.length === 0) {
    ctx.font = "20px Arial";
    ctx.fillText("⚠️ No hay productos disponibles para mostrar.", 50, 100);
    return;
  }

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Stock por categoría",
          data: dataValues,
          backgroundColor: [
            "#3498db",
            "#e74c3c",
            "#2ecc71",
            "#f1c40f",
            "#9b59b6",
          ],
          borderRadius: 8, // <-- Redondeo de esquinas
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "📦 Inventario por Categoría",
          font: { size: 18 },
        },
      },
    },
  });
}

// Ejecutar
window.addEventListener("DOMContentLoaded", generarGraficoStock);
