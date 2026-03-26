import logger from "../utils/logger.js";

/**
 * A simple email helper for EchoNet, aligned with reference OTP flow.
 */
export const emailHelper = {
  sendResetPasswordEmail: async (email: string, otp: string) => {
    logger.info(`---------- PASSWORD RESET OTP ----------`);
    logger.info(`To: ${email}`);
    logger.info(`OTP: ${otp}`);
    logger.info(`------------------------------------------`);
  },
  
  sendVerificationEmail: async (email: string, otp: string) => {
    logger.info(`---------- EMAIL VERIFICATION OTP ----------`);
    logger.info(`To: ${email}`);
    logger.info(`OTP: ${otp}`);
    logger.info(`------------------------------------------`);
  }
};
