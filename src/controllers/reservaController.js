const Reserva = require("../models/reservation.model.js");
require("../middlewares/auth.js");

//CON ESTO VEMOS LAS RESERVAS (TODAS SI SOS ADM)
const obtenerReservas = async (req, res) => {
  try {
    let reservas;

    if (req.usuario.rol === "admin") {
      reservas = await Reserva.find().populate("usuarioId", "nombre apellido");
    } else {
      reservas = await Reserva.find({ usuarioId: req.usuario._id }).populate(
        "usuarioId",
        "nombre apellido"
      );
    }

    res.json({
      reservas,
      usuario: {
        nombre: req.usuario.nombre,
        apellido: req.usuario.apellido,
        rol: req.usuario.rol,
        _id: req.usuario._id,
      },
    });
  } catch (error) {
    console.error("Error al obtener reservas (API):", error);
    res.status(500).json({ error: "Error al obtener reservas" });
  }
};

//CREAMOS RESERVA
const crearReserva = async (req, res) => {
  try {
    console.log("Body recibido:", req.body);
    console.log("Usuario en req:", req.usuario);

    const { fecha, hora } = req.body;
    if (!req.usuario) {
      return res.status(401).send("Usuario no autenticado");
    }

    // hora viene como "07:00 - 08:00", extraemos solo el inicio
    const horaInicio = hora.split(" - ")[0]; // "07:00"

    // Construimos fecha con hora de inicio
    const fechaHora = new Date(`${fecha}T${horaInicio}:00`);

    if (isNaN(fechaHora.getTime())) {
      return res.status(400).json({ error: "Fecha u hora inválida" });
    }

    const nuevaReserva = new Reserva({
      usuarioId: req.usuario._id,
      fechaHora, // guardás como Date
      rangoHora: hora, // opcional: guardás el string "07:00 - 08:00"
    });

    await nuevaReserva.save();
    res.status(201).json({ mensaje: "Reserva creada con éxito" });
  } catch (error) {
    console.error("Error al crear reserva:", error.message);
    res.status(500).send("Error al crear reserva");
  }
};

// ELIMINAMOS RESERVA
const cancelarReserva = async (req, res) => {
  try {
    const { id } = req.params;

    // Intentamos eliminar la reserva
    const resultado = await Reserva.findByIdAndDelete(id);

    if (!resultado) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    res.status(200).json({ mensaje: "Reserva cancelada con éxito" });
  } catch (error) {
    console.error("Error al cancelar reserva:", error);
    res.status(500).json({ error: "Error al cancelar la reserva" });
  }
};

module.exports = {
  obtenerReservas,
  crearReserva,
  cancelarReserva,
};
