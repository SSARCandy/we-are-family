const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const { username, password } = require('./configs/netflix.json');

async function openWebAndClick(url) {
  const browser = await puppeteer.connect({
    browserURL: 'http://localhost:9222',
    args: ["--no-sandbox", "--disable-gpu"]
  });
  const page = await browser.newPage();
  await page.goto(url);

  try {
    await page.waitForNetworkIdle({ idleTime: 1000 });
    await page.type('#id_userLoginId', username);
    await page.type('#id_password', password);
    await page.click('#appMountPoint > div > div.login-body > div > div > div.hybrid-login-form-main > form > button');
  } catch (e) {
    // console.error('Unable to Login:', e);
  }

  try {
    await page.waitForNetworkIdle({ idleTime: 1000 });
    await page.click('[data-uia=set-primary-location-action]');
    await page.waitForNetworkIdle({ idleTime: 1000 });
    return true;
  } catch (e) {
    console.error('Unable to click button:', e);
  }
  await page.close();
  await browser.close();
}

function html2urls(htmlContent) {
  const $ = cheerio.load(htmlContent);
  const urls = [];
  $('a').each((_, link) => {
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
      id,
      userId: 'me',
    });

    const parts = response.data.payload.parts;
    let htmlContent = '';
    if (!parts) return;

    for (const part of parts) {
      if (part.mimeType !== 'text/html') continue;
      htmlContent = Buffer.from(part.body.data, 'base64').toString();
      break;
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
  openWebAndClick,
};
