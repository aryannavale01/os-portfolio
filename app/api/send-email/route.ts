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
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br/>');
}

function buildEmailHtml({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Portfolio Message</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);padding:28px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size:13px;color:rgba(255,255,255,0.5);letter-spacing:1.5px;text-transform:uppercase;font-weight:600;">Portfolio Contact Form</div>
                    <div style="font-size:22px;font-weight:700;color:#ffffff;margin-top:6px;">New Message Received</div>
                  </td>
                  <td align="right" style="vertical-align:top;">
                    <div style="width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,0.12);border:2px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:18px;color:#fff;font-weight:700;">AN</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Blue accent bar -->
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,#4d8eff,#6366f1,#8b5cf6);"></td>
          </tr>

          <!-- Sender info card -->
          <tr>
            <td style="padding:28px 32px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fc;border-radius:10px;border:1px solid #e8ecf1;">
                <tr>
                  <td style="padding:18px 20px;">
                    <div style="font-size:11px;font-weight:600;color:#8892a4;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Sender Details</div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:4px 0;font-size:13px;color:#8892a4;width:60px;vertical-align:top;">Name</td>
                        <td style="padding:4px 0;font-size:14px;color:#1a1a2e;font-weight:600;">${escapeHtml(name || 'Anonymous')}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;font-size:13px;color:#8892a4;vertical-align:top;">Email</td>
                        <td style="padding:4px 0;font-size:14px;color:#4d8eff;font-weight:500;">${escapeHtml(email)}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;font-size:13px;color:#8892a4;vertical-align:top;">Subject</td>
                        <td style="padding:4px 0;font-size:14px;color:#1a1a2e;font-weight:600;">${escapeHtml(subject)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message body -->
          <tr>
            <td style="padding:20px 32px;">
              <div style="font-size:11px;font-weight:600;color:#8892a4;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Message</div>
              <div style="padding:16px 20px;background-color:#ffffff;border-radius:10px;border:1px solid #e8ecf1;border-left:4px solid #4d8eff;font-size:14px;line-height:1.7;color:#374151;">
                ${escapeHtml(message)}
              </div>
            </td>
          </tr>

          <!-- Reply button -->
          <tr>
            <td style="padding:0 32px 24px;" align="center">
              <a href="mailto:${escapeHtml(email)}?subject=Re: ${escapeHtml(subject)}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#4d8eff,#6366f1);color:#ffffff;font-size:13px;font-weight:600;text-decoration:none;border-radius:8px;letter-spacing:0.3px;">
                Reply to ${escapeHtml(name || 'Sender')}
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:18px 32px;background-color:#f8f9fc;border-top:1px solid #e8ecf1;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:11px;color:#a0a8b6;line-height:1.5;">
                    Sent via <strong style="color:#6b7280;">Aryan Navale's Portfolio</strong> contact form<br/>
                    <span style="color:#c0c6d0;">${new Date().toLocaleString('en-US', {dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata'})} IST</span>
                  </td>
                  <td align="right" style="vertical-align:bottom;">
                    <a href="https://github.com/aryannavale01" style="font-size:11px;color:#4d8eff;text-decoration:none;">GitHub</a>
                    <span style="color:#d1d5db;margin:0 6px;">|</span>
                    <a href="https://linkedin.com/in/aryan-navale-207961291" style="font-size:11px;color:#4d8eff;text-decoration:none;">LinkedIn</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(req: Request) {
  if (!resend) {
    return NextResponse.json(
      {error: 'Email service not configured. Please add RESEND_API_KEY.'},
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
      return NextResponse.json(
        {error: 'A valid email address is required.'},
        {status: 400},
      );
    }
    if (!message?.trim()) {
      return NextResponse.json(
        {error: 'Message cannot be empty.'},
        {status: 400},
      );
    }

    const cleanName = (name || 'Anonymous').trim().slice(0, 100);
    const cleanSubject = (subject || 'New message').trim().slice(0, 200);
    const cleanMessage = message.trim().slice(0, 5000);

    const html = buildEmailHtml({
      name: cleanName,
      email,
      subject: cleanSubject,
      message: cleanMessage,
    });

    const {data, error} = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: `[Portfolio] ${cleanSubject}`,
      html,
      replyTo: email,
    });

    if (error) {
      console.error('[send-email] Resend API error:', JSON.stringify(error));
      return NextResponse.json(
        {error: error.message || 'Email delivery failed. Please try again.'},
        {status: 500},
      );
    }

    return NextResponse.json({success: true, id: data?.id});
  } catch (err) {
    console.error('[send-email] Route error:', err);
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        {error: 'Invalid request body. Expected JSON.'},
        {status: 400},
      );
    }
    const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return NextResponse.json({error: msg}, {status: 500});
  }
}
