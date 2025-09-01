const express = require("express");
const router = express.Router();
const Usuario = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const verificarToken = require("../middlewares/auth.js");

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar si el usuario existe
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Comparar contraseñas
    const esValida = await bcrypt.compare(password, usuario.password);
    if (!esValida) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Generar token JWT
    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Enviar token como cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true en producción con HTTPS
      sameSite: "lax",
    });

    // También podés enviar info en el body
    res.status(200).json({ msg: "Login exitoso" });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// routes/apiAuthRoutes.js PARA REACT

router.get("/me", verificarToken, (req, res) => {
  // req.usuario lo pone el middleware
  if (!req.usuario) return res.status(401).json({ error: "No autenticado" });
  res.json({
    usuario: {
      nombre: req.usuario.nombre,
      apellido: req.usuario.apellido,
      email: req.usuario.email,
      rol: req.usuario.rol,
    },
  });
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { nombre, apellido, email, password } = req.body;

  try {
    // Verificar si ya existe el usuario
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const nuevoUsuario = new Usuario({
      nombre,
      apellido,
      email,
      password: hashedPassword,
    });

    await nuevoUsuario.save();

    // Generar token (opcional)
    const token = jwt.sign({ id: nuevoUsuario._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Enviar token como cookie (opcional, si querés loguearlo al registrarse)
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.status(201).json({ msg: "Usuario registrado correctamente" });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

module.exports = router;
