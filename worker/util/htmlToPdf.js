const htmlPdf = require('html-pdf');

function htmlToPdf(html, outputPath) {
  return new Promise((resolve, reject) => {
    htmlPdf.create(html).toFile(outputPath, (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
}

module.exports = htmlToPdf;
