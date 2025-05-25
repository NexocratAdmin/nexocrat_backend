const express = require('express');
const https = require('https');
const fs = require('fs');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
require('dotenv').config();
const http = require('http');
const app = express();
const PORT = 5000; // HTTPS port

// HTTPS certificate paths (Let's Encrypt)
const httpsOptions = {
    key: fs.readFileSync('/etc/letsencrypt/live/nexocrat.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/nexocrat.com/fullchain.pem')
};

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

// Multer upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads');
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});
const upload = multer({ storage });

// Homepage
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Welcome to Nexocrat</title>
<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
}
.container {
  text-align: center;
}
.welcome-box {
  background: rgba(255, 255, 255, 0.1);
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
}
.welcome-box h1 {
  font-size: 2.5em;
}
.welcome-box span {
  color: #00e6e6;
}
.welcome-box p {
  margin-top: 10px;
  font-size: 1.2em;
}
</style>
</head>
<body>
<div class="container">
  <div class="welcome-box">
    <h1>Welcome to <span>Nexocrat IT Solutions</span></h1>
    <p>Your trusted partner in innovative IT solutions.</p>
  </div>
</div>
</body>
</html>
`;
app.get('/test', (req, res) => {
    res.send(htmlContent);
});

// Contact Form API
app.post('/nexocrat/contactUs', upload.single('file'), async (req, res) => {
    const { firstName, lastName, email, message } = req.body;
    const file = req.file;

    if (!firstName || !lastName || !email || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const fileUrl = file ? `https://nexocrat.com/public/uploads/${file.filename}` : null;

    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'yudhveersinghvision@gmail.com',
            pass: 'nknr tcnm pxsf rkno',
        },
    });

    let mailOptions = {
        from: 'yudhveersinghvision@gmail.com',
        to: 'yudhveersdhillon7@gmail.com',
        subject: "New Contact Us form Submission",
        html: `
<div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px; border-radius: 8px; max-width: 600px; margin: auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
  <div style="background-color: #004aad; padding: 15px 20px; border-radius: 6px 6px 0 0; color: white;">
    <h2 style="margin: 0;">📩 New Contact Us Form</h2>
  </div>
  <div style="padding: 20px; background-color: white; border-radius: 0 0 6px 6px;">
    <p><strong>Name:</strong> ${firstName} ${lastName}</p>
    <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #004aad;">${email}</a></p>
    <p><strong>Message:</strong><br><span style="color: #333;">${message}</span></p>
    ${fileUrl
                ? `<p><strong>Uploaded File:</strong><br><a href="${fileUrl}" target="_blank" style="color: #28a745; text-decoration: underline;">📎 Click here to view the file</a></p>`
                : `<p><strong>Uploaded File:</strong> No file uploaded</p>`}
    <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;" />
    <p style="font-size: 12px; color: #777;">This message was sent from the contact form on the Nexocrat website.</p>
  </div>
</div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Your Contact Us form has been submitted successfully.' });
    } catch (err) {
        console.error('Error sending email:', err.message);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

http.createServer(app).listen(PORT, () => {
  console.log(`🌐 HTTP server running on http://localhost:${PORT}`);
});