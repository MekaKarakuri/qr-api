const express = require('express');
const qr = require('qrcode');
const jimp = require('jimp');
const QrCode = require('qrcode-reader');
const rateLimit = require('express-rate-limit');
const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(express.json());
app.use(limiter);

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

    const image = await jimp.read(Buffer.from(qrImage, 'base64'));
    const qrCodeInstance = new QrCode();
    
    const value = await new Promise((resolve, reject) => {
      qrCodeInstance.callback = (err, v) => err ? reject(err) : resolve(v);
      qrCodeInstance.decode(image.bitmap);
    });

    res.json({ valid: true, text: value.result });
  } catch (error) {
    res.status(500).json({ error: 'Errore validazione' });
  }
});

const port = process.env.PORT || 10000;
app.listen(port, '0.0.0.0', () => console.log(`Server attivo sulla porta ${port}`));