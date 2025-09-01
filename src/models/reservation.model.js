const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  fechaHora: { type: Date, required: true },
  estado: {
    type: String,
    enum: ["activa", "cancelada"],
    default: "activa",
  },
  creadoEn: {
    type: Date,
    default: Date.now,
  },
});

const Reserva = mongoose.model("Reserva", reservationSchema);

module.exports = Reserva;
