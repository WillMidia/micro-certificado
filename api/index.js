const express = require('express');
const redis = require('redis');
const { Pool } = require('pg');
const routes = require('./routes');

const app = express();
app.use(express.json());

const redisClient = redis.createClient({ host: 'redis', port: 6379 });
const db = new Pool({
  user: 'user',
  host: 'db',
  database: 'certificados_db',
  password: 'password',
  port: 5432,
});

redisClient.on('connect', () => console.log('Conectado ao Redis'));
redisClient.on('error', (err) => console.log('Erro no Redis:', err));

app.use('/certificado', routes);

app.listen(3000, () => console.log('API rodando na porta 3000'));
