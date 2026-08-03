const crypto = require("crypto");

const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET || "umas_captcha_secret_key_2026";

function generateCaptcha() {
  const num1 = Math.floor(Math.random() * 9) + 1;
  const num2 = Math.floor(Math.random() * 9) + 1;
  const answer = String(num1 + num2);
  const text = `${num1} + ${num2} = ?`;

  const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
  const payload = `${answer}:${expires}`;

  const hmac = crypto.createHmac("sha256", CAPTCHA_SECRET).update(payload).digest("hex");
  const token = `${payload}:${hmac}`;

  return {
    text,
    token,
  };
}

function verifyCaptcha(token, userAnswer) {
  if (!token || !userAnswer) return false;
  const parts = token.split(":");
  if (parts.length !== 3) return false;

  const [answer, expires, hmac] = parts;
  if (Date.now() > Number(expires)) return false;

  const payload = `${answer}:${expires}`;
  const expectedHmac = crypto.createHmac("sha256", CAPTCHA_SECRET).update(payload).digest("hex");

  if (hmac !== expectedHmac) return false;
  return String(userAnswer).trim() === answer;
}

module.exports = { generateCaptcha, verifyCaptcha };
