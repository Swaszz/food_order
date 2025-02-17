const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true }, 
    discountPercentage: { type: Number, required: true }, 
    expirationDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true }
});

const Coupon = mongoose.model("Coupon", couponSchema);
module.exports = Coupon;
