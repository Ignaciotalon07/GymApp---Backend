const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/auth.js");

const {
  obtenerReservas,
  cancelarReserva,
  crearReserva,
} = require("../controllers/reservaController.js");

// Mostrar el formulario para crear una nueva reserva
router.get("/nuevareserva", verificarToken, (req, res) => {
  res.render("reservas/nuevareserva", { titulo: "Nueva reserva" });
});

// Mostrar las reservas
router.get("/", verificarToken, obtenerReservas);

// Crear nueva reserva
router.post("/", verificarToken, crearReserva);

// Eliminar reserva
router.get("/eliminarreserva/:id", verificarToken, cancelarReserva);

module.exports = router;
