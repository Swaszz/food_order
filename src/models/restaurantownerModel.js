
const mongoose = require('mongoose')

const restaurantOwnerSchema = new mongoose.Schema({
  restaurantowner_id: { type: mongoose.Schema.Types.ObjectId, auto: true }, 
  name: { type: String, required: true },
  address: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["restaurantOwner", "admin"], default: "restaurantOwner" },
  phone: { type: String, required: true },
  profilePic: {
    type: String,
    default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
  },
  createdAt: { type: Date, default: Date.now },
});
  const Restaurantowner = mongoose.model('Restaurantowner', restaurantOwnerSchema);


  module.exports = Restaurantowner;
  