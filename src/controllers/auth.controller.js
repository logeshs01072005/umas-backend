const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const { signToken } = require("../utils/jwt");
const { generateCaptcha, verifyCaptcha } = require("../utils/captcha");

function formatUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    city: user.city,
    pincode: user.pincode,
    status: user.status || "Active",
    avatarUrl: user.avatar_url || null,
    savedAddresses: user.saved_addresses || [],
    isAdmin: user.is_admin,
    createdAt: user.created_at,
  };
}

async function getCaptcha(req, res) {
  const captcha = generateCaptcha();
  res.json(captcha);
}

async function register(req, res, next) {
  try {
    const { name, email, password, phone, address, city, pincode, captchaToken, captchaAnswer } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    if (captchaToken && captchaAnswer !== undefined) {
      const isValid = verifyCaptcha(captchaToken, captchaAnswer);
      if (!isValid) {
        return res.status(400).json({ error: "Invalid or expired CAPTCHA answer. Please try again." });
      }
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password_hash: hash,
      phone: phone || null,
      address: address || null,
      city: city || null,
      pincode: pincode || null,
      status: "Active",
      saved_addresses: address ? [{ label: "Home", address, city: city || "", pincode: pincode || "", is_default: true }] : [],
    });

    const token = signToken({ id: user._id });
    res.status(201).json({
      token,
      user: formatUser(user),
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password, captchaToken, captchaAnswer } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required." });

    if (captchaToken && captchaAnswer !== undefined) {
      const isValid = verifyCaptcha(captchaToken, captchaAnswer);
      if (!isValid) {
        return res.status(400).json({ error: "Invalid or expired CAPTCHA answer. Please try again." });
      }
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: "Invalid email or password." });

    if (user.status === "Blocked") {
      return res.status(403).json({ error: "Your account has been blocked by the administrator. Please contact support." });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: "Invalid email or password." });

    const token = signToken({ id: user._id });
    res.json({
      token,
      user: formatUser(user),
    });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });
    if (user.status === "Blocked") {
      return res.status(403).json({ error: "Your account has been blocked." });
    }
    res.json({ user: formatUser(user) });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { name, phone, address, city, pincode, avatarUrl, savedAddresses } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (pincode !== undefined) updateData.pincode = pincode;
    if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl;
    if (Array.isArray(savedAddresses)) updateData.saved_addresses = savedAddresses;

    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true });
    if (!user) return res.status(404).json({ error: "User not found." });

    res.json({ user: formatUser(user) });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters." });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) {
      return res.status(400).json({ error: "Incorrect current password." });
    }

    user.password_hash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    next(err);
  }
}

async function requestPasswordReset(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required." });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Do not reveal existence of account
      return res.json({ message: "If an account exists, password reset instructions have been sent." });
    }

    const token = crypto.randomBytes(20).toString("hex");
    user.reset_password_token = token;
    user.reset_password_expires = Date.now() + 3600 * 1000; // 1 hour
    await user.save();
    // Prepare reset link using CLIENT_URL (frontend)
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl.replace(/\/$/, "")}/reset.html?token=${token}`;

    // Send email using nodemailer if SMTP configured
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
        secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      });

      const mailOptions = {
        from: process.env.SMTP_FROM || `Uma's Boutique <${process.env.SMTP_USER || 'no-reply@umas.com'}>`,
        to: user.email,
        subject: "Uma's Boutique — Password reset instructions",
        text: `We received a request to reset your password. Click the link below to set a new password:\n\n${resetUrl}\n\nIf you didn't request this, please ignore this email. This link expires in 1 hour.`,
        html: `<p>We received a request to reset your password.</p><p><a href="${resetUrl}">Click here to reset your password</a></p><p>If you didn't request this, please ignore this email. This link expires in 1 hour.</p>`,
      };

      await transporter.sendMail(mailOptions);
      res.json({ message: "Password reset instructions sent if the account exists." });
    } catch (mailErr) {
      console.error("Error sending password reset email:", mailErr);
      // Fallback: still return success to avoid account enumeration
      res.json({ message: "Password reset instructions sent if the account exists." });
    }
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: "Token and newPassword are required." });
    if (newPassword.length < 6) return res.status(400).json({ error: "New password must be at least 6 characters." });

    const user = await User.findOne({ reset_password_token: token, reset_password_expires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ error: "Invalid or expired token." });

    user.password_hash = await bcrypt.hash(newPassword, 10);
    user.reset_password_token = null;
    user.reset_password_expires = null;
    await user.save();

    res.json({ success: true, message: "Password has been reset successfully." });
  } catch (err) {
    next(err);
  }
}

// Insecure convenience endpoint: reset password by providing email + newPassword.
// This does not verify ownership of the email and should only be enabled
// when the application explicitly wants this behavior.
async function resetPasswordDirect(req, res, next) {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ error: "Email and newPassword are required." });
    if (newPassword.length < 6) return res.status(400).json({ error: "New password must be at least 6 characters." });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found." });

    user.password_hash = await bcrypt.hash(newPassword, 10);
    user.reset_password_token = null;
    user.reset_password_expires = null;
    await user.save();

    res.json({ success: true, message: "Password updated successfully. Please login." });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCaptcha, register, login, me, updateProfile, changePassword, requestPasswordReset, resetPassword, resetPasswordDirect };
