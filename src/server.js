// src/server.js
import express from 'express';
import userRoutes from './routes/user.routes.js';
import authRoutes from './routes/auth.routes.js';
import forumRoutes from './routes/forum.routes.js';
import config from './config.js';
import cors from 'cors';
import syncDatabase from './database/sync.js';
import syncTables from './database/syncTables.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../front')));
app.use('/uploads', express.static(path.join(__dirname, '../front/Uploads')));

// Rotas da API
app.use('/api/users', userRoutes); // Alterado de '/user' para '/api/users'
app.use('/api/auth', authRoutes);  // Alterado de '/auth' para '/api/auth'
app.use('/api', forumRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../front/index.html'));
});

// Middleware para erros 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

async function startServer() {
  try {
    await syncDatabase();
    await syncTables();
    const port = process.env.PORT || config.port;
    app.listen(port, '0.0.0.0', () => {
      console.log(`Servidor rodando em 0.0.0.0:${port}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

startServer();