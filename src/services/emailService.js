const nodemailer = require('nodemailer');

let transporter;

// Only create transporter if email credentials are configured
if (process.env.EMAIL_USER && !process.env.EMAIL_USER.includes('placeholder')) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
}

async function sendContactEmail(name, email, message) {
  if (!transporter) {
    console.log('Email not configured. Contact form submission:', { name, email, message });
    return { messageId: 'dev-mode-no-email' };
  }

  const mailOptions = {
    from: email,
    to: process.env.CONTACT_EMAIL,
    subject: `Contact Form: ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">New Contact Form Submission</h2>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
          Sent from Sri Nanjundeshwara Mart Contact Form
        </p>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
}

async function sendOrderConfirmation(order, user) {
  if (!transporter) {
    console.log('Email not configured. Order confirmation for:', order.orderNumber);
    return { messageId: 'dev-mode-no-email' };
  }

  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.subtotal}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `Order Confirmed - ${order.orderNumber} | Sri Nanjundeshwara Mart`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">🌿 Order Confirmed!</h1>
        </div>
        <div style="padding: 30px; background: white;">
          <p>Dear ${user.name},</p>
          <p>Thank you for your order! Here are the details:</p>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 8px; text-align: left;">Product</th>
                <th style="padding: 8px; text-align: center;">Qty</th>
                <th style="padding: 8px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 8px; text-align: right;"><strong>Total:</strong></td>
                <td style="padding: 8px; text-align: right;"><strong>₹${order.totalAmount}</strong></td>
              </tr>
            </tfoot>
          </table>
          <p>We'll notify you when your order ships.</p>
          <p style="color: #10B981;">🌿 Stay healthy with Ayurveda!</p>
        </div>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
}

module.exports = { sendContactEmail, sendOrderConfirmation };
