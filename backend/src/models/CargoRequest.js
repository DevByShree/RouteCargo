const mongoose = require('mongoose');
const schema = new mongoose.Schema({

    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },

    customerName: { type: String, default: '' },

    customerPhone: { type: String, default: '' },

    pickupAddress: { type: String, required: true },

    deliveryAddress: { type: String, required: true },

    pickupDate: { type: Date, required: true },

    loadType: { type: String, required: true },

    weight: { type: Number, min: 0, default: 0 },

    weightUnit: { type: String, default: 'ton' },

    description: { type: String, default: '' },

    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'in_transit', 'completed', 'cancelled'],
        default: 'pending', index: true
    }
},
    { timestamps: true });

module.exports = mongoose.model('CargoRequest', schema);
