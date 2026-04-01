const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendVerificationEmail = async (email, name, verificationToken) => {
  const transporter = createTransporter();
  const verificationUrl = `${process.env.CLIENT_URL}/verify/${verificationToken}`;

  const mailOptions = {
    from: `"Honey Box 210" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email - Honey Box 210',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Georgia, serif; color: #333;">
        <div style="background-color: #f5a623; padding: 20px; text-align: center;">
          <h1 style="color: #fff; margin: 0;">Honey Box 210</h1>
          <p style="color: #fff; margin: 5px 0 0;">Fresh Honey from San Antonio, TX</p>
        </div>
        <div style="padding: 30px; background-color: #fffbf0;">
          <h2 style="color: #b8860b;">Welcome, ${name}!</h2>
          <p>Thank you for joining Honey Box 210. Please verify your email address to complete your registration.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}"
               style="background-color: #f5a623; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 5px; font-size: 16px;">
              Verify My Email
            </a>
          </div>
          <p style="font-size: 14px; color: #666;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #b8860b;">${verificationUrl}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #e0d5c0; margin: 20px 0;">
          <p style="font-size: 13px; color: #999; text-align: center;">
            Honey Box 210 &bull; North San Antonio, TX (Alta Vista)<br>
            Free store pickup available!
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send error:', error.message);
    return false;
  }
};

const sendContactEmail = async (name, email, message) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Honey Box 210 Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    replyTo: email,
    subject: `Contact Form: Message from ${name}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Georgia, serif; color: #333;">
        <div style="background-color: #f5a623; padding: 15px; text-align: center;">
          <h2 style="color: #fff; margin: 0;">New Contact Form Message</h2>
        </div>
        <div style="padding: 20px; background-color: #fffbf0;">
          <p><strong>From:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <hr style="border: none; border-top: 1px solid #e0d5c0;">
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Contact email send error:', error.message);
    return false;
  }
};

const sendOrderConfirmationEmail = async (email, name, order) => {
  const transporter = createTransporter();
  const isPickup = order.deliveryMethod === 'pickup';
  const orderNum = order.orderNumber || `#${order._id.toString().slice(-8).toUpperCase()}`;

  const itemRows = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e0d5c0;">${item.name}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e0d5c0; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e0d5c0; text-align: right;">$${item.price.toFixed(2)}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e0d5c0; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join('');

  const mailOptions = {
    from: `"Honey Box 210" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Order Confirmed ${orderNum} - Honey Box 210`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Georgia, serif; color: #333;">
        <div style="background-color: #f5a623; padding: 20px; text-align: center;">
          <h1 style="color: #fff; margin: 0;">Honey Box 210</h1>
          <p style="color: #fff; margin: 5px 0 0;">Fresh Honey from San Antonio, TX</p>
        </div>
        <div style="padding: 30px; background-color: #fffbf0;">
          <h2 style="color: #b8860b;">Thank you, ${name}!</h2>
          <p>Your order has been placed successfully. Here are your order details:</p>

          <div style="background-color: #fff; border: 2px solid #f5a623; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">Order Number</p>
            <p style="margin: 5px 0 0; font-size: 24px; font-weight: bold; color: #2c2c2c; letter-spacing: 2px;">${orderNum}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f5a623; color: #fff;">
                <th style="padding: 10px 12px; text-align: left;">Item</th>
                <th style="padding: 10px 12px; text-align: center;">Qty</th>
                <th style="padding: 10px 12px; text-align: right;">Price</th>
                <th style="padding: 10px 12px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>
          <div style="text-align: right; margin-top: 15px; font-size: 15px;">
            <p style="margin: 4px 0;">Subtotal: <strong>$${order.subtotal.toFixed(2)}</strong></p>
            ${order.shippingCost > 0 ? `<p style="margin: 4px 0;">Shipping: <strong>$${order.shippingCost.toFixed(2)}</strong></p>` : '<p style="margin: 4px 0;">Shipping: <strong>FREE (Pickup)</strong></p>'}
            <p style="margin: 4px 0;">Tax (8.25%): <strong>$${order.tax.toFixed(2)}</strong></p>
            <p style="font-size: 20px; margin-top: 10px; border-top: 2px solid #f5a623; padding-top: 10px;"><strong>Total: $${order.total.toFixed(2)}</strong></p>
          </div>
          <hr style="border: none; border-top: 1px solid #e0d5c0; margin: 20px 0;">
          ${
            isPickup
              ? `<div style="background-color: #f9f5ed; border-radius: 8px; padding: 16px;">
                   <p style="margin: 0;"><strong>Pickup Location:</strong> North San Antonio, TX (Alta Vista)</p>
                   <p style="margin: 8px 0 0; color: #666;">We will notify you when your order is ready for pickup. Pickup is FREE!</p>
                 </div>`
              : `<div style="background-color: #f9f5ed; border-radius: 8px; padding: 16px;">
                   <p style="margin: 0;"><strong>Shipping to:</strong></p>
                   <p style="margin: 8px 0 0;">
                     ${order.shippingAddress.street}<br>
                     ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}
                   </p>
                 </div>`
          }
          <p style="margin-top: 25px;">Warmly,<br><strong>Mari</strong><br>Honey Box 210</p>
          <hr style="border: none; border-top: 1px solid #e0d5c0; margin: 20px 0;">
          <p style="font-size: 13px; color: #999; text-align: center;">
            Honey Box 210 &bull; North San Antonio, TX (Alta Vista)<br>
            <a href="https://www.instagram.com/honeybox210/" style="color: #b8860b;">@honeybox210</a>
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Order confirmation email error:', error.message);
    return false;
  }
};

const sendOrderNotificationEmail = async (customerName, customerEmail, order) => {
  const transporter = createTransporter();
  const orderNum = order.orderNumber || `#${order._id.toString().slice(-8).toUpperCase()}`;
  const isPickup = order.deliveryMethod === 'pickup';

  const itemRows = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e0d5c0;">${item.name}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e0d5c0; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e0d5c0; text-align: right;">$${item.price.toFixed(2)}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e0d5c0; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join('');

  const mailOptions = {
    from: `"Honey Box 210" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    replyTo: customerEmail,
    subject: `New Order ${orderNum} from ${customerName} - $${order.total.toFixed(2)}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Georgia, serif; color: #333;">
        <div style="background-color: #2c2c2c; padding: 20px; text-align: center;">
          <h1 style="color: #f5a623; margin: 0;">New Order Received!</h1>
          <p style="color: #fff; margin: 5px 0 0;">Honey Box 210 Admin</p>
        </div>
        <div style="padding: 30px; background-color: #fffbf0;">
          <div style="background-color: #fff; border: 2px solid #2c2c2c; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 14px; color: #666;">Order Number</p>
            <p style="margin: 5px 0; font-size: 24px; font-weight: bold; color: #2c2c2c; letter-spacing: 2px;">${orderNum}</p>
            <p style="margin: 0; font-size: 14px; color: #666;">Total: <strong style="color: #2c2c2c; font-size: 18px;">$${order.total.toFixed(2)}</strong></p>
          </div>

          <h3 style="color: #b8860b; margin-bottom: 8px;">Customer Info</h3>
          <p><strong>Name:</strong> ${customerName}</p>
          <p><strong>Email:</strong> <a href="mailto:${customerEmail}" style="color: #b8860b;">${customerEmail}</a></p>
          <p><strong>Delivery:</strong> ${isPickup ? 'Store Pickup' : 'Shipping'}</p>
          ${
            !isPickup && order.shippingAddress
              ? `<p><strong>Ship to:</strong> ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}</p>`
              : ''
          }
          ${order.pickupNote ? `<p><strong>Pickup Note:</strong> ${order.pickupNote}</p>` : ''}

          <hr style="border: none; border-top: 1px solid #e0d5c0; margin: 16px 0;">

          <h3 style="color: #b8860b; margin-bottom: 8px;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #2c2c2c; color: #fff;">
                <th style="padding: 10px 12px; text-align: left;">Item</th>
                <th style="padding: 10px 12px; text-align: center;">Qty</th>
                <th style="padding: 10px 12px; text-align: right;">Price</th>
                <th style="padding: 10px 12px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>

          <div style="text-align: right; margin-top: 12px;">
            <p style="margin: 4px 0;">Subtotal: $${order.subtotal.toFixed(2)}</p>
            <p style="margin: 4px 0;">Shipping: ${order.shippingCost > 0 ? '$' + order.shippingCost.toFixed(2) : 'FREE'}</p>
            <p style="margin: 4px 0;">Tax: $${order.tax.toFixed(2)}</p>
            <p style="font-size: 18px; margin-top: 8px; border-top: 2px solid #2c2c2c; padding-top: 8px;"><strong>Total: $${order.total.toFixed(2)}</strong></p>
          </div>

          <hr style="border: none; border-top: 1px solid #e0d5c0; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">
            Payment ID: ${order.paymentIntentId || 'N/A'}<br>
            Order placed: ${new Date(order.createdAt).toLocaleString('en-US', { timeZone: 'America/Chicago' })}
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Order notification email error:', error.message);
    return false;
  }
};

const sendContactConfirmationEmail = async (email, name) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Honey Box 210" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'We Received Your Message - Honey Box 210',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Georgia, serif; color: #333;">
        <div style="background-color: #f5a623; padding: 20px; text-align: center;">
          <h1 style="color: #fff; margin: 0;">Honey Box 210</h1>
          <p style="color: #fff; margin: 5px 0 0;">Fresh Honey from San Antonio, TX</p>
        </div>
        <div style="padding: 30px; background-color: #fffbf0;">
          <h2 style="color: #b8860b;">Hi ${name},</h2>
          <p>Thank you for reaching out to Honey Box 210! We have received your message and wanted to let you know that it's in good hands.</p>
          <p>You should expect a response from us soon. We appreciate your interest and look forward to connecting with you!</p>
          <p style="margin-top: 25px;">Warmly,<br><strong>Mari</strong><br>Honey Box 210</p>
          <hr style="border: none; border-top: 1px solid #e0d5c0; margin: 20px 0;">
          <p style="font-size: 13px; color: #999; text-align: center;">
            Honey Box 210 &bull; North San Antonio, TX (Alta Vista)<br>
            <a href="https://www.instagram.com/honeybox210/" style="color: #b8860b;">@honeybox210</a>
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Contact confirmation email error:', error.message);
    return false;
  }
};

const sendQuoteConfirmationEmail = async (email, name, eventType) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Honey Box 210" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Quote Request Received - Honey Box 210',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Georgia, serif; color: #333;">
        <div style="background-color: #f5a623; padding: 20px; text-align: center;">
          <h1 style="color: #fff; margin: 0;">Honey Box 210</h1>
          <p style="color: #fff; margin: 5px 0 0;">Fresh Honey from San Antonio, TX</p>
        </div>
        <div style="padding: 30px; background-color: #fffbf0;">
          <h2 style="color: #b8860b;">Hi ${name},</h2>
          <p>Thank you for your interest in having Honey Box 210 at your upcoming <strong>${eventType}</strong> event!</p>
          <p>We have received your quote request and wanted to let you know that it's being reviewed. You should expect a response from us soon with more details.</p>
          <p>We're excited about the possibility of working with you and making your event a little sweeter!</p>
          <p style="margin-top: 25px;">Warmly,<br><strong>Mari</strong><br>Honey Box 210</p>
          <hr style="border: none; border-top: 1px solid #e0d5c0; margin: 20px 0;">
          <p style="font-size: 13px; color: #999; text-align: center;">
            Honey Box 210 &bull; North San Antonio, TX (Alta Vista)<br>
            <a href="https://www.instagram.com/honeybox210/" style="color: #b8860b;">@honeybox210</a>
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Quote confirmation email error:', error.message);
    return false;
  }
};

const sendQuoteNotificationEmail = async (quote) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Honey Box 210" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    replyTo: quote.email,
    subject: `New Quote Request from ${quote.name} - ${quote.eventType}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Georgia, serif; color: #333;">
        <div style="background-color: #f5a623; padding: 15px; text-align: center;">
          <h2 style="color: #fff; margin: 0;">New Quote Request</h2>
        </div>
        <div style="padding: 20px; background-color: #fffbf0;">
          <p><strong>Name:</strong> ${quote.name}</p>
          <p><strong>Email:</strong> ${quote.email}</p>
          <p><strong>Phone:</strong> ${quote.phone || 'N/A'}</p>
          <p><strong>Company:</strong> ${quote.company || 'N/A'}</p>
          <hr style="border: none; border-top: 1px solid #e0d5c0;">
          <p><strong>Event Type:</strong> ${quote.eventType}</p>
          <p><strong>Event Date:</strong> ${quote.eventDate}</p>
          <p><strong>Event Location:</strong> ${quote.eventLocation}</p>
          <p><strong>Guest Count:</strong> ${quote.guestCount || 'N/A'}</p>
          ${quote.details ? `<hr style="border: none; border-top: 1px solid #e0d5c0;"><p><strong>Details:</strong></p><p style="white-space: pre-wrap;">${quote.details}</p>` : ''}
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Quote notification email error:', error.message);
    return false;
  }
};

const sendResetPasswordEmail = async (email, name, resetToken) => {
  const transporter = createTransporter();
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const mailOptions = {
    from: `"Honey Box 210" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Password - Honey Box 210',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Georgia, serif; color: #333;">
        <div style="background-color: #f5a623; padding: 20px; text-align: center;">
          <h1 style="color: #fff; margin: 0;">Honey Box 210</h1>
          <p style="color: #fff; margin: 5px 0 0;">Fresh Honey from San Antonio, TX</p>
        </div>
        <div style="padding: 30px; background-color: #fffbf0;">
          <h2 style="color: #b8860b;">Hi ${name},</h2>
          <p>You are receiving this email because you (or someone else) have requested a password reset for your account.</p>
          <p>Please click the button below to complete the process. This link will expire in 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background-color: #f5a623; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 5px; font-size: 16px;">
              Reset My Password
            </a>
          </div>
          <p style="font-size: 14px; color: #666;">
            If you did not request this, please ignore this email and your password will remain unchanged.<br>
            <a href="${resetUrl}" style="color: #b8860b;">${resetUrl}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #e0d5c0; margin: 20px 0;">
          <p style="font-size: 13px; color: #999; text-align: center;">
            Honey Box 210 &bull; North San Antonio, TX (Alta Vista)<br>
            <a href="https://www.instagram.com/honeybox210/" style="color: #b8860b;">@honeybox210</a>
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Reset password email error:', error.message);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendContactEmail,
  sendContactConfirmationEmail,
  sendQuoteConfirmationEmail,
  sendQuoteNotificationEmail,
  sendOrderConfirmationEmail,
  sendOrderNotificationEmail,
};
