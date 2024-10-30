const { Client } = require('pg');
const amqp = require('amqplib/callback_api');
const pdf = require('html-pdf');
const fs = require('fs');

// Configuração do PostgreSQL
const db = new Client({
    user: 'user',
    host: 'db',
    database: 'certificados',
    password: 'password',
    port: 5432,
});
db.connect();

// Função para gerar o PDF
function gerarPDF(certificado, callback) {
    const htmlTemplate = `
    <html>
    <body>
      <h1>Certificado de Conclusão</h1>
      <p>Nome do Aluno: ${certificado.aluno_nome}</p>
      <p>Curso: ${certificado.curso_nome}</p>
      <p>Data de Conclusão: ${certificado.data_conclusao}</p>
    </body>
    </html>
  `;

    pdf.create(htmlTemplate).toFile(`./certificados/${certificado.id}.pdf`, (err, res) => {
        if (err) return callback(err);
        callback(null, res);
    });
}

// Consumindo fila RabbitMQ
amqp.connect('amqp://rabbitmq', (error0, connection) => {
    if (error0) throw error0;

    connection.createChannel((error1, channel) => {
        if (error1) throw error1;

        const queue = 'certificados';

        channel.assertQueue(queue, { durable: true });

        channel.consume(queue, async (msg) => {
            const { id } = JSON.parse(msg.content.toString());

            // Busca o certificado no banco
            const result = await db.query('SELECT * FROM certificados WHERE id = $1', [id]);
            const certificado = result.rows[0];

            // Gera o PDF
            gerarPDF(certificado, async (err, res) => {
                if (err) throw err;

                const pdfPath = res.filename;

                // Atualiza o caminho do PDF no banco
                await db.query('UPDATE certificados SET pdf_path = $1, status = $2 WHERE id = $3', [pdfPath, 'completo', id]);
            });

            channel.ack(msg);
        });
    });
});
