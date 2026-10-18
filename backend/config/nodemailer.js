import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const STORE_NAME = process.env.STORE_NAME || 'MediStore';

const wrapLayout = (content) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 16px">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
      <tr><td style="padding:32px 32px 16px;background:linear-gradient(135deg,#319795,#2B6CB0);text-align:center">
        <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700">${STORE_NAME}</h1>
      </td></tr>
      <tr><td style="padding:32px 32px 16px">${content}</td></tr>
      <tr><td style="padding:16px 32px 32px;text-align:center;color:#a0aec0;font-size:12px">
        <p style="margin:0">${STORE_NAME} &bull; Medical resources & equipment</p>
        <p style="margin:4px 0 0"><a href="${BASE_URL}" style="color:#319795">${BASE_URL}</a></p>
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`;

const btn = (url, text) =>
    `<table cellpadding="0" cellspacing="0" style="margin:16px auto"><tr>
      <td style="background:#319795;border-radius:8px;padding:12px 28px;text-align:center">
        <a href="${url}" style="color:#fff;text-decoration:none;font-size:15px;font-weight:600;display:block">${text}</a>
      </td>
    </tr></table>`;

export const sendOrderConfirmationEmail = async (to, orderId, orderItems, totalAmount) => {
    const itemsHtml = orderItems.map(item =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #edf2f7;font-size:14px">${item.name}</td>
              <td style="padding:8px 0;border-bottom:1px solid #edf2f7;font-size:14px;text-align:center">${item.qty}</td>
              <td style="padding:8px 0;border-bottom:1px solid #edf2f7;font-size:14px;text-align:right">$${item.price.toFixed(2)}</td>
              <td style="padding:8px 0;border-bottom:1px solid #edf2f7;font-size:14px;text-align:right">$${(item.price * item.qty).toFixed(2)}</td></tr>`
    ).join('');

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject: `Order Confirmed — #${orderId}`,
        html: wrapLayout(`
            <h2 style="margin:0 0 12px;color:#2d3748">Thank you for your order! 🎉</h2>
            <p style="margin:0 0 20px;color:#718096;font-size:15px;line-height:1.6">Your order <strong>#${orderId}</strong> has been received and is being processed.</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr style="background:#f7fafc;font-weight:600;font-size:13px">
                <th style="padding:10px 8px;text-align:left">Item</th>
                <th style="padding:10px 8px;text-align:center">Qty</th>
                <th style="padding:10px 8px;text-align:right">Price</th>
                <th style="padding:10px 8px;text-align:right">Total</th>
              </tr>
              ${itemsHtml}
            </table>
            <p style="margin:20px 0 0;font-size:18px;font-weight:700;color:#2d3748;text-align:right">Total: $${totalAmount.toFixed(2)}</p>
            ${btn(`${BASE_URL}/orders/${orderId}`, 'View Order')}
            <p style="margin:16px 0 0;color:#718096;font-size:14px">We'll notify you when your order ships.</p>
        `)
    });
};

export const sendOrderShippedEmail = async (to, orderId) => {
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject: `Order Shipped — #${orderId}`,
        html: wrapLayout(`
            <h2 style="margin:0 0 12px;color:#2d3748">Your order is on the way! 🚚</h2>
            <p style="margin:0 0 8px;color:#718096;font-size:15px">Good news! Your order <strong>#${orderId}</strong> has been shipped.</p>
            <p style="margin:0 0 20px;color:#718096;font-size:15px">Estimated delivery within 3-5 business days.</p>
            ${btn(`${BASE_URL}/orders/${orderId}`, 'Track Order')}
        `)
    });
};

export const sendOrderDeliveredEmail = async (to, orderId) => {
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject: `Order Delivered — #${orderId}`,
        html: wrapLayout(`
            <h2 style="margin:0 0 12px;color:#2d3748">Order Delivered! ✅</h2>
            <p style="margin:0 0 8px;color:#718096;font-size:15px">Your order <strong>#${orderId}</strong> has been delivered.</p>
            <p style="margin:0 0 20px;color:#718096;font-size:15px">We hope you love your purchase! If you have any questions, our support team is here to help.</p>
            ${btn(`${BASE_URL}/orders/${orderId}`, 'Review Order')}
        `)
    });
};

export const sendPasswordResetEmail = async (to, resetToken) => {
    const resetUrl = `${BASE_URL}/reset-password?token=${resetToken}`;
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject: 'Password Reset Request',
        html: wrapLayout(`
            <h2 style="margin:0 0 12px;color:#2d3748">Reset Your Password</h2>
            <p style="margin:0 0 8px;color:#718096;font-size:15px">You requested a password reset. Click the button below to set a new password.</p>
            ${btn(resetUrl, 'Reset Password')}
            <p style="margin:16px 0 0;color:#a0aec0;font-size:13px">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
        `)
    });
};

export const sendWelcomeEmail = async (to, name) => {
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject: `Welcome to ${STORE_NAME}!`,
        html: wrapLayout(`
            <h2 style="margin:0 0 12px;color:#2d3748">Welcome, ${name}! 👋</h2>
            <p style="margin:0 0 8px;color:#718096;font-size:15px">Thank you for creating an account at ${STORE_NAME}.</p>
            <p style="margin:0 0 20px;color:#718096;font-size:15px">Browse our catalog of medical resources, equipment, and books.</p>
            ${btn(`${BASE_URL}/products`, 'Start Shopping')}
        `)
    });
};

export const sendSupportReplyEmail = async (to, subject, conversationId, replyPreview) => {
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject: `New reply: "${subject}"`,
        html: wrapLayout(`
            <h2 style="margin:0 0 12px;color:#2d3748">New Reply to Your Support Request</h2>
            <p style="margin:0 0 8px;color:#718096;font-size:15px">There's a new reply in your conversation: <strong>${subject}</strong></p>
            <blockquote style="margin:12px 0;padding:12px 16px;background:#f7fafc;border-left:4px solid #319795;color:#4a5568;font-size:14px;border-radius:4px">${replyPreview}</blockquote>
            ${btn(`${BASE_URL}`, 'Open Chat')}
        `)
    });
};
