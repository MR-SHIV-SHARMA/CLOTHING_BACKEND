const calculateTax = (items) => {
  return items.reduce((total, item) => {
    if (!item.product || !item.product.price) {
      console.error(`Missing product details for item:`, item);
      return total; // Skip items without product details
    }

    const productPrice = item.product.price;
    const itemTotal = item.quantity * productPrice;

    console.log(
      `Item: ${item.product.name}, Price: ${productPrice}, Quantity: ${item.quantity}, Total: ${itemTotal}`
    );

    let taxRate = 0.05;
    if (itemTotal > 1000) {
      taxRate = 0.12;
    }

    return total + itemTotal * taxRate;
  }, 0);
};

const calculateShippingCharges = (items) => {
  const vendorCharges = {};

  items.forEach((item) => {
    const vendorId = item.product.merchant;

    // Base charge for the vendor
    if (!vendorCharges[vendorId]) {
      vendorCharges[vendorId] = 50; // Example base charge per vendor
    }

    // Add additional charges based on quantity
    const additionalChargePerItem = 10; // Example rate
    vendorCharges[vendorId] += item.quantity * additionalChargePerItem;
  });

  // Sum up all vendor charges
  return Object.values(vendorCharges).reduce(
    (total, charge) => total + charge,
    0
  );
};

export { calculateTax, calculateShippingCharges };
