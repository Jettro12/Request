const express = require('express');
const app = express();
const PORT = process.env.PORT || 4011;

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'files-service' });
});

// Upload endpoint (ejemplo)
app.post('/upload', (req, res) => {
  res.json({ message: 'Upload endpoint' });
});

app.listen(PORT, () => {
  console.log(`Files service listening on port ${PORT}`);
});
