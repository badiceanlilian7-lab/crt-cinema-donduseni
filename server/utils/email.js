const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

const sendEmail = async ({ to, subject, movie, date, time, location, age, qrCode }) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .header {
          background: linear-gradient(135deg, #e94560 0%, #c23a51 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 30px;
        }
        .info-item {
          background: #f8f9fa;
          padding: 15px;
          margin: 10px 0;
          border-radius: 5px;
          border-left: 4px solid #e94560;
        }
        .info-label {
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
        }
        .info-value {
          color: #666;
          font-size: 16px;
=======
        }
        .qr-section {
          text-align: center;
          margin: 30px 0;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 5px;
        }
        .qr-code {
          font-size: 24px;
          font-weight: bold;
          color: #e94560;
          letter-spacing: 2px;
          padding: 20px;
          background: white;
          border: 2px dashed #e94560;
          border-radius: 5px;
          display: inline-block;
        }
        .footer {
          background: #333;
          color: white;
          padding: 20px;
          text-align: center;
          font-size: 14px;
        }
        .instructions {
          background: #fff3cd;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          border-left: 4px solid #ffc107;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎬 CRT Cinema Donduseni</h1>
          <p>Confirmare Rezervare</p>
        </div>
        <div class="content">
          <h2>Rezervarea ta a fost confirmată!</h2>
          
          <div class="info-item">
            <div class="info-label">Film:</div>
            <div class="info-value">${movie}</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">Data:</div>
            <div class="info-value">${date}</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">Ora:</div>
            <div class="info-value">${time}</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">Locație:</div>
            <div class="info-value">${location || 'Cinema Donduseni'}</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">Vârstă înregistrată:</div>
            <div class="info-value">${age} ani</div>
          </div>
          
          <div class="qr-section">
            <h3>Codul tău QR:</h3>
            <div class="qr-code">${qrCode}</div>
          </div>
          
          <div class="instructions">
            <strong>Instrucțiuni:</strong>
            <ul>
              <li>Prezintă acest cod QR la intrare</li>
              <li>Codul este valabil 2 zile după data filmului</li>
              <li>Adu buletinul pentru verificare vârstă</li>
            </ul>
          </div>
          
          <p>Vă așteptăm cu drag!</p>
        </div>
        <div class="footer">
          <p>CRT Cinema Donduseni</p>
          <p>Urmărește-ne pe social media pentru actualizări!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: to,
    subject: subject,
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', to);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendEmail };
