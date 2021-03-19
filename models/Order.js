const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    cart: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'product'
        },
        price: {
            type: Number,
            required: true
        }
    }],
    total: {
        type: Number,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    user_name: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});


module.exports = Order = mongoose.model('orders', OrderSchema);