const jwt = require("jsonwebtoken");
const Usuario = require("../models/user.model");

const verificarToken = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.log("❌ No se encontró token. Cookies:", req.cookies);

    return res.status(401).send("Acceso denegado. No hay token.");
  }

  try {
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decodificado.id);
    if (!usuario) {
      return res.status(401).send("Usuario no válido");
    }

    req.usuario = usuario; // 💡 Esto lo vas a usar para obtener el ID en reservas
    next();
  } catch (error) {
    console.error("Error al verificar token:", error.message);
    res.status(401).send("Token inválido");
  }
};

module.exports = verificarToken;
