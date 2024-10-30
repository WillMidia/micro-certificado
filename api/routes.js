const express = require('express');
const router = express.Router();
const redis = require('redis');
const { Pool } = require('pg');
const path = require('path');

const db = new Pool({
  user: 'user',
  host: 'db',
  database: 'certificados_db',
  password: 'password',
  port: 5432,
});

const redisClient = redis.createClient({ host: 'redis', port: 6379 });

router.post('/', (req, res) => {
  const { nomeAluno, nomeCurso, dataInicio, dataTermino, cargaHoraria } = req.body;
  const query = 'INSERT INTO certificados (nome_aluno, nome_curso, data_inicio, data_termino, carga_horaria) VALUES ($1, $2, $3, $4, $5) RETURNING id';
  const values = [nomeAluno, nomeCurso, dataInicio, dataTermino, cargaHoraria];

  db.query(query, values, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      const id = result.rows[0].id;
      res.status(201).json({ id, message: 'Certificado criado e enviado para a fila de processamento' });
      // Enviar para a fila RabbitMQ aqui
    }
  });
});

router.get('/:id', (req, res) => {
  const id = req.params.id;

  redisClient.get(`certificado:${id}`, (err, data) => {
    if (err) throw err;

    if (data) {
      return res.status(200).sendFile(data);
    } else {
      db.query('SELECT pdf_path FROM certificados WHERE id = $1', [id], (err, result) => {
        if (err) throw err;

        if (result.rows.length > 0) {
          const pdfPath = result.rows[0].pdf_path;
          redisClient.setex(`certificado:${id}`, 3600, pdfPath);
          res.status(200).sendFile(pdfPath);
        } else {
          res.status(404).json({ message: 'Certificado não encontrado' });
        }
      });
    }
  });
});

module.exports = router;
