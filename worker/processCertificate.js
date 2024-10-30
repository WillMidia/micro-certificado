const ejs = require('ejs');
const htmlPdf = require('html-pdf');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const db = new Pool({
  user: 'user',
  host: 'db',
  database: 'certificados_db',
  password: 'password',
  port: 5432,
});

async function processCertificate(data) {
  const templatePath = path.join(__dirname, 'templates', 'certificado.html');
  const outputPath = path.join(__dirname, 'certificados', `certificado_${data.id}.pdf`);

  const template = fs.readFileSync(templatePath, 'utf-8');
  const html = ejs.render(template, data);

  return new Promise((resolve, reject) => {
    htmlPdf.create(html).toFile(outputPath, (err, res) => {
      if (err) return reject(err);

      const query = 'UPDATE certificados SET pdf_path = $1 WHERE id = $2';
      const values = [outputPath, data.id];
      db.query(query, values, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  });
}

module.exports = processCertificate;
