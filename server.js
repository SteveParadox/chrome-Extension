const express = require('express');
const app = express();
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

const crypto = require('crypto');
const fs = require('fs');

const clientId = '750050532016-uuqaapq210fhofhtg0b0oda77btdsjbg.apps.googleusercontent.com';
const clientSecret = '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';
const redirectUrl = 'http://localhost:3000/oauth2callback';


app.use(express.json({ limit: '10mb' }));

app.post('/api/screenshot', (req, res) => {
  const screenshotData = req.body.screenshot;
  sendEmailWithScreenshot(screenshotData)
    .then(() => {
      res.sendStatus(200);
    })
    .catch((error) => {
      console.error('Error sending email:', error);
      res.sendStatus(500);
    });
});

app.get('/auth/google', (req, res) => {
  const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.send'],
  });
  res.redirect(authUrl);
});


app.get('/oauth2callback', async (req, res) => {
  try {
    const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);
    const code = req.query.code;
    const { tokens } = await oauth2Client.getToken(code);
    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;

    const tokenFilename = storeTokens(tokens);

    res.redirect('http://localhost:3000/');
  } catch (error) {
    console.error('Error exchanging authorization code for tokens:', error);
    res.redirect('http://localhost:3000/error');
  }
});


app.get('/', (req, res) => {
    res.send('Welcome to plugin'); 
  });
  

  function storeTokens(tokens) {
    const filename = crypto.randomBytes(16).toString('hex');
  
    fs.writeFileSync(`${filename}.json`, JSON.stringify(tokens));
  
    return filename;
  }

  async function sendEmailWithScreenshot(screenshotData) {
    try {

      const tokenFilename = '9b90ed3fb5376bdb57ddb4c678573967.json'; 
      const tokenData = fs.readFileSync(`${tokenFilename}`, 'utf8');
      const tokens = JSON.parse(tokenData);
      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);
      
      oauth2Client.setCredentials({ access_token: tokens.access_token });
  
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          type: 'OAuth2',
          user: 'fordstphn@gmail.com',
          clientId: clientId,
          clientSecret: clientSecret,
          refreshToken: tokens.refresh_token,
          accessToken: tokens.access_token,
        },
      });
  
      const mailOptions = {
        from: 'crazythoughtverify@gmail.com',
        to: 'bonvoyagestephen@gmail.com',
        subject: 'Screenshot from Chrome Extension',
        text: 'Please find the attached screenshot',
        attachments: [
          {
            filename: 'screenshot.png',
            content: screenshotData.split(';base64,').pop(),
            encoding: 'base64',
          },
        ],
      };
  
      // Send the email
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully.');
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
  
                         
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
