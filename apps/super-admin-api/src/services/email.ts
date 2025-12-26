import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.MAILHOG_HOST || 'mailhog',
    port: parseInt(process.env.MAILHOG_PORT || '1025'),
    secure: false, // true for 465, false for other ports
});

export const sendVerificationEmail = async (email: string, token: string) => {
    const verificationLink = `${process.env.SUPER_ADMIN_DASHBOARD_URL || 'http://localhost:3101'}/verify-email?token=${token}`;

    try {
        const info = await transporter.sendMail({
            from: '"Super Admin Auth" <auth@football-ticketing.com>',
            to: email,
            subject: "Verify your Super Admin Account",
            html: `
        <h1>Welcome!</h1>
        <p>Please click the link below to verify your account:</p>
        <a href="${verificationLink}">${verificationLink}</a>
      `,
        });

        console.log("Message sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email: ", error);
        return false;
    }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
    const resetLink = `${process.env.SUPER_ADMIN_DASHBOARD_URL || 'http://localhost:3101'}/reset-password?token=${token}`;

    try {
        const info = await transporter.sendMail({
            from: '"Super Admin Auth" <auth@football-ticketing.com>',
            to: email,
            subject: "Reset your Password",
            html: `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset. Please click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
        });

        console.log("Password reset email sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending password reset email: ", error);
        return false;
    }
};
