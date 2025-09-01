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
    res.redirect("/");
  } catch (error) {
    console.error("Error al registrar:", error.message);
    res.status(500).json({ error: "Error del servidor" });
  }
};

//INGRESAR CON USUARIO CREADO
const loginUsuario = async (req, res) => {
  const { email, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(200).render("auth/login", {
        error: "El usuario no existe",
        email, // para que no pierda lo que escribió
      });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(200).render("auth/login", {
        error: "Contraseña incorrecta",
        email,
      });
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
      maxAge: 3600000, // 1 hora
    });

    res.redirect("/reservas"); // Redirigimos al listado de reservas después del login
  } catch (error) {
    console.error("Error al loguear:", error.message);
    res.status(500).json({ error: "Error del servidor" });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
};
