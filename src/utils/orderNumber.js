function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `UMA-${timestamp}-${random}`;
}

module.exports = { generateOrderNumber };
