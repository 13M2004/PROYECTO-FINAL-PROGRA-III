function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("hidden");
  document.body.classList.toggle("collapsed");
}

async function exportarInventario() {
  const spinner = document.getElementById("spinner");

  try {
    const confirmacion = confirm("¿Estás seguro de que deseas exportar el inventario?");
    if (!confirmacion) return;

    spinner.innerHTML = "⏳ Exportando inventario, por favor espera...";

    const respuesta = await fetch("https://primary-production-8238a.up.railway.app/webhook/inventario-agente", {
      method: "POST"
    });

    if (!respuesta.ok) {
      throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
    }

    const mensaje = await respuesta.text();
    alert("✅ Inventario exportado con éxito:\n" + mensaje);
    spinner.innerHTML = "✅ Exportación finalizada.";

  } catch (error) {
    console.error("❌ Error al exportar inventario:", error);
    alert("Ocurrió un error al exportar el inventario.");
    spinner.innerHTML = "❌ Error en la exportación.";
  } finally {
    setTimeout(() => {
      spinner.innerHTML = "";
    }, 3000);
  }
}

// 🚩 Agregar event listener para el botón
document.getElementById("exportar-btn").addEventListener("click", exportarInventario);
