import {NextResponse} from 'next/server';
import {Resend} from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TO_EMAIL = process.env.RESEND_TO_EMAIL || 'aryannavale99@gmail.com';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'osportfolio@resend.dev';

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

function esc(str: string): string {
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
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(subject)}</title>
  <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <!-- Full-width background -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0f172a;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;border-radius:16px;overflow:hidden;background-color:#1e293b;border:1px solid rgba(148,163,184,0.1);">

          <!-- Gradient Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e293b 0%,#334155 40%,#475569 70%,#64748b 100%);padding:32px 36px 28px;border-bottom:1px solid rgba(148,163,184,0.15);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div style="font-size:10px;font-weight:700;color:rgba(148,163,184,0.6);letter-spacing:2px;text-transform:uppercase;">PORTFOLIO CONTACT</div>
                    <div style="font-size:24px;font-weight:800;color:#f1f5f9;margin-top:8px;line-height:1.2;">New Message Received</div>
                    <div style="font-size:13px;color:#94a3b8;margin-top:6px;">via your portfolio contact form</div>
                  </td>
                  <td align="right" style="vertical-align:top;">
                    <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#3b82f6,#6366f1);display:flex;align-items:center;justify-content:center;font-size:18px;color:#fff;font-weight:800;letter-spacing:-0.5px;">AN</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Accent line -->
          <tr>
            <td style="height:2px;background:linear-gradient(90deg,#3b82f6,#6366f1,#8b5cf6);"></td>
          </tr>

          <!-- Sender Card -->
          <tr>
            <td style="padding:28px 36px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0f172a;border-radius:12px;border:1px solid rgba(148,163,184,0.08);">
                <tr>
                  <td style="padding:20px 24px;">
                    <div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:14px;">Sender Details</div>

                    <!-- Name -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:6px 0;font-size:12px;color:#64748b;width:65px;vertical-align:top;font-weight:500;">Name</td>
                        <td style="padding:6px 0;font-size:14px;color:#e2e8f0;font-weight:600;">${esc(name || 'Anonymous')}</td>
                      </tr>
                      <!-- Email -->
                      <tr>
                        <td style="padding:6px 0;font-size:12px;color:#64748b;vertical-align:top;font-weight:500;">Email</td>
                        <td style="padding:6px 0;"><a href="mailto:${esc(email)}" style="font-size:14px;color:#60a5fa;font-weight:500;text-decoration:none;">${esc(email)}</a></td>
                      </tr>
                      <!-- Subject -->
                      <tr>
                        <td style="padding:6px 0;font-size:12px;color:#64748b;vertical-align:top;font-weight:500;">Subject</td>
                        <td style="padding:6px 0;font-size:14px;color:#e2e8f0;font-weight:600;">${esc(subject)}</td>
                      </tr>
                      <!-- Time -->
                      <tr>
                        <td style="padding:6px 0;font-size:12px;color:#64748b;vertical-align:top;font-weight:500;">Time</td>
                        <td style="padding:6px 0;font-size:13px;color:#94a3b8;">${new Date().toLocaleString('en-US', {dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata'})} IST</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding:24px 36px;">
              <div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;">Message</div>
              <div style="padding:18px 22px;background-color:#0f172a;border-radius:10px;border:1px solid rgba(148,163,184,0.08);border-left:3px solid #3b82f6;">
                <div style="font-size:14px;line-height:1.75;color:#cbd5e1;">${esc(message)}</div>
              </div>
            </td>
          </tr>

          <!-- Reply Button -->
          <tr>
            <td style="padding:0 36px 32px;" align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="border-radius:10px;background:linear-gradient(135deg,#3b82f6,#6366f1);">
                    <a href="mailto:${esc(email)}?subject=Re%3A%20${encodeURIComponent(subject)}" target="_blank" style="display:inline-block;padding:13px 32px;font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">Reply to ${esc(name || 'Sender')}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 36px;">
              <div style="height:1px;background:rgba(148,163,184,0.1);"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size:11px;color:#475569;line-height:1.6;">
                    Sent from <a href="https://github.com/aryannavale01" style="color:#60a5fa;text-decoration:none;font-weight:600;">Aryan Navale's</a> portfolio<br/>
                    <span style="color:#334155;">Automated notification — no reply needed</span>
                  </td>
                  <td align="right" style="vertical-align:bottom;">
                    <a href="https://github.com/aryannavale01" style="font-size:11px;color:#60a5fa;text-decoration:none;font-weight:500;">GitHub</a>
                    <span style="color:#334155;margin:0 8px;">/</span>
                    <a href="https://linkedin.com/in/aryan-navale-207961291" style="font-size:11px;color:#60a5fa;text-decoration:none;font-weight:500;">LinkedIn</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- /Card -->

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
