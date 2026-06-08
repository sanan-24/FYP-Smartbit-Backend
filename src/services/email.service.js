const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT == 465,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

const sendEmail = async (options) => {
    const transporter = createTransporter();
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    await transporter.sendMail(mailOptions);
};

const sendVerificationEmail = async (email, token) => {
    const verificationUrl = `${process.env.APP_URL || 'http://localhost:8000'}/api/v1/auth/verify-email?token=${token}`;
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .card {
                max-width: 400px;
                margin: auto;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 10px;
                font-family: Arial, sans-serif;
                text-align: center;
                background-color: #f9f9f9;
            }
            .button {
                display: inline-block;
                padding: 12px 24px;
                margin-top: 20px;
                background-color: #007bff;
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
            }
            .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #777;
            }
        </style>
    </head>
    <body>
        <div class="card">
            <h2>Email Verification</h2>
            <p>Thank you for registering! Please click the button below to verify your email address.</p>
            <a href="${verificationUrl}" class="button">Verify Email</a>
            <div class="footer">
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p>${verificationUrl}</p>
            </div>
        </div>
    </body>
    </html>
    `;

    await sendEmail({
        email,
        subject: 'Verify Your Email Address',
        message: `Please verify your email by clicking the link: ${verificationUrl}`,
        html
    });
};

const sendOTPEmail = async (email, otp) => {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .card {
                max-width: 400px;
                margin: auto;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 10px;
                font-family: Arial, sans-serif;
                text-align: center;
                background-color: #f9f9f9;
            }
            .otp {
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 5px;
                color: #007bff;
                margin: 20px 0;
            }
            .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #777;
            }
        </style>
    </head>
    <body>
        <div class="card">
            <h2>Password Reset OTP</h2>
            <p>You requested to reset your password. Use the following OTP to proceed:</p>
            <div class="otp">${otp}</div>
            <p>This OTP is valid for 10 minutes.</p>
            <div class="footer">
                <p>If you didn't request this, please ignore this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    await sendEmail({
        email,
        subject: 'Password Reset OTP',
        message: `Your password reset OTP is: ${otp}. It is valid for 10 minutes.`,
        html
    });
};

module.exports = {
    sendEmail,
    sendVerificationEmail,
    sendOTPEmail
};
