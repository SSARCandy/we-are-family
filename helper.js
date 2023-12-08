const cheerio = require('cheerio');

function html2urls(htmlContent) {
  const $ = cheerio.load(htmlContent);
  const urls = [];
  $('a').each((i, link) => {
    urls.push($(link).attr('href'));
  });

  return urls;
}

async function listMessages(gmail) {
  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'from:(info@account.netflix.com) subject:(重要資訊：如何更新 Netflix 同戶裝置)',
      maxResults: 1
    });
    const messages = response.data.messages;
    if (!messages || messages.length === 0) {
      console.log('No messages found.');
      return;
    }
    return messages;
  } catch (err) {
    console.error('The API returned an error:', err);
  }
}

async function getMessage(gmail, id) {
  try {
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: id,
    });

    const parts = response.data.payload.parts;
    let htmlContent = '';
    if (parts) {
      for (const part of parts) {
        if (part.mimeType === 'text/html') {
          htmlContent = Buffer.from(part.body.data, 'base64').toString();
          break;
        }
      }
    }
    return { htmlContent, internalDate: response.data.internalDate };
  } catch (err) {
    console.error('Error fetching message:', err);
  }
}


module.exports = {
  html2urls,
  listMessages,
  getMessage,
};