import {NextResponse} from 'next/server';
import {Resend} from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TO_EMAIL = process.env.RESEND_TO_EMAIL || 'aryannavale99@gmail.com';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br/>');
}

export async function POST(req: Request) {
  if (!resend) {
    return NextResponse.json(
      {error: 'Email service not configured. Set RESEND_API_KEY.'},
      {status: 503},
    );
  }

  try {
    const body = await req.json();
    const {name, email, subject, message} = body as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
    };

    if (!email || !email.includes('@')) {
      return NextResponse.json({error: 'Valid email is required.'}, {status: 400});
    }
    if (!message?.trim()) {
      return NextResponse.json({error: 'Message cannot be empty.'}, {status: 400});
    }

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="margin-bottom: 16px; color: #1a1a2e;">New message from your portfolio</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #555; width: 80px;">From</td>
            <td style="padding: 8px 12px;">${escapeHtml(name || 'Anonymous')} &lt;${escapeHtml(email)}&gt;</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #555;">Subject</td>
            <td style="padding: 8px 12px;">${escapeHtml(subject || 'No subject')}</td>
          </tr>
        </table>
        <div style="padding: 16px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4d8eff;">
          ${escapeHtml(message)}
        </div>
        <p style="margin-top: 24px; font-size: 12px; color: #999;">
          Sent via Aryan Navale's portfolio contact form
        </p>
      </div>
    `;

    const {error} = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: `[Portfolio] ${subject || 'New message'}`,
      html,
      replyTo: email,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({error: 'Failed to send email.'}, {status: 500});
    }

    return NextResponse.json({success: true});
  } catch (err) {
    console.error('Send email error:', err);
    return NextResponse.json({error: 'Invalid request.'}, {status: 400});
  }
}
