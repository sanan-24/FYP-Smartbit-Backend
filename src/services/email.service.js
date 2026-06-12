const nodemailer = require('nodemailer');

// Create a single transporter instance for reuse
let transporter = null;

const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_PORT == 465,
            pool: true, // Use connection pooling for speed
            maxConnections: 5,
            maxMessages: 100,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            // Increase timeouts for live environment stability
            connectionTimeout: 10000, 
            greetingTimeout: 10000,
            socketTimeout: 30000
        });
    }
    return transporter;
};

const sendEmail = async (options) => {
    const mailTransporter = getTransporter();
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    try {
        await mailTransporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Internal Email Error:", error);
        // If connection failed, reset transporter so next attempt creates a new one
        transporter = null;
        throw error;
    }
};

const sendVerificationEmail = async (email, token) => {
    const verificationUrl = `${process.env.APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; color: #333; line-height: 1.5; }
            .container { max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #ff4d30; color: #ffffff !important; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .footer { font-size: 12px; color: #888; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Verify your email address</h2>
            <p>Hi,</p>
            <p>Thanks for signing up for Smart Bite! Please click the button below to verify your email address and complete your registration.</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </p>
            <p>If you did not create an account, no further action is required.</p>
            <p>Best regards,<br>The Smart Bite Team</p>
            <div class="footer">
                <hr style="border: none; border-top: 1px solid #eee;">
                <p>If you're having trouble clicking the "Verify Email Address" button, copy and paste the URL below into your web browser:</p>
                <p style="word-break: break-all;">${verificationUrl}</p>
            </div>
        </div>
    </body>
    </html>
    `;

    await sendEmail({
        email,
        subject: 'Verify your Smart Bite account',
        message: `Verify your email address by clicking this link: ${verificationUrl}`,
        html
    });
};

const sendOTPEmail = async (email, otp) => {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; color: #333; line-height: 1.5; }
            .container { max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px; }
            .otp { font-size: 24px; font-weight: bold; color: #ff4d30; letter-spacing: 2px; text-align: center; margin: 20px 0; background: #f9f9f9; padding: 15px; border-radius: 5px; }
            .footer { font-size: 12px; color: #888; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Password Reset Code</h2>
            <p>Hi,</p>
            <p>You requested to reset your password. Use the following code to proceed:</p>
            <div class="otp">${otp}</div>
            <p>This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
            <p>Best regards,<br>The Smart Bite Team</p>
        </div>
    </body>
    </html>
    `;

    await sendEmail({
        email,
        subject: 'Your Smart Bite reset code',
        message: `Your Smart Bite password reset code is: ${otp}. It is valid for 10 minutes.`,
        html
    });
};

module.exports = {
    sendEmail,
    sendVerificationEmail,
    sendOTPEmail
};
