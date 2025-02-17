
const mongoose = require('mongoose')


const menuItemSchema = new mongoose.Schema({
  menuItemId: { type: String},
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
  reviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Review" },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String },
  availability: { type: Boolean, default: true },
  image: { type: String, default: 'https://www.google.com/imgres?q=blank%20profile&imgurl=https%3A%2F%2Fcdn.pixabay.com%2Fphoto%2F2015%2F10%2F05%2F22%2F37%2Fblank-profile-picture-973460_1280.png&imgrefurl=https%3A%2F%2Fpixabay.com%2Fvectors%2Fblank-profile-picture-mystery-man-973460%2F&docid=wg0CyFWNfK7o5M&tbnid=ycNOFIKv7gjqcM&vet=12ahUKEwiVsN6244uLAxXUSmwGHdJ0Gy0QM3oECBYQAA..i&w=1280&h=1280&hcb=2&ved=2ahUKEwiVsN6244uLAxXUSmwGHdJ0Gy0QM3oECBYQAA' },
  createdAt: { type: Date, default: Date.now },
});
const MenuItem = mongoose.model('MenuItem', menuItemSchema);


module.exports = MenuItem;