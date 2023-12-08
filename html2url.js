const cheerio = require('cheerio');

function html2urls(htmlContent) {
  const $ = cheerio.load(htmlContent);
  const urls = [];
  $('a').each((i, link) => {
    urls.push($(link).attr('href'));
  });

  return urls;
}

module.exports = {
  html2urls,
};