import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;  // Render assigns PORT dynamically

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Flare48 API is running...');
});

// Explicitly listen on 0.0.0.0 to accept external traffic
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});
