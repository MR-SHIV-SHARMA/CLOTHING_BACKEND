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

export { calculateTax };
