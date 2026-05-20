import config from '../config';
import { Resend } from 'resend';

export default async function sendEmail({ to, subject, html, from = process.env.RESEND_FROM || config.resendFrom || config.emailFrom }: any) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const overrideTo = process.env.RESEND_OVERRIDE_TO;
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not set');
    }
    if (!from) {
      throw new Error('Email sender address is not configured');
    }
    const resolvedTo = overrideTo || to;
    if (!resolvedTo) {
      throw new Error('Email recipient address is required');
    }

    const resend = new Resend(resendApiKey);

    const { data, error } = await resend.emails.send({
      from,
      to: resolvedTo,
      subject,
      html
    });

    if (error) {
      throw new Error(error.message || 'Resend email failed');
    }

    return data;
  } catch (error: any) {
    console.error('Email sending failed:', error.message);
    throw error;
  }
}