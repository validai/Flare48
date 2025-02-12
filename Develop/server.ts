import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000; // Use Render's PORT

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Flare48 API is running...');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
