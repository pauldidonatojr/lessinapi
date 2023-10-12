const nodemailer = require("nodemailer");

const sendTokenEmail = async (receiverEmail, verify_token) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const approvalLink = `https://nocableneeded-auth.onrender.com/auth/api/verify?email=${encodeURIComponent(
      receiverEmail
    )}&verify_token=${encodeURIComponent(verify_token)}`;



    const sendTokenLink = `https://nocableneeded-auth.onrender.com/auth/send-token/${encodeURIComponent(
      receiverEmail
    )}/${encodeURIComponent(verify_token)}`;


    const mail_config = {
      from: process.env.MAIL_USERNAME,
      to: receiverEmail,
      subject: "Email verification for " + receiverEmail,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">

          <!-- Approval Card -->
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <p style="font-size: 16px;">Dear User,</p>
            <p style="font-size: 16px;">Thank you for signing up! Please click the button below to verify your account & complete your signup process:</p>
            <p style="font-size: 16px;">discover endless entertainment with No Cable Needed 3-Day Free trial by using the code 2162C7387869255</p>

            
            <a href="${approvalLink}" style="display: inline-block; background-color: #007bff; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">Approve</a>

          </div>

          

          <p style="margin-top: 20px;">After click you will be redirected to verification page, if verification is successfull you will be shown your Username, please keep it save for Login.</p>
      </div>
      `,
    };

    transporter.sendMail(mail_config, (error, info) => {
      if (error) {
        console.log("error", error);
        return reject({ message: "Error has occurred" });
      }
      return resolve({ message: "Email sent!" });
    });
  });
};



const sendEmail = async (req, res) => {
  const { email, verify_token } = req.params; // Use req.params to access route parameters
  if (!email || !verify_token) {
    console.log("Receiver email or verification token is missing.");
    return res.status(400).json({ message: "Receiver email or verification token is missing." });
  }
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const approvalLink = `https://nocableneeded-auth.onrender.com/auth/api/verify?email=${encodeURIComponent(
      email
    )}&verify_token=${encodeURIComponent(verify_token)}`;

    // <input
    //   type="text"
    //   id="verificationToken"
    //   value="${verify_token}"
    //   readonly
    //   style="width: 100%; padding: 10px; margin-top: 10px; border: 1px solid #ccc; border-radius: 4px;"
    // >


    const mail_config = {
      from: process.env.MAIL_USERNAME,
      to: email,
      subject: "Verify your NOCABLESNEEDED Account!",
      html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">

      <!-- Approval Card -->
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px;">
        <p style="font-size: 16px;">Dear User,</p>
        <p style="font-size: 16px;">Thank you for signing up! To verify your email address, please click the button below to verify your account & complete your signup process:</p>

        
        <a href="${approvalLink}" style="display: inline-block; background-color: #007bff; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">Approve</a>

      </div>
    </div>
      `,
    };

    transporter.sendMail(mail_config, (error, info) => {
      if (error) {
        console.log("error", error);
        return res.status(500).json({ message: "Error sending email" });
      }
      return res.status(200).json({ message: "Email sent!" });
    });
  } catch (err) {
    console.log("Error sending email", err);
    return res.status(500).json({ message: "Error sending email" });
  }
};


const sendEmails = async (email,BCCemail,message,subject) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const mail_config = {
      from: process.env.MAIL_USERNAME,
      to: email,
      bcc: BCCemail,
      subject: subject,
      html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">

      <!-- message body -->
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px;">
        <p style="font-size: 16px;">Dear User,</p>
        <p style="font-size: 16px;">${message}</p>
      </div>
    </div>
      `,
    };

    transporter.sendMail(mail_config, (error, info) => {
      if (error) {
        console.log("error", error);
        return reject({ message: "Error has occurred" });
      }
      return resolve({ message: "Email sent!" });
    });
  });
};

const resetPasswordEmail = async (receiverEmail, verify_token) => {
  return new Promise((resolve, reject) => {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const approvalLink = `https://nocableneeded-auth.onrender.com/auth/api/verify?email=${encodeURIComponent(
      receiverEmail // Use 'email' from route parameters
    )}&verify_token=${encodeURIComponent(verify_token)}`;

    const sendTokenLink = `https://nocableneeded-auth.onrender.com/auth/send-token/${encodeURIComponent(
      receiverEmail
    )}/${encodeURIComponent(verify_token)}`;

    const mail_config = {
      from: process.env.MAIL_USERNAME,
      to: receiverEmail,
      subject: "Password Reset verification for " + receiverEmail,
      html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">

      <!-- Approval Card -->
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px;">
        <p style="font-size: 16px;">Dear User,</p>
        <p style="font-size: 16px;">To verify your email address, please copy the referral code below and use it to complete your reset password process:</p>

        <!-- Verification Token Text Box -->
        <input
          type="text"
          id="verificationToken"
          value="${verify_token}"
          readonly
          style="width: 100%; padding: 10px; margin-top: 10px; border: 1px solid #ccc; border-radius: 4px;"
        >

      </div>
    </div>
      `,
    };

    transporter.sendMail(mail_config, (error, info) => {
      if (error) {
        console.log("error", error);
        return reject({ message: "error has occured" });
      }
      return resolve({ message: "Email sent!" });
    });
  });
};


module.exports = { sendEmail, sendTokenEmail, resetPasswordEmail,sendEmails };
