import nodemailer from "nodemailer";
import config from "../config/index.js";
import logger from "../utils/logger.js";

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

export const emailHelper = {
  sendResetPasswordEmail: async (email: string, otp: string) => {
    try {
      await transporter.sendMail({
        from: `"EchoNet Security" <${config.smtp.from}>`,
        to: email,
        subject: "Reset your EchoNet Password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
            <p style="color: #555; font-size: 16px;">We received a request to reset your EchoNet password. Here is your 6-digit confirmation code:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="display: inline-block; padding: 15px 25px; background: #f4f4f4; color: #333; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px;">${otp}</span>
            </div>
            <p style="color: #555; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });
      logger.info(`Password reset OTP sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send password reset email to ${email}:`, error);
    }
  },
  
  sendVerificationEmail: async (email: string, otp: string) => {
    try {
      await transporter.sendMail({
        from: `"EchoNet Security" <${config.smtp.from}>`,
        to: email,
        subject: "Verify your EchoNet Email",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #333; text-align: center;">Verify Your Email Address</h2>
            <p style="color: #555; font-size: 16px;">Welcome to EchoNet! Please use the following 6-digit code to verify your email address:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="display: inline-block; padding: 15px 25px; background: #f4f4f4; color: #333; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px;">${otp}</span>
            </div>
            <p style="color: #555; font-size: 14px;">This code will expire shortly.</p>
          </div>
        `,
      });
      logger.info(`Verification OTP sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send verification email to ${email}:`, error);
    }
  }
};
