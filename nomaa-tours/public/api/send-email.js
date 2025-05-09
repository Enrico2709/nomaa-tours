// api/send-email.js
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-Type');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle POST request
  if (req.method === 'POST') {
    const { name, email, phone, date, tourName, tourPrice } = req.body;
    
    // Validate required fields
    if (!name || !email || !phone || !date || !tourName || !tourPrice) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    try {
      // Configure email transporter
      // Note: For production, use environment variables for these credentials
      const transporter = nodemailer.createTransport({
        service: 'gmail',  // Or another email service
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      // Create email content
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'Nomaaadventoursandmorejamaica@gmail.com', // Your business email
        subject: `New Booking Request: ${tourName}`,
        html: `
          <h2>New Tour Booking Request</h2>
          <p><strong>Customer:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Tour:</strong> ${tourName}</p>
          <p><strong>Price:</strong> $${tourPrice} USD</p>
          <p><strong>Date:</strong> ${date}</p>
        `
      };

      // Send email
      await transporter.sendMail(mailOptions);
      
      // Send confirmation to customer
      const confirmationOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Your NOMAA Tours Booking - ${tourName}`,
        html: `
          <h2>Thank You for Your Booking!</h2>
          <p>Dear ${name},</p>
          <p>We have received your booking request for the ${tourName} on ${date}.</p>
          <p>Our team will contact you shortly to confirm your booking and provide additional details.</p>
          <p>Tour details:</p>
          <ul>
            <li>Tour: ${tourName}</li>
            <li>Price: $${tourPrice} USD</li>
            <li>Date: ${date}</li>
          </ul>
          <p>If you have any questions, please contact us at:</p>
          <p>Email: Nomaaadventoursandmorejamaica@gmail.com</p>
          <p>Phone: 876-405-9605 | 876-830-2712 | 876-484-7700</p>
          <p>We look forward to providing you with an unforgettable Jamaican experience!</p>
          <p>Best regards,<br>NOMAA Tours, Adventures, & More Team</p>
        `
      };
      
      await transporter.sendMail(confirmationOptions);

      return res.status(200).send('Thank you for your booking! We will contact you shortly.');
    } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).send('An error occurred while processing your request. Please try again later.');
    }
  }
  
  // Handle any other HTTP method
  return res.status(405).json({ error: 'Method not allowed' });
};