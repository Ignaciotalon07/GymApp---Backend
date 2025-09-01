const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/auth.js");
const {
  obtenerReservas,
  cancelarReserva,
  crearReserva,
} = require("../controllers/reservaController.js");

//RUTA PARA OBTENER RESERVAS
router.get("/", verificarToken, obtenerReservas);

//RUTA PARA CREAR RESERVA
router.post("/", verificarToken, crearReserva);

//RUTA PARA ELIMINAR RESERVA
router.delete("/:id", verificarToken, cancelarReserva);

module.exports = router;
