const express = require("express");
const app = express();
const PUERTO = process.env.PORT || 8080;
const path = require("path");
const cookieParser = require("cookie-parser");
require("moment/locale/es");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const Usuario = require("./models/user.model.js");
const { startReservationCleaner } = require("./utils/reservaCron.js");

//CONFIGURACION PARA VARIABLES DE ENTORNO
const dotenv = require("dotenv");
dotenv.config();

//CONEXION A LA DB
const conectarDB = require("./config/database");
conectarDB();

//ELIMINAR RESERVAS AUTOMATICAMENTE
startReservationCleaner();

//CORS para permitir que React haga peticiones
const cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:5173", // donde corre React
    credentials: true,
  })
);

//MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// MIDDLEWARE PARA EXTRAER USUARIO DEL TOKEN Y PASAR A VISTAS
app.use(async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const usuario = await Usuario.findById(decoded.id);
      if (usuario) {
        req.usuario = usuario;
        res.locals.usuario = usuario;
      } else {
        res.locals.usuario = null;
      }
    } catch (err) {
      res.locals.usuario = null;
    }
  } else {
    res.locals.usuario = null;
  }
  next();
});

//RUTAS PARA REACT
const apiAuthRoutes = require("./routes/apiAuthRoutes");
const apiReservaRoutes = require("./routes/apiReservaRoutes");
const apiChatRoutes = require("./routes/apiChatRoutes");

app.use("/api/auth", apiAuthRoutes);
app.use("/api/reservas", apiReservaRoutes);
app.use("/api/chat", apiChatRoutes);

//LISTEN
app.listen(PUERTO, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PUERTO}`);
});
