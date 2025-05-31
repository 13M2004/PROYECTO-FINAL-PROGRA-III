// Configuración de Firebase para AutoGestiónTech
const firebaseConfig = {
  apiKey: "AIzaSyCnwr40XXTKcoiVLps2idjLYPimN-Ubntk",
  authDomain: "autogestiontech-f48ac.firebaseapp.com",
  projectId: "autogestiontech-f48ac",
  storageBucket: "autogestiontech-f48ac.appspot.com",
  messagingSenderId: "409780988517",
  appId: "1:409780988517:web:6e81c033aade5cf48c348c",
  measurementId: "G-EVE9GLMFXC"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

console.log("✅ Firebase configurado correctamente.");
console.log("📡 Firebase apps:", firebase.apps.length);
