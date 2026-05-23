import { Router } from "express";
import nodemailer from "nodemailer";

const router = Router();

router.post("/newsletter", async (req, res) => {
  const { firstName, lastName, email } = req.body;

  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"1000 Tongues Website" <${process.env.EMAIL_USER}>`, 
      to: process.env.RECEIVER_EMAIL, 
      subject: "🎉 New Newsletter Subscriber!",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
            <h2>New Newsletter Subscription</h2>
            <p>You have a new subscriber from the 1000 Tongues website:</p>
            <ul style="font-size: 16px;">
            <li><strong>First Name:</strong> ${firstName}</li>
            <li><strong>Last Name:</strong> ${lastName}</li>
            <li><strong>Email:</strong> ${email}</li>
            </ul>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log(`✅ Email sent successfully for: ${email}`);
    res.status(200).json({ message: "Subscription successful and email sent!" });

  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({ error: "Failed to send subscription email." });
  }
});

export default router;