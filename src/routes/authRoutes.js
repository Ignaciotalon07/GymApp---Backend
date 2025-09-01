const express = require("express");
const router = express.Router();
const {
  registrarUsuario,
  loginUsuario,
} = require("../controllers/authController.js");

// Mostrar formulario de registro
router.get("/register", (req, res) => {
  res.render("auth/register", { titulo: "Registro" });
});

// Mostrar formulario de login
router.get("/", (req, res) => {
  res.render("auth/login", { titulo: "Iniciar sesión" });
});

//Ruta para registrar un nuevo usuario
router.post("/register", registrarUsuario);

//Ruta para login (usuario que ya existe)
router.post("/login", loginUsuario);

//Ruta para LOGOUT
router.get("/logout", (req, res) => {
  res.clearCookie("token"); // Borra el JWT
  res.redirect("/"); // Redirige al login
});

module.exports = router;
