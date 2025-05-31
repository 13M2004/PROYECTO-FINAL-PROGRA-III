const db = firebase.firestore();

window.addEventListener("DOMContentLoaded", async () => {
  const selectProducto = document.getElementById("producto-select");

  try {
    const snapshot = await db.collection("productos").get();
    snapshot.forEach(doc => {
      const producto = doc.data();
      const option = document.createElement("option");
      option.value = producto.nombre;
      option.textContent = `${producto.nombre} - Q${producto.precio}`;
      selectProducto.appendChild(option);
    });
  } catch (error) {
    console.error("❌ Error al cargar productos:", error);
    alert("⚠️ No se pudieron cargar los productos.");
  }

  // Manejar evento de envío
  const form = document.getElementById("venta-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const producto = document.getElementById("producto-select").value;
    const cantidad = parseInt(document.getElementById("cantidad").value);
    const correo = document.getElementById("correo-cliente").value.trim();

    if (!producto || cantidad <= 0 || !correo.includes("@")) {
      alert("⚠️ Por favor completa todos los campos correctamente.");
      return;
    }

    try {
      const response = await fetch("https://primary-production-8238a.up.railway.app/comprar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productos: [{ nombre: producto, cantidad }],
          correo
        })
      });

      if (!response.ok) throw new Error("Error en el servidor.");

      const msg = await response.text();
      alert("✅ Venta registrada y factura enviada.");
      form.reset();
    } catch (error) {
      console.error("❌ Error al registrar venta:", error);
      alert("❌ Error procesando la venta.");
    }
  });
});

// Función de sidebar
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("hidden");
  document.body.classList.toggle("collapsed");
}
