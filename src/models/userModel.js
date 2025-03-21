
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    userId: { type: String},
    name: { type: String , required: true},
    address: {type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: {type: String, required: true},
    profilePic:{type: String , required: true ,default:"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    isActive:{type:Boolean , default: true},
    createdAt: { type: Date, default: Date.now },
  });
  const User = mongoose.model('User', userSchema);


  module.exports = User;
  