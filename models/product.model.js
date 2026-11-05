const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
    productName: { type: String, required: true },
    stockLeft: { type: Number, default: 0 },

    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  }
},
{
    timestamps: true
}
);

module.exports = mongoose.model('products', productSchema);