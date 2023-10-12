const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');


const { User } = require("../models/user");

// Comment out the validation imports if you want to remove validation temporarily
const {
  validateUser,
  validateLogin,
  validateEmail,
  validateResetPasswordCredentials,
} = require("../middleware/validation");
const { sendTokenEmail, resetPasswordEmail, sendEmail } = require("../utils/emailService");

exports.signupUser = async (req, res) => {
  const { error } = validateUser(req.body);

  if (error) return res.status(400).send({ message: "Enter data correctly" });

  const { email, password, userName, profile_picture } = req.body;
  console.log(profile_picture)
  const user = await User.findOne({ email: email });
  const username = await User.findOne({ userName: userName });

  if (user) return res.status(404).send({ message: "User already exists" });
  if (username) return res.status(404).send({ message: "Username taken" });

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const verificationToken = crypto.randomBytes(20).toString("hex");

  let newUser = new User({
    email: email,
    password: hashedPassword,
    userName: userName,
    verificationToken: verificationToken,
    profile_picture: profile_picture
  });
  try {
    const savedUser = await newUser.save();
    await sendTokenEmail(email, verificationToken);
    console.log("User saved");
    return res.status(200).send({ message: "User saved!" });
  } catch (err) {
    console.log("Account not saved", err);
    return res.status(400).send({ message: "Account not saved" });
  }
};

exports.loginUser = async (req, res) => {
  const { error } = validateLogin(req.body);

  if (error)
    return res
      .status(400)
      .send({ message: "Error. Enter data in correct form" });

  const { userName, password } = req.body;

  let user = await User.findOne({
    userName: userName,
  });

  if (!user) return res.status(404).send({ message: "Account not found" });
  const hashedPassword = await bcrypt.compare(password, user.password);
  if (!hashedPassword)
    return res.status(404).send({ message: "Invalid email or password" });

  const token = jwt.sign({ userId: user._id.toString() }, "userToken");
  if (!token)
    res.status(400).json({
      message: "Token is empty",
      data: token,
    });
  else {
    return res.status(200).json({
      token: token,
      userName: user.userName,
      email: user.email,
      verified: user.isVerified,
      profile_picture: user.profile_picture
    });
  }
};

exports.changeProfilePicture = async (req, res) => {
  try {
    const { userName, newProfilePictureUrl } = req.body;

    let user = await User.findOne({
      userName: userName,
    });
  
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's profile_picture with the new URL
    user.profile_picture = newProfilePictureUrl;
    console.log(newProfilePictureUrl)

    // Save the updated user document
    const updatedUser = await user.save();

    // Respond with the updated user document or a success message
    return res.status(200).json({ message: 'Profile picture updated', user: updatedUser });
  } catch (error) {
    console.error('Error changing profile picture:', error);
    return res.status(500).json({ message: 'An error occurred while changing the profile picture' });
  }
};



exports.initiateResetPassword = async (req, res) => {
  const { error } = validateEmail(req.body);
  if (error) return res.status(400).send({ message: "Wrong email entered" });
  const { email } = req.body;

  const user = await User.findOne({ email: email });

  if (!user) return res.status(404).send({ message: "Account not found" });

  const randomInt = crypto.randomInt(0, 10000);
  const verificationCode = randomInt.toString().padStart(5, "0");

  user.verificationToken = verificationCode;
  const codeUpdated = await user.save();
  if (codeUpdated) {
    await resetPasswordEmail(email, verificationCode);
    return res
      .status(200)
      .send({ message: "Email sent with verification code" });
  } else {
    return res.status(400).send({ message: "Error! email not sent" });
  }
};

exports.resetPassword = async (req, res) => {
  const { error } = validateResetPasswordCredentials(req.body);
  if (error) {
    console.log("validation error : ", error);

    return res.status(400).send({ message: "Wrong data entered" });
  }
  const { email, verificationToken, password } = req.body;

  const user = await User.findOne({
    email: email,
    verificationToken: verificationToken,
  });
  if (!user)
    return res.status(404).send({ message: "Wrong verification code entered" });

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);
  user.password = hashedPassword;
  const updatedUser = await user.save();
  if (updatedUser)
    return res.status(200).send({ message: "password changed successfully!" });
  else {
    console.log("password not changed ");

    return res.status(400).send({ message: "password not changed" });
  }
};