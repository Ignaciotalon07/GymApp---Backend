const mongoose = require("mongoose");

const conectarDB = async () => {
  try {
    // Usar variable de entorno MONGO_URL o fallback a localhost si no está
    const mongoUri =
      process.env.MONGO_URL || "mongodb://localhost:27017/reservas_gym";

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Conectado a MongoDB");
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = conectarDB;
