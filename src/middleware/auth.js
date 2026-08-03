const { verifyToken } = require("../utils/jwt");
const User = require("../models/User");

/** Requires a valid JWT. Attaches req.user = { id, name, email, isAdmin } */
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Authentication required." });

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ error: "User no longer exists." });

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city,
      pincode: user.pincode,
      isAdmin: user.is_admin,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

/** Must be used after requireAuth. Blocks non-admins. */
function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) return res.status(403).json({ error: "Admin access required." });
  next();
}

module.exports = { requireAuth, requireAdmin };
