const fs = require('fs');
const { google } = require('googleapis');
const { client_id, client_secret, redirect_uri, refresh_token } = require('./configs/secret.json');
const { html2urls, listMessages, getMessage, openWebAndClick } = require('./helper');
const last_email_ts = require('./configs/last_email_ts.json');

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

  const now = new Date();
  const time = new Date(+internalDate);
  const prev = new Date(last_email_ts);
  if (time - prev <= 0) {
    //console.log(now, 'no new OTP email... exit');
    return;
  }

  console.log(now, 'found new OTP email... handling');
  const KEYWORDS = 'UPDATE_HOUSEHOLD_REQUESTED_OTP_CTA';
  const url = html2urls(htmlContent).filter(x => ~x.indexOf(KEYWORDS))[0];
  console.log(now, 'found URL =', url)
  await openWebAndClick(url);
  fs.writeFileSync('./configs/last_email_ts.json', internalDate);
  console.log(new Date(), 'done');
  process.exit(0);
})();
