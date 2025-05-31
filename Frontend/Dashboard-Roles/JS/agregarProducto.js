const db = firebase.firestore();

document.getElementById("formulario-producto").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const categoria = document.getElementById("categoria").value;
  const precio = parseFloat(document.getElementById("precio").value);
  const stock = parseInt(document.getElementById("stock").value);
  const imagen = document.getElementById("imagen").value.trim();
  const spinner = document.getElementById("spinner");

  if (!nombre || !categoria || isNaN(precio) || isNaN(stock) || !imagen) {
    alert("Completa todos los campos correctamente.");
    return;
  }

  // Mostrar spinner
  spinner.innerHTML = "⏳ Agregando producto...";

  try {
    await db.collection("productos").add({ nombre, categoria, precio, stock, imagen });
    spinner.innerHTML = "✅ Producto agregado exitosamente.";
    document.getElementById("formulario-producto").reset();
  } catch (error) {
    console.error("❌ Error al agregar producto:", error);
    spinner.innerHTML = "❌ Error al agregar producto.";
    alert("Hubo un error al agregar el producto.");
  } finally {
    // Ocultar mensaje después de unos segundos
    setTimeout(() => {
      spinner.innerHTML = "";
    }, 3000);
  }
});

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("hidden");
  document.body.classList.toggle("collapsed");
}
