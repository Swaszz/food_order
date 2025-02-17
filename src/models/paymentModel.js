const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
    paymentId:{type:String,required:true},
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['Card', 'Cash', 'Online'], required: true },
    status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
    paidAt: { type: Date }
  });
  const Payment = mongoose.model('Payment', paymentSchema);

  module.exports = Payment;