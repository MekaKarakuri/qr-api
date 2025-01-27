const express = require('express');
const qr = require('qrcode');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'API attiva' });
});

app.post('/api/generate', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Testo richiesto' });
    const qrCode = await qr.toDataURL(text);
    res.json({ qrCode });
  } catch (error) {
    res.status(500).json({ error: 'Errore generazione' });
  }
});

app.post('/api/validate', async (req, res) => {
  try {
    const { qrImage } = req.body;
    if (!qrImage) return res.status(400).json({ error: 'Immagine richiesta' });
    res.json({ valid: true, text: "Test validation" });
  } catch (error) {
    res.status(500).json({ error: 'Errore validazione' });
  }
});

const port = process.env.PORT || 10000;
app.listen(port, '0.0.0.0', () => console.log(`Server attivo sulla porta ${port}`));