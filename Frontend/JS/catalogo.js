// 🧠 db ya está importado desde firebaseConfig.js
const carrito = [];

window.addEventListener("DOMContentLoaded", () => {
  const laptopsContainer = document.getElementById("laptops");
  const tecladosContainer = document.getElementById("teclados");
  const mouseContainer = document.getElementById("mouse");

  if (!laptopsContainer || !tecladosContainer || !mouseContainer) {
    console.error("❌ Contenedores no encontrados en el DOM");
    return;
  }

  db.collection("productos").get()
    .then(snapshot => {
      if (snapshot.empty) {
        laptopsContainer.innerHTML = "<p>No hay laptops disponibles</p>";
        tecladosContainer.innerHTML = "<p>No hay teclados disponibles</p>";
        mouseContainer.innerHTML = "<p>No hay mouse disponibles</p>";
        return;
      }

      snapshot.forEach(doc => {
        const producto = doc.data();
        const card = crearTarjeta(producto);

        if (producto.categoria === "laptop") {
          laptopsContainer.appendChild(card);
        } else if (producto.categoria === "teclado") {
          tecladosContainer.appendChild(card);
        } else if (producto.categoria === "mouse") {
          mouseContainer.appendChild(card);
        }
      });
    })
    .catch(error => {
      console.error("❌ Error al obtener productos:", error.message);
    });

  document.querySelector(".menu-btn")?.addEventListener("click", toggleSidebar);
});

// 🧩 Tarjeta de producto
function crearTarjeta(producto) {
  const div = document.createElement("div");
  div.classList.add("producto");

  const imgPath = `../ASSETS/${producto.imagen}`;
  const button = producto.stock > 0
    ? `<button onclick="agregarAlCarrito('${producto.nombre}', ${producto.precio})">🛒 Comprar</button>`
    : `<button disabled style="background-color: gray;">❌ Agotado</button>`;

  div.innerHTML = `
    <img src="${imgPath}" alt="${producto.nombre}">
    <h3>${producto.nombre}</h3>
    <p class="precio">Q${producto.precio.toFixed(2)}</p>
    <p style="color: ${producto.stock > 0 ? '#2ecc71' : '#e74c3c'}; font-weight: bold;">Stock: ${producto.stock}</p>
    ${button}
  `;

  return div;
}

// 🧭 Menú lateral
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("active");
  document.getElementById("main-content").classList.toggle("shrink");
}

// 🛒 Agregar al carrito
function agregarAlCarrito(nombre, precio) {
  const existente = carrito.find(p => p.nombre === nombre);
  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({ nombre, precio, cantidad: 1 });
  }
  alert(`✅ ${nombre} agregado al carrito`);
}

// 🛍️ Ver carrito
function mostrarCarrito() {
  const lista = document.getElementById("lista-carrito");
  const totalEl = document.getElementById("total-carrito");
  lista.innerHTML = "";

  let total = 0;
  carrito.forEach(item => {
    const subtotal = item.precio * item.cantidad;
    lista.innerHTML += `<li>${item.nombre} x${item.cantidad} - Q${subtotal.toFixed(2)}</li>`;
    total += subtotal;
  });

  totalEl.innerText = total.toFixed(2);
  document.getElementById("carrito-modal").style.display = "flex";
}

// ❌ Cancelar compra
function cerrarCarrito() {
  document.getElementById("carrito-modal").style.display = "none";
}

// ✅ Finalizar compra
function finalizarCompra() {
  const correo = document.getElementById("correo-cliente").value;

  if (!correo.includes("@")) return alert("📧 Correo no válido.");
  if (carrito.length === 0) return alert("🛒 El carrito está vacío.");

  fetch("https://primary-production-8238a.up.railway.app/comprar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, productos: carrito })
  })
    .then(res => res.text())
    .then(msg => {
      alert("✅ Compra realizada.");
      carrito.length = 0;
      cerrarCarrito();
      location.reload();
    })
    .catch(err => {
      console.error("❌ Error procesando compra:", err);
      alert("❌ Error al procesar compra.");
    });
}
