const amqp = require('amqplib/callback_api');
const processCertificate = require('./processCertificate');

amqp.connect('amqp://rabbitmq', (error, connection) => {
  if (error) throw error;

  connection.createChannel((error, channel) => {
    if (error) throw error;

    const queue = 'certificados';

    channel.assertQueue(queue, { durable: true });
    console.log(`Aguardando mensagens na fila: ${queue}`);

    channel.consume(queue, (msg) => {
      const certificateData = JSON.parse(msg.content.toString());
      processCertificate(certificateData).then(() => {
        channel.ack(msg);
        console.log(`Certificado processado: ${certificateData.id}`);
      });
    });
  });
});
