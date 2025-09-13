const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const moment = require("moment");
require("moment/locale/es");

const conectarDB = require("./config/database");
const Usuario = require("./models/user.model.js");
const { startReservationCleaner } = require("./utils/reservaCron.js");
const apiAuthRoutes = require("./routes/apiAuthRoutes");
const apiReservaRoutes = require("./routes/apiReservaRoutes");
const apiChatRoutes = require("./routes/apiChatRoutes");

dotenv.config();

const app = express();
const PUERTO = process.env.PORT || 8080;

// --- Conexión a MongoDB ---
conectarDB();

// --- Cron para limpiar reservas automáticamente ---
startReservationCleaner();

// --- CORS ---
const FRONTEND_URL = process.env.FRONTEND_URL;

if (!FRONTEND_URL) {
  console.error(
    "❌ ERROR: FRONTEND_URL no está definido en las variables de entorno"
  );
} else {
  console.log("✅ FRONTEND_URL detectado:", FRONTEND_URL);
}

const allowedOrigins = ["http://localhost:5173", FRONTEND_URL].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("No permitido por CORS"));
      }
    },
    credentials: true,
  })
);

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// --- Middleware para extraer usuario del token ---
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

// --- Rutas ---
app.use("/api/auth", apiAuthRoutes);
app.use("/api/reservas", apiReservaRoutes);
app.use("/api/chat", apiChatRoutes);

// --- Servidor ---
app.listen(PUERTO, () => {
  console.log(
    `✅ Servidor corriendo en https://gymapp-backend.up.railway.app/`
  );
});

// --- Logs para debug ---
console.log("AllowedOrigins:", allowedOrigins);
