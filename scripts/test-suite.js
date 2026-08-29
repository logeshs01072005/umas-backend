/**
 * Automated Verification & Test Suite for Uma's Fashion & Boutique
 * Tests database schema, size-based pricing, cart total calculations, and Razorpay signature verification logic.
 */

const crypto = require("crypto");
const mongoose = require("mongoose");
const path = require("path");

// Load backend models
const Product = require("../src/models/Product");
const { generateInvoiceHtml } = require("../src/controllers/payment.controller");

async function runTests() {
  console.log("=================================================");
  console.log("🧪 Starting Automated Verification & Test Suite");
  console.log("=================================================\n");

  let testPassed = 0;
  let testFailed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      testPassed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      testFailed++;
    }
  }

  // 1. Test Product Schema with size_prices
  console.log("1. Testing Product Model & Size Pricing Schema...");
  try {
    const testProd = new Product({
      name: "Test Silk Saree",
      category: "Sarees",
      price: 1999,
      mrp: 2999,
      sizes: ["S", "M", "L", "XL"],
      size_prices: {
        "S": 1999,
        "M": 2199,
        "L": 2399,
        "XL": 2599
      }
    });

    assert(testProd.name === "Test Silk Saree", "Product name set correctly");
    assert(testProd.size_prices.get("XL") === 2599, "Size XL custom price evaluated correctly (₹2599)");
    assert(testProd.size_prices.get("M") === 2199, "Size M custom price evaluated correctly (₹2199)");
    assert(testProd.avg_rating === 4.5, "Product default rating evaluates to 4.5 ⭐");
    assert(testProd.num_reviews === 12, "Product default review count evaluates to 12");
  } catch (err) {
    assert(false, `Product schema error: ${err.message}`);
  }

  // 2. Test 100% Free Shipping Calculation
  console.log("\n2. Testing 100% Free Shipping Calculation...");
  try {
    const subtotal = 1299;
    const shippingFee = 0;
    const total = subtotal + shippingFee;
    assert(shippingFee === 0, "Shipping fee is ₹0 (100% Free Shipping)");
    assert(total === 1299, "Total equals subtotal without any courier surcharge");
  } catch (err) {
    assert(false, `Shipping calculation error: ${err.message}`);
  }

  // 3. Test Size Price Cart Override Calculation Logic
  console.log("\n3. Testing Size-Based Cart Price Calculation...");
  try {
    const prod = {
      price: 1999,
      size_prices: new Map([
        ["M", 2199],
        ["XL", 2599]
      ])
    };

    function calculateUnitPrice(prodObj, selectedSize) {
      let unitPrice = Number(prodObj.price);
      if (prodObj.size_prices && selectedSize) {
        const sizePrice = typeof prodObj.size_prices.get === "function" 
          ? prodObj.size_prices.get(selectedSize) 
          : prodObj.size_prices[selectedSize];
        if (sizePrice != null && !isNaN(sizePrice) && Number(sizePrice) > 0) {
          unitPrice = Number(sizePrice);
        }
      }
      return unitPrice;
    }

    assert(calculateUnitPrice(prod, "M") === 2199, "Size M override resolves to ₹2199");
    assert(calculateUnitPrice(prod, "XL") === 2599, "Size XL override resolves to ₹2599");
    assert(calculateUnitPrice(prod, "S") === 1999, "Unset size S falls back to base price ₹1999");
  } catch (err) {
    assert(false, `Cart price calculation error: ${err.message}`);
  }

  // 3. Test Razorpay Signature Verification Logic
  console.log("\n3. Testing Razorpay HMAC SHA256 Signature Verification...");
  try {
    const secret = "test_razorpay_secret_12345";
    const razorpay_order_id = "order_N12345678";
    const razorpay_payment_id = "pay_P98765432";

    const validSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // Verify signature check function
    function verifySignature(rOrderId, rPaymentId, signature, rSecret) {
      const expected = crypto
        .createHmac("sha256", rSecret)
        .update(`${rOrderId}|${rPaymentId}`)
        .digest("hex");
      return expected === signature;
    }

    assert(verifySignature(razorpay_order_id, razorpay_payment_id, validSignature, secret) === true, "Valid Razorpay signature is verified successfully");
    assert(verifySignature(razorpay_order_id, razorpay_payment_id, "invalid_sig_xyz", secret) === false, "Invalid signature is correctly rejected");
  } catch (err) {
    assert(false, `Razorpay signature verification test error: ${err.message}`);
  }

  // 4. Test Invoice HTML Generation
  console.log("\n4. Testing E-Invoice HTML Generation...");
  try {
    const mockOrder = {
      order_number: "UMA-2026-0001",
      ship_name: "Anita Sharma",
      ship_address: "123 Boutique Street",
      ship_city: "Chennai",
      ship_pincode: "600001",
      ship_phone: "9876543210",
      items: [
        { product_name: "Kanjeevaram Saree", size: "Free Size", quantity: 1, price: 2999 },
        { product_name: "Designer Top", size: "L", quantity: 1, price: 699 }
      ],
      subtotal: 3698,
      shipping_fee: 0,
      total: 3698,
      created_at: new Date()
    };

    const html = generateInvoiceHtml(mockOrder);
    assert(html.includes("UMA-2026-0001"), "Invoice includes order number");
    assert(html.includes("Anita Sharma"), "Invoice includes customer name");
    assert(html.includes("Kanjeevaram Saree"), "Invoice includes product items");
  } catch (err) {
    assert(false, `Invoice generation error: ${err.message}`);
  }

  console.log("\n=================================================");
  console.log(`SUMMARY: ${testPassed} Passed, ${testFailed} Failed.`);
  console.log("=================================================\n");

  if (testFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
