const express = require('express');
const qr = require('qrcode');
const jimp = require('jimp');
const QrCode = require('qrcode-reader');
const app = express();

app.use(express.json({ limit: '5mb' }));

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
    console.error('Errore generazione:', error);
    res.status(500).json({ error: 'Errore generazione' });
  }
});

app.post('/api/validate', async (req, res) => {
  try {
    const { qrImage } = req.body;
    if (!qrImage) return res.status(400).json({ error: 'Immagine richiesta' });

    const base64Data = qrImage.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const image = await jimp.read(imageBuffer);
    const qrCodeInstance = new QrCode();

    const result = await new Promise((resolve, reject) => {
      qrCodeInstance.callback = (err, value) => {
        if (err) reject(err);
        else resolve(value);
      };
      qrCodeInstance.decode(image.bitmap);
    });

    if (!result || !result.result) {
      return res.json({ valid: false, error: 'QR Code non valido' });
    }

    res.json({ valid: true, text: result.result });
  } catch (error) {
    console.error('Errore validazione:', error);
    res.status(500).json({ error: 'Errore validazione QR code' });
  }
});

const port = process.env.PORT || 10000;
app.listen(port, '0.0.0.0', () => console.log(`Server attivo sulla porta ${port}`));