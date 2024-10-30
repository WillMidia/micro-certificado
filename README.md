# Certificado de Conclusão de Curso

Este projeto é uma aplicação para geração de certificados em PDF com base em dados do aluno e do curso. O sistema utiliza uma arquitetura baseada em filas, com API e Workers.

## Tecnologias Utilizadas

- Docker e Docker Compose
- Node.js
- Express
- PostgreSQL
- RabbitMQ
- Redis
- HTML-PDF

## Como rodar o projeto

1. Clone o repositório.
2. Execute `docker-compose up` para iniciar os serviços.
3. Use a API para criar certificados e consultar PDFs gerados.

## Endpoints

### POST /certificado
Cria um certificado e publica na fila.

### GET /certificado/:id
Retorna o certificado em PDF.
