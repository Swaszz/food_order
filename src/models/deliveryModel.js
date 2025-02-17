const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
}, { _id: true }); 

const deliveryAddressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    addresses: [addressSchema] 
}, { timestamps: true });

const DeliveryAddress = mongoose.model("DeliveryAddress", deliveryAddressSchema);

module.exports = DeliveryAddress;
