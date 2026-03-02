require("dotenv").config({ override: true });
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// ── Config ──
const EMAIL_TO = process.argv[2] || "harshalbhave05@gmail.com";
const TOKEN = crypto.randomBytes(4).toString("hex").toUpperCase();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const mailOptions = {
  from: `"Railway Support" <${process.env.EMAIL_USER}>`,
  to: EMAIL_TO,
  subject: "Your Password Reset Token",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 500px; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
      <h2 style="color: #2c3e50; text-align: center;">Password Reset</h2>
      <p>Hello,</p>
      <p>You requested a password reset. Please use the verification code below:</p>
      <div style="background: #f8f9fa; border: 2px dashed #dee2e6; padding: 15px; font-size: 28px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #e74c3c; margin: 20px 0;">
        ${TOKEN}
      </div>
      <p style="font-size: 12px; color: #7f8c8d; text-align: center;">This code will expire in 15 minutes.</p>
    </div>
  `,
};

console.log("Sending reset email to:", EMAIL_TO);
console.log("Token:", TOKEN);
console.log("From:", process.env.EMAIL_USER);

transporter
  .sendMail(mailOptions)
  .then((info) => {
    console.log("✅ Email sent successfully!");
    console.log("Response:", info.response);
    console.log("\n🔑 Your reset token is:", TOKEN);
  })
  .catch((err) => {
    console.error("❌ Failed to send email:", err.message);
  });
