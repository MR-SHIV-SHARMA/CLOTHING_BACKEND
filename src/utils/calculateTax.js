const calculateTax = (items) => {
  return items.reduce((total, item) => {
    if (!item.product || !item.product.price) {
      console.error(`Missing product details for item:`, item);
      return total; // Skip items without product details
    }

    const productPrice = item.product.price;
    const discount =
      (productPrice * (item.product.discount?.percentage || 0)) / 100;
    const discountedPrice = productPrice - discount;
    const itemTotal = item.quantity * discountedPrice;

    console.log(
      `Item: ${item.product.name}, Price: ${productPrice}, Discounted Price: ${discountedPrice}, Quantity: ${item.quantity}, Total: ${itemTotal}`
    );

    let taxRate = 0.05;
    if (itemTotal > 1000) {
      taxRate = 0.12;
    }

    return total + itemTotal * taxRate;
  }, 0);
};

const calculateShippingDetails = (items) => {
  const shippingDetails = {};

  items.forEach((item) => {
    const vendorId = item.product.merchantc;

    if (!shippingDetails[vendorId]) {
      shippingDetails[vendorId] = {
        vendor: item.product.merchant,
        shippingCharge: 50, // Base charge
      };
    }

    const additionalChargePerItem = 10; // Example rate
    shippingDetails[vendorId].shippingCharge +=
      item.quantity * additionalChargePerItem;
  });

  return Object.values(shippingDetails);
};

const calculateDiscount = (items) => {
  return items.reduce((total, item) => {
    if (
      !item.product ||
      !item.product.price ||
      !item.product.discount?.percentage
    ) {
      return total; // Skip items without discount details
    }

    const productPrice = item.product.price;
    const discount = item.product.discount;

    // Get the current date
    const currentDate = new Date();

    // Check if the discount is valid (current date is within the discount's date range)
    const isDiscountValid =
      currentDate >= new Date(discount.startDate) &&
      currentDate <= new Date(discount.endDate);

    if (isDiscountValid) {
      // Apply discount only if valid
      const discountAmount = (productPrice * discount.percentage) / 100;
      return total + discountAmount * item.quantity;
    }

    return total; // Return total without applying discount if invalid
  }, 0);
};

export { calculateTax, calculateShippingDetails, calculateDiscount };
