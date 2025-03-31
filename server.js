const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json());

// Conexión a MongoDB Atlas
mongoose.connect('mongodb+srv://Irvingamador:LOVEFOREVER@cluster0.kyy43pj.mongodb.net/sira?retryWrites=true&w=majority')
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.log(err));

// Esquema de huella
const FingerprintSchema = new mongoose.Schema({
  fingerId: Number,
  template: String,
  timestamp: String
});
const Fingerprint = mongoose.model('Fingerprint', FingerprintSchema);

// Ruta para la raíz
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

// Ruta para guardar datos de huella
app.post('/api/fingerprint', async (req, res) => {
  const { fingerId, template, timestamp } = req.body;

  // Verificar si ya existe una huella con el mismo template
  const existingFingerprint = await Fingerprint.findOne({ template });
  if (existingFingerprint) {
    return res.status(400).json({ message: 'Huella duplicada, no se guardó.' });
  }

  const newEntry = new Fingerprint({ fingerId, template, timestamp });
  await newEntry.save();
  res.status(200).json({ message: 'Datos guardados correctamente' });
});

// Ruta para obtener los registros
app.get('/api/fingerprint', async (req, res) => {
  const fingerprints = await Fingerprint.find();
  res.status(200).json(fingerprints);
});

// Iniciar servidor en el puerto asignado por Railway o en el puerto 3000 por defecto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
