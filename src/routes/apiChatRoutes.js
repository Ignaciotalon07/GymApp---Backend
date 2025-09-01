const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, // guardá la key en .env
});

router.post("/", async (req, res) => {
  const { prompt: mensaje } = req.body;

  if (!mensaje || mensaje.trim() === "") {
    return res.status(400).json({ error: "El mensaje no puede estar vacío" });
  }

  try {
    const respuesta = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        {
          role: "system",
          content:
            "Sos un asistente de fitness. Recomendás rutinas de ejercicio y alimentación según lo que te pregunte el usuario.",
        },
        {
          role: "user",
          content: mensaje,
        },
      ],
    });

    res.json({ respuesta: respuesta.choices[0].message.content });
  } catch (error) {
    console.error("Error al consultar Groq:", error);
    res.status(500).json({ error: "Error al obtener respuesta de la IA" });
  }
});

module.exports = router;
