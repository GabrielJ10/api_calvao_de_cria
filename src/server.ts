import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import connectDB from './config/db';

const PORT = process.env.PORT || 3000;

// Conectar ao Banco de Dados
connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
