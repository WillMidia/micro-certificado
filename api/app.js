const express = require('express');
const { Client } = require('pg');
const amqp = require('amqplib/callback_api');
const Redis = require('ioredis');

const app = express();
app.use(express.json());

// Configuração do PostgreSQL
const db = new Client({
    user: 'user',
    host: 'db',
    database: 'certificados',
    password: 'password',
    port: 5432,
});
db.connect();

// Configuração do Redis
const redis = new Redis({ host: 'redis', port: 6379 });

// Endpoint para criação de certificado
app.post('/certificado', async (req, res) => {
    const { aluno_nome, curso_nome, data_inicio, data_fim, carga_horaria } = req.body;

    const query = `INSERT INTO certificados (aluno_nome, curso_nome, data_inicio, data_fim, carga_horaria, data_conclusao)
                 VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id`;
    const values = [aluno_nome, curso_nome, data_inicio, data_fim, carga_horaria];
    const result = await db.query(query, values);

    const certificadoId = result.rows[0].id;

    // Publica na fila do RabbitMQ para o Worker processar
    amqp.connect('amqp://rabbitmq', (error0, connection) => {
        if (error0) throw error0;

        connection.createChannel((error1, channel) => {
            if (error1) throw error1;

            const queue = 'certificados';
            const msg = JSON.stringify({ id: certificadoId });

            channel.assertQueue(queue, { durable: true });
            channel.sendToQueue(queue, Buffer.from(msg));
        });
    });

    res.status(200).json({ message: 'Certificado solicitado com sucesso', id: certificadoId });
});

// Endpoint para retornar o certificado em PDF
app.get('/certificado/:id', async (req, res) => {
    const { id } = req.params;

    const cacheKey = `certificado_${id}`;
    const cachedPDF = await redis.get(cacheKey);

    if (cachedPDF) {
        return res.sendFile(cachedPDF);
    }

    const result = await db.query('SELECT * FROM certificados WHERE id = $1', [id]);
    const certificado = result.rows[0];

    if (certificado && certificado.pdf_path) {
        redis.set(cacheKey, certificado.pdf_path, 'EX', 120); // Expira em 120 segundos
        return res.sendFile(certificado.pdf_path);
    } else {
        res.status(404).json({ message: 'Certificado não encontrado' });
    }
});

app.listen(3000, () => {
    console.log('API rodando na porta 3000');
});
