import express from 'express';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 6000;
const app = express();

// Middleware
app.use(express.json());

app.set('view engine', 'ejs');

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});