const amqp = require('amqplib/callback_api');

function sendToQueue(queue, data) {
  amqp.connect('amqp://rabbitmq', (error, connection) => {
    if (error) throw error;

    connection.createChannel((error, channel) => {
      if (error) throw error;

      channel.assertQueue(queue, { durable: true });
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
      console.log(`Mensagem enviada para a fila ${queue}`);
    });
  });
}

module.exports = { sendToQueue };
