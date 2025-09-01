const cron = require("node-cron");
const Reserva = require("../models/reservation.model.js");

// Tarea programada que corre cada minuto
function startReservationCleaner() {
  cron.schedule("* * * * *", async () => {
    try {
      const ahora = new Date();

      // Buscar primero las reservas vencidas
      const reservasViejas = await Reserva.find({ fechaHora: { $lt: ahora } });

      if (reservasViejas.length > 0) {
        console.log(`Se van a eliminar ${reservasViejas.length} reservas:`);

        reservasViejas.forEach((reserva) => {
          console.log(
            `- ${reserva._id} | Usuario: ${reserva.usuarioId} | FechaHora: ${reserva.fechaHora}`
          );
        });

        // Eliminarlas
        const resultado = await Reserva.deleteMany({
          fechaHora: { $lt: ahora },
        });
        console.log(`✅ Eliminadas: ${resultado.deletedCount}`);
      }
    } catch (error) {
      console.error("Error en el cron de eliminación de reservas:", error);
    }
  });

  console.log("Cron de reservas iniciado (corre cada minuto)");
}

module.exports = { startReservationCleaner };
