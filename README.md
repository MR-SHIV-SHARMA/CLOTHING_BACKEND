// Add item to cart
const addItemToCart = asyncHandler(async (req, res) => {
  const { productId, quantity, appliedCoupon } = req.body;

  if (!productId || !quantity) {
    throw new apiError(400, "Product ID and Quantity are required.");
  }

  const userId = req.admin._id;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  let cart = await Cart.findOne({ user: userId }).populate("items.product");

  if (!cart) {
    cart = new Cart({
      user: userId,
      items: [{ product: productId, quantity }],
    });

    await cart.populate("items.product");
  } else {
    const itemIndex = cart.items.findIndex(
      (item) => item.product._id.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity; // Update quantity if item exists
    } else {
      cart.items.push({ product: productId, quantity }); // Add new item
    }

    if (appliedCoupon) {
      cart.appliedCoupon = appliedCoupon; // Apply coupon if provided
    }
  }

  const cartDetails = calculateCart(cart);

  // Update cart values in the database
  cart.totalPrice = cartDetails.totalPrice;
  cart.tax = cartDetails.tax;
  cart.discount = cartDetails.discount;
  await cart.save();

  return res.status(200).json(
    new apiResponse(
      200,
      {
        cart,
        cartDetails, // Send full cart details in response
      },
      "Item added to cart successfully"
    )
  );
});