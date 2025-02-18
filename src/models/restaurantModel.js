const mongoose = require('mongoose')

const restaurantSchema = new mongoose.Schema({
    restaurantId:{type:String},  
    restaurantownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurantowner" },
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    menuitem: [
      {
        menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
        name: String,
        quantity: Number,
        price: Number,
      },
    ],
    reviewId:{type: mongoose.Schema.Types.ObjectId, ref: 'Review'},
    createdAt: { type: Date, default: Date.now }
  });
  const Restaurant = mongoose.model('Restaurant', restaurantSchema);


  module.exports= Restaurant;