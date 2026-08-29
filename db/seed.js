require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/models/User");
const Product = require("../src/models/Product");

const PRODUCTS = [
  ["Banarasi Silk Saree", "Sarees", "Handwoven Banarasi silk with intricate zari border, finished with a matching unstitched blouse piece.", 8999, 12999, ["Free Size"], "Bestseller", "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80", 4.8, 38],
  ["Kanjivaram Silk Saree", "Sarees", "Traditional South Indian Kanjivaram weave in a rich temple border pattern.", 10999, 15999, ["Free Size"], "New", "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80", 4.9, 45],
  ["Chiffon Party Saree", "Sarees", "Lightweight chiffon saree with sequin scatter work, perfect for evening events.", 3499, 4999, ["Free Size"], "", "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80", 4.4, 22],
  ["Organza Floral Saree", "Sarees", "Hand-painted floral organza saree with a delicate scalloped edge.", 4999, 6999, ["Free Size"], "Sale", "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80", 4.6, 29],
  ["Bridal Red Lehenga", "Lehengas", "Heavy zardozi bridal lehenga in classic red with a matching dupatta and choli.", 24999, 34999, ["S", "M", "L", "XL"], "Bestseller", "https://images.unsplash.com/photo-1609372332255-611485350f25?w=600&q=80", 5.0, 52],
  ["Pastel Georgette Lehenga", "Lehengas", "Flowy georgette lehenga in a soft pastel palette with thread embroidery.", 15999, 21999, ["S", "M", "L"], "", "https://images.unsplash.com/photo-1594938298603-c8148c4b8f5b?w=600&q=80", 4.7, 31],
  ["Embroidered Net Lehenga", "Lehengas", "Net lehenga with all-over sequin and thread embroidery, ideal for receptions.", 18999, 25999, ["M", "L", "XL"], "New", "https://images.unsplash.com/photo-1610189844946-2d0d5d8e4c3c?w=600&q=80", 4.8, 27],
  ["Anarkali Kurti Set", "Kurtis", "Floor-length anarkali kurti with matching palazzo and dupatta.", 2799, 3999, ["S", "M", "L", "XL"], "", "https://images.unsplash.com/photo-1564201024-c3d29085d77c?w=600&q=80", 4.3, 19],
  ["Chikankari Kurti", "Kurtis", "Hand-embroidered Lucknowi chikankari kurti in breathable cotton.", 1899, 2599, ["S", "M", "L", "XL", "XXL"], "Bestseller", "https://images.unsplash.com/photo-1585914924626-15adac1e6402?w=600&q=80", 4.9, 64],
  ["Straight Cotton Kurti", "Kurtis", "Everyday straight-cut cotton kurti with block-print detailing.", 1299, 1799, ["S", "M", "L", "XL"], "", "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&q=80", 4.2, 16],
  ["Floral Wrap Dress", "Western Wear", "Wrap-style midi dress in a botanical print, cinched with a self-tie belt.", 2499, 3499, ["XS", "S", "M", "L"], "", "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80", 4.5, 24],
  ["Tailored Blazer Dress", "Western Wear", "Structured blazer dress with a nipped waist, perfect for evening occasions.", 3999, 5499, ["S", "M", "L"], "", "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80", 4.6, 18],
  ["Denim Co-ord Set", "Western Wear", "Two-piece denim shirt and skirt co-ord set with contrast stitching.", 2999, 3999, ["S", "M", "L", "XL"], "New", "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80", 4.7, 21],
  ["Kundan Choker Set", "Accessories", "Kundan and pearl choker necklace with matching earrings.", 1999, 2999, ["Free Size"], "Bestseller", "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80", 4.9, 43],
  ["Gold Plated Jhumkas", "Accessories", "Antique gold-plated jhumka earrings with a pearl drop.", 899, 1299, ["Free Size"], "", "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80", 4.5, 30],
  ["Embellished Clutch", "Accessories", "Hand-embellished box clutch with a detachable chain strap.", 1499, 1999, ["Free Size"], "", "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80", 4.4, 15],
  ["Embroidered Juttis", "Footwear", "Traditional embroidered juttis with a cushioned footbed.", 1299, 1799, ["5", "6", "7", "8", "9"], "", "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&q=80", 4.6, 28],
  ["Block Heels", "Footwear", "Comfortable block heels in a versatile champagne tone.", 1999, 2799, ["4", "5", "6", "7", "8"], "Sale", "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80", 4.5, 25],
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
      const docs = PRODUCTS.map(([name, category, description, price, mrp, sizes, tag, image_url, avg_rating, num_reviews]) => ({
        name, category, description, price, mrp, sizes, tag, image_url, avg_rating: avg_rating || 4.5, num_reviews: num_reviews || 12,
      }));
      await Product.insertMany(docs);
      console.log(`✅ Inserted ${PRODUCTS.length} products.`);
    } else {
      // Update existing products that have no image_url or default ratings
      let updated = 0;
      for (const [name, , , , , , , image_url, avg_rating, num_reviews] of PRODUCTS) {
        const result = await Product.updateOne(
          { name },
          { 
            $set: { 
              ...(image_url ? { image_url } : {}),
              avg_rating: avg_rating || 4.5,
              num_reviews: num_reviews || 12,
            } 
          }
        );
        if (result.modifiedCount > 0) updated++;
      }
      console.log(`ℹ️  Products already exist. Updated ${updated} products with images and ratings.`);
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
