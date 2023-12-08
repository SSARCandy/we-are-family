const { google } = require('googleapis');
const { html2urls } = require('./html2url');
const TOKENS = require('./configs/tokens.json');
const axios = require('axios');

const oauth2Client = new google.auth.OAuth2();
oauth2Client.setCredentials(TOKENS);


const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
gmail.users.messages.list({
  userId: 'me',
  q: 'from:(info@account.netflix.com) subject:(重要資訊：如何更新 Netflix 同戶裝置)',
  maxResults: 1,
}, (err, res) => {
  if (err) return console.error('The API returned an error:', err);
  const messages = res.data.messages;
  if (!messages || messages.length === 0) {
    console.log('No messages found.');
    return;
  }

  gmail.users.messages.get({
    userId: 'me',
    id: messages[0].id,
  }, async (err, res) => {
    if (err) {
      console.error('Error fetching message:', err);
      return;
    }

    const parts = res.data.payload.parts;
    let htmlContent = '';
    if (parts) {
      // Find the HTML part
      for (const part of parts) {
        if (part.mimeType === 'text/html') {
          htmlContent = Buffer.from(part.body.data, 'base64').toString();
          break;
        }
      }
    }
    if (!htmlContent) {
      console.log('No HTML content found.');
      return;
    }
    const url = html2urls(htmlContent).filter(x => ~x.indexOf('UPDATE_HOUSEHOLD_REQUESTED_OTP_CTA'));
    console.log(url);
    await axios.get(url[0]);

  });
});