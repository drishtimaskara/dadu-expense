

import express from "express";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import * as User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const otpStore = {};

// SEND OTP
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  try {
    // 🔥 CHECK IF USER EXISTS FIRST
    const existingUser = await User.findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists. Please login instead.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = otp;

    console.log("OTP:", otp);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: email,
      subject: "OTP Verification",
      text: `Your OTP is ${otp}`,
    });

    res.json({ message: "OTP sent" });

  } catch (error) {
    console.log("EMAIL ERROR:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// VERIFY OTP
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

if (Number(otpStore[email]) === Number(otp)) {
    delete otpStore[email];
    return res.json({ success: true });
  }

  res.status(400).json({ message: "Invalid OTP" });
});

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
     if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await User.findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.createUser(
      name,
      email,
      hashedPassword
    );

     const { password: _, ...safeUser } = newUser;

    return res.status(201).json({
      message: "User registered successfully",
      user: safeUser,
    });

  } catch (error) {
    console.log("REGISTER ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findUserByEmail(email);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.log("LOGIN ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;