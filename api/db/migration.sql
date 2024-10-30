CREATE TABLE certificados (
                              id SERIAL PRIMARY KEY,
                              aluno_nome VARCHAR(255) NOT NULL,
                              curso_nome VARCHAR(255) NOT NULL,
                              data_inicio DATE NOT NULL,
                              data_fim DATE NOT NULL,
                              carga_horaria INTEGER NOT NULL,
                              data_conclusao DATE NOT NULL,
                              pdf_path VARCHAR(255),
                              status VARCHAR(50) DEFAULT 'pendente',
                              criado_em TIMESTAMP DEFAULT NOW()
);
