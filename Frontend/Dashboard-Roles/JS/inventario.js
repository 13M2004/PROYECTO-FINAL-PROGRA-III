// Dashboard-Roles/JS/inventario.js
const db = firebase.firestore();

db.collection("productos").get().then((querySnapshot) => {
  const tbody = document.getElementById("tabla-inventario");
  tbody.innerHTML = ""; // Limpia antes de cargar
  querySnapshot.forEach((doc) => {
    const p = doc.data();
    const fila = `<tr>
      <td>${p.nombre}</td>
      <td>${p.categoria}</td>
      <td>${p.marca}</td>
      <td>${p.stock}</td>
    </tr>`;
    tbody.innerHTML += fila;
  });
});
