import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { resetPasswordSchema, updatePasswordSchema } from '@/lib/validations';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/response';
import { authRateLimit } from '@/lib/rateLimiter';
import nodemailer from 'nodemailer';

// Send reset password email
async function postHandler(request) {
  try {
    const body = await request.json();
    const validatedData = resetPasswordSchema.parse(body);
    const { email } = validatedData;

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists for security
      return successResponse(null, 'If an account with that email exists, a reset link has been sent');
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // Send email
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Reset Your Gridle Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1E3A8A;">Reset Your Password</h2>
          <p>You requested a password reset for your Gridle account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="background-color: #1E3A8A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 16px 0;">
            Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    return successResponse(null, 'If an account with that email exists, a reset link has been sent');

  } catch (error) {
    if (error.name === 'ZodError') {
      return validationErrorResponse(error.errors);
    }
    console.error('Reset password error:', error);
    return errorResponse('Failed to send reset email');
  }
}

// Update password with token
async function putHandler(request) {
  try {
    const body = await request.json();
    const validatedData = updatePasswordSchema.parse(body);
    const { token, password } = validatedData;

    await connectDB();

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return errorResponse('Invalid or expired reset token', 400);
    }

    // Update password
    user.password = password; // Will be hashed by pre-save middleware
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return successResponse(null, 'Password updated successfully');

  } catch (error) {
    if (error.name === 'ZodError') {
      return validationErrorResponse(error.errors);
    }
    console.error('Update password error:', error);
    return errorResponse('Failed to update password');
  }
}

export const POST = authRateLimit(postHandler);
export const PUT = authRateLimit(putHandler);