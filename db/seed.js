require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/models/User");
const Product = require("../src/models/Product");

const PRODUCTS = [
  ["Banarasi Silk Saree", "Sarees", "Handwoven Banarasi silk with intricate zari border, finished with a matching unstitched blouse piece.", 8999, 12999, ["Free Size"], "Bestseller"],
  ["Kanjivaram Silk Saree", "Sarees", "Traditional South Indian Kanjivaram weave in a rich temple border pattern.", 10999, 15999, ["Free Size"], "New"],
  ["Chiffon Party Saree", "Sarees", "Lightweight chiffon saree with sequin scatter work, perfect for evening events.", 3499, 4999, ["Free Size"], ""],
  ["Organza Floral Saree", "Sarees", "Hand-painted floral organza saree with a delicate scalloped edge.", 4999, 6999, ["Free Size"], "Sale"],
  ["Bridal Red Lehenga", "Lehengas", "Heavy zardozi bridal lehenga in classic red with a matching dupatta and choli.", 24999, 34999, ["S", "M", "L", "XL"], "Bestseller"],
  ["Pastel Georgette Lehenga", "Lehengas", "Flowy georgette lehenga in a soft pastel palette with thread embroidery.", 15999, 21999, ["S", "M", "L"], ""],
  ["Embroidered Net Lehenga", "Lehengas", "Net lehenga with all-over sequin and thread embroidery, ideal for receptions.", 18999, 25999, ["M", "L", "XL"], "New"],
  ["Anarkali Kurti Set", "Kurtis", "Floor-length anarkali kurti with matching palazzo and dupatta.", 2799, 3999, ["S", "M", "L", "XL"], ""],
  ["Chikankari Kurti", "Kurtis", "Hand-embroidered Lucknowi chikankari kurti in breathable cotton.", 1899, 2599, ["S", "M", "L", "XL", "XXL"], "Bestseller"],
  ["Straight Cotton Kurti", "Kurtis", "Everyday straight-cut cotton kurti with block-print detailing.", 1299, 1799, ["S", "M", "L", "XL"], ""],
  ["Floral Wrap Dress", "Western Wear", "Wrap-style midi dress in a botanical print, cinched with a self-tie belt.", 2499, 3499, ["XS", "S", "M", "L"], ""],
  ["Tailored Blazer Dress", "Western Wear", "Structured blazer dress with a nipped waist, perfect for evening occasions.", 3999, 5499, ["S", "M", "L"], ""],
  ["Denim Co-ord Set", "Western Wear", "Two-piece denim shirt and skirt co-ord set with contrast stitching.", 2999, 3999, ["S", "M", "L", "XL"], "New"],
  ["Kundan Choker Set", "Accessories", "Kundan and pearl choker necklace with matching earrings.", 1999, 2999, ["Free Size"], "Bestseller"],
  ["Gold Plated Jhumkas", "Accessories", "Antique gold-plated jhumka earrings with a pearl drop.", 899, 1299, ["Free Size"], ""],
  ["Embellished Clutch", "Accessories", "Hand-embellished box clutch with a detachable chain strap.", 1499, 1999, ["Free Size"], ""],
  ["Embroidered Juttis", "Footwear", "Traditional embroidered juttis with a cushioned footbed.", 1299, 1799, ["5", "6", "7", "8", "9"], ""],
  ["Block Heels", "Footwear", "Comfortable block heels in a versatile champagne tone.", 1999, 2799, ["4", "5", "6", "7", "8"], "Sale"],
];

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/umas_boutique";
    await mongoose.connect(mongoUri);
    console.log("🍃 Connected to MongoDB for seeding...");

    console.log("Seeding admin user...");
    const adminEmail = process.env.ADMIN_EMAIL || "admin@umas.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminName = process.env.ADMIN_NAME || "Uma Admin";
    
    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
    if (!existingAdmin) {
      const hash = await bcrypt.hash(adminPassword, 10);
      await User.create({
        name: adminName,
        email: adminEmail.toLowerCase(),
        password_hash: hash,
        is_admin: true,
      });
      console.log(`✅ Admin created: ${adminEmail}`);
    } else {
      console.log("ℹ️  Admin already exists, skipping.");
    }

    console.log("Seeding products...");
    const count = await Product.countDocuments();
    if (count === 0) {
      const docs = PRODUCTS.map(([name, category, description, price, mrp, sizes, tag]) => ({
        name,
        category,
        description,
        price,
        mrp,
        sizes,
        tag,
      }));
      await Product.insertMany(docs);
      console.log(`✅ Inserted ${PRODUCTS.length} products.`);
    } else {
      console.log("ℹ️  Products already exist, skipping.");
    }

    console.log("🎉 Seed complete.");
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
