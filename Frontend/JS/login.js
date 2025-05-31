async function iniciarSesion(event) {
  event.preventDefault();

  const email = document.getElementById('correo').value;
  const password = document.getElementById('password').value;
  const mensaje = document.getElementById('mensaje');

  try {
    console.log("Correo:", email);
    console.log("Contraseña:", password);

    const credenciales = await auth.signInWithEmailAndPassword(email, password);
    const usuario = credenciales.user;

    console.log("UID autenticado:", usuario.uid);

    // Buscar el rol del usuario en Firestore
    const docRef = db.collection("usuarios").doc(usuario.uid);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      mensaje.innerText = "El usuario no tiene un rol asignado.";
      console.warn("Rol no encontrado para UID:", usuario.uid);
      return;
    }

    const rol = docSnap.data().rol;
    console.log("Rol del usuario:", rol);

    // Redirección según el rol
    if (["vendedor", "gerente", "jefe"].includes(rol)) {
      window.location.href = `dashboard.html?rol=${rol}`;
    } else {
      mensaje.innerText = "Rol no válido.";
      console.error("Rol no válido detectado:", rol);
    }

  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    mensaje.innerText = "Correo o contraseña incorrectos.";
  }
}
