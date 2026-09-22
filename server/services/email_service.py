import os
import smtplib
import asyncio
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Load env variables
load_dotenv()

logger = logging.getLogger("uvicorn.error")

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "").replace(" ", "")  # Clean any spaces in app password
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "GUVI Admissions Team")

from email.utils import formatdate, make_msgid

def _send_smtp_sync(to_email: str, subject: str, html_body: str, plain_text: str = "") -> dict:
    """Synchronous SMTP email sender."""
    if not SMTP_USER or not SMTP_PASSWORD:
        logger.warning("SMTP credentials not fully configured. Simulating email send.")
        return {"status": "simulated", "message": "SMTP credentials missing, simulated email."}

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{SMTP_FROM_NAME} <{SMTP_USER}>"
    msg["To"] = to_email
    msg["Reply-To"] = SMTP_USER
    msg["Date"] = formatdate(localtime=True)
    msg["Message-ID"] = make_msgid(domain="guvi.in")

    if plain_text:
        part1 = MIMEText(plain_text, "plain", "utf-8")
        msg.attach(part1)

    part2 = MIMEText(html_body, "html", "utf-8")
    msg.attach(part2)

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, [to_email], msg.as_string())
        logger.info(f"Email sent successfully to {to_email}")
        return {"status": "success", "message": f"Email delivered to {to_email}"}
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        raise e

async def send_payment_reminder_email(
    to_email: str,
    lead_name: str,
    course_title: str,
    amount: float,
    payment_url: str,
    reminder_type: str = "PROACTIVE", # 'PROACTIVE' | 'OVERDUE'
    bda_name: str = "Admissions Team"
) -> dict:
    """Async wrapper around SMTP sending with a modern HTML template."""
    
    is_overdue = (reminder_type.upper() == "OVERDUE")
    
    subject = (
        f"⚠️ Urgent: Complete Down Payment for {course_title} to Secure Batch Seat"
        if is_overdue
        else f"🎓 Complete Your Down-Payment Booking for {course_title}"
    )

    badge_bg = "#fef2f2" if is_overdue else "#ecfdf5"
    badge_color = "#dc2626" if is_overdue else "#00A86B"
    badge_text = "SLA OVERDUE NOTICE" if is_overdue else "BOOKING LINK ACTIVE (24H SLA)"
    
    main_heading = (
        "Your Down Payment Link Has Expired"
        if is_overdue
        else "Complete Your Course Admission Booking"
    )

    sub_message = (
        f"Your down-payment token link for <strong>{course_title}</strong> expired after the 24-hour reservation window. Your seat reservation is currently on hold. Please finalize your token payment now to restore your reserved seat."
        if is_overdue
        else f"Thank you for showing interest in the <strong>{course_title}</strong> program. Your admission booking link is active. Please complete the down payment to lock in your cohort seat."
    )

    html_content = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      color: #1e293b;
    }}
    .container {{
      max-width: 580px;
      margin: 30px auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }}
    .header {{
      background-color: #0f172a;
      padding: 24px;
      text-align: center;
      border-bottom: 3px solid #00A86B;
    }}
    .logo-text {{
      color: #ffffff;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }}
    .logo-accent {{
      color: #00A86B;
    }}
    .body-content {{
      padding: 32px 28px;
    }}
    .badge {{
      display: inline-block;
      padding: 4px 10px;
      background: {badge_bg};
      color: {badge_color};
      font-size: 11px;
      font-weight: 700;
      border-radius: 9999px;
      letter-spacing: 0.5px;
      margin-bottom: 16px;
    }}
    h1 {{
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 12px;
      line-height: 1.3;
    }}
    p {{
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin-top: 0;
      margin-bottom: 18px;
    }}
    .card-box {{
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 18px;
      margin: 20px 0;
    }}
    .info-row {{
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
      border-bottom: 1px dashed #e2e8f0;
    }}
    .info-row:last-child {{
      border-bottom: none;
    }}
    .info-label {{
      color: #64748b;
    }}
    .info-val {{
      font-weight: 600;
      color: #0f172a;
    }}
    .cta-btn {{
      display: block;
      width: 100%;
      text-align: center;
      background-color: #00A86B;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 0;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 700;
      margin: 24px 0 16px 0;
    }}
    .footer {{
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 18px;
      text-align: center;
      font-size: 11.5px;
      color: #94a3b8;
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-text">GUVI <span class="logo-accent">EdTech</span></div>
    </div>
    <div class="body-content">
      <span class="badge">{badge_text}</span>
      <h1>{main_heading}</h1>
      <p>Hi <strong>{lead_name}</strong>,</p>
      <p>{sub_message}</p>
      
      <div class="card-box">
        <div class="info-row">
          <span class="info-label">Candidate Name:</span>
          <span class="info-val">{lead_name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Selected Course:</span>
          <span class="info-val">{course_title}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Down Payment Token:</span>
          <span class="info-val" style="color: #00A86B; font-size: 15px;">₹{amount:,.0f}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Assigned Advisor:</span>
          <span class="info-val">{bda_name}</span>
        </div>
      </div>

      <a href="{payment_url}" class="cta-btn" target="_blank">
        👉 Complete Token Payment (₹{amount:,.0f})
      </a>

      <p style="font-size: 12px; color: #64748b; text-align: center;">
        Or copy and paste this link in your browser:<br>
        <a href="{payment_url}" style="color: #00A86B; word-break: break-all;">{payment_url}</a>
      </p>
    </div>
    <div class="footer">
      This is an automated enrollment notification from GUVI Admissions.<br>
      If you have questions, please reach out directly to your assigned admissions advisor.
    </div>
  </div>
</body>
</html>
"""

    plain_text = f"""
Hi {lead_name},

{sub_message.replace('<strong>', '').replace('</strong>', '')}

Program: {course_title}
Down Payment Amount: INR {amount:,.0f}
Payment Link: {payment_url}
Admissions Advisor: {bda_name}

Best regards,
GUVI Admissions Team
"""

    # Run blocking SMTP IO inside asyncio thread pool to keep FastAPI 100% async
    return await asyncio.to_thread(
        _send_smtp_sync,
        to_email=to_email,
        subject=subject,
        html_body=html_content,
        plain_text=plain_text
    )
