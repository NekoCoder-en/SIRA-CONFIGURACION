// server.js
require('dotenv').config(); // Cargar variables de entorno desde el archivo .env
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const { body, validationResult } = require('express-validator');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Conexión a MongoDB Atlas utilizando la variable de entorno MONGODB_URI
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Error al conectar con MongoDB:', err));

// Definición del esquema y modelo de huella
const FingerprintSchema = new mongoose.Schema({
  fingerId: { type: Number, required: true },
  template: { type: String, required: true },
  timestamp: { type: String, required: true }
});
const Fingerprint = mongoose.model('Fingerprint', FingerprintSchema);

// Ruta para la raíz
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

// Middleware de validación para la ruta de guardar huella
const validateFingerprint = [
  body('fingerId').isInt().withMessage('El ID de la huella debe ser un número entero'),
  body('template').notEmpty().withMessage('El template de la huella es obligatorio'),
  body('timestamp').isISO8601().withMessage('El timestamp debe ser una fecha válida en formato ISO 8601')
];

// Ruta para guardar datos de huella con validación y manejo de errores
app.post('/api/fingerprint', validateFingerprint, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const { fingerId, template, timestamp } = req.body;

  try {
    // Verificar si ya existe una huella con el mismo template
    const existingFingerprint = await Fingerprint.findOne({ template });
    if (existingFingerprint) {
      return res.status(400).json({ mensaje: 'Huella duplicada, no se guardó.' });
    }

    const newEntry = new Fingerprint({ fingerId, template, timestamp });
    await newEntry.save();
    res.status(201).json({ mensaje: 'Datos guardados correctamente' });
  } catch (error) {
    console.error('Error al guardar la huella:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// Ruta para obtener los registros con manejo de errores
app.get('/api/fingerprint', async (req, res) => {
  try {
    const fingerprints = await Fingerprint.find();
    res.status(200).json(fingerprints);
  } catch (error) {
    console.error('Error al obtener los registros:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// Iniciar servidor en el puerto asignado por Railway o en el puerto 3000 por defecto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
