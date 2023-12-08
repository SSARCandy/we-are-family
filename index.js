const { google } = require('googleapis');
const { client_id, client_secret, redirect_uri, refresh_token } = require('./configs/secret.json');
const { html2urls, listMessages, getMessage, openWebAndClick } = require('./helper');
const axios = require('axios');

const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);
oauth2Client.setCredentials({ refresh_token });
oauth2Client.refreshAccessToken();

(async () => {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const messages = await listMessages(gmail);
  if (!messages) return;

  const { htmlContent, internalDate } = await getMessage(gmail, messages[0].id);
  if (!htmlContent) {
    console.log('No HTML content found.');
    return;
  }

  const url = html2urls(htmlContent).filter(x => ~x.indexOf('UPDATE_HOUSEHOLD_REQUESTED_OTP_CTA'))[0];
  const time = new Date(+internalDate);
  console.log(time.toISOString());
  console.log(url);
  openWebAndClick(url);
})();
