const mongoose = require('mongoose');

const schema = new mongoose.Schema({

    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },

    vehicleName: String,

    vehicleNumber: String,

    availableCapacity: {
        type: Number,
        required: true,
        min: 0
    },
    initialCapacityKg: { type: Number, min: 0, default: null },
    availableCapacityKg: { type: Number, min: 0, default: null },

    capacityUnit: {
        type: String,
        default: 'ton'
    },

    date: {
        type: Date,
        required: true
    },

    from: {
        type: String,
        required: true,
        trim: true
    },

    to: {
        type: String,
        required: true,
        trim: true
    },
    intermediateStops: { type: [String], default: [] },
    expectedArrivalDate: { type: Date, default: null },
    price: { type: Number, min: 0, default: null },
    priceType: { type: String, enum: ['fixed', 'negotiable'], default: 'negotiable' },

    loadTypes: {
        type: [String],
        default: []
    },

    companyName: {
        type: String,
        default: ''
    },

    contactNumber: {
        type: String,
        default: ''
    },

    notes: {
        type: String,
        default: ''
    },

    status: {
        type: String,
        enum: ['draft', 'available', 'booking_requested', 'booked', 'in_transit', 'completed', 'expired', 'cancelled'],
        default: 'available'
    }
},
    {
        timestamps: true
    });

schema.index({ status: 1, from: 1, to: 1, date: 1, availableCapacityKg: 1 });
schema.index({ driverId: 1, status: 1, date: 1 });
    
module.exports = mongoose.model('CapacityPost', schema);
