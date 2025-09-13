const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/user.model.js");

const registrarUsuario = async (req, res) => {
  const { nombre, apellido, email, password } = req.body;

  try {
    //Vemos si existe el usuario
    const existeUsuario = await Usuario.findOne({ email });
    if (existeUsuario) {
      return res.status(400).json({ error: "El usuario ya está registrado" });
    }
    //Hasheamos contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    //Creamos nuevo usuario
    const nuevoUsuario = new Usuario({
      nombre,
      apellido,
      email,
      password: hashedPassword,
      rol: "cliente", //TODOS POR DEFECTO ARRANCAN COMO CLIENTES
    });

    await nuevoUsuario.save();
    console.log("✅ Usuario registrado:", nuevoUsuario.email);
    res.status(201).json({ msg: "Usuario registrado", usuario: nuevoUsuario });
  } catch (error) {
    console.error("Error al registrar:", error.message);
    res.status(500).json({ error: "Error del servidor" });
  }
};

//INGRESAR CON USUARIO CREADO
const loginUsuario = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("📥 Datos recibidos en login:", req.body);

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      console.log("❌ Usuario no existe:", email);
      return res.status(400).json({ error: "El usuario no existe" });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      console.log("❌ Contraseña incorrecta para:", email);
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 3600000, // 1 hora
    });

    console.log("✅ Login exitoso para:", email);
    res.json({
      msg: "Login exitoso",
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
      },
      token,
    });
  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
};
