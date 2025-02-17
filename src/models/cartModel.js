const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
    menuItem: [
        {
            menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, default: 1 },
        }
    ],
    coupon: { type: String, default: null },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
});


cartSchema.methods.calculateTotalPrice = function () {
    this.totalAmount = this.menuItem.reduce((total, item) => total + (item.price * item.quantity), 0) - this.discountAmount;
};

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
