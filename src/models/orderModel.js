const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cartId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
    menuItem: [
        {
          menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
          name: String,
          quantity: Number,
          price: Number,
        },
      ],
      deliveryAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
      },
      totalAmount: { type: Number, required: true },
      discountAmount: { type: Number, default: 0 },
      appliedCoupon: { type: String, default: null },
      status: { type: String, default: "Pending" },
      sessionId: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;

 
