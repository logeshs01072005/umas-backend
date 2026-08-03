const express = require("express");
const { getCaptcha, register, login, me, updateProfile, changePassword, requestPasswordReset, resetPassword, resetPasswordDirect } = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/captcha", getCaptcha);
router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, me);
router.put("/profile", requireAuth, updateProfile);
router.put("/change-password", requireAuth, changePassword);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);
// Direct reset (no email verification) — insecure; used when app requires immediate reset by email only.
router.post("/reset-password-direct", resetPasswordDirect);

module.exports = router;
