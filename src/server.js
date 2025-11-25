// src/server.js
import express from 'express';
import userRoutes from './routes/user.routes.js';
import authRoutes from './routes/auth.routes.js';
import forumRoutes from './routes/forum.routes.js';
import cursoRoutes from './routes/curso.routes.js';
import config from './config.js';
import cors from 'cors';
import syncDatabase from './database/sync.js';
import syncTables from './database/syncTables.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configura
app.use(
  cors({
    origin:[
        'https://devlab-foa.onrender.com',
        'http://localhost:3000',
        'https://thedevlab.com.br', 
        'https://www.thedevlab.com.br',
      'http://devlab-teste.eastus.cloudapp.azure.com/'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../front'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.env') || filePath.includes('node_modules')) {
      res.status(403).end(); // Bloqueia acesso a arquivos sensíveis
    }
  }
}));
app.use('/Uploads', express.static(path.join(__dirname, '../front/Uploads')));

// Rotas da API
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/forum', forumRoutes); 
app.use('/api/curso', cursoRoutes);



// Middleware para erros 404
app.use((req, res, next) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Middleware para erros genéricos
app.use((err, req, res, next) => {
  console.error('Erro no servidor:', err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

async function startServer() {
  try {
    await syncDatabase();
    await syncTables();
    const port = process.env.PORT || config.port || 3000;
    app.listen(port, '0.0.0.0', () => {
      console.log(`Servidor rodando em 0.0.0.0:${port}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

startServer();

