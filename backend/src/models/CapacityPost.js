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
        enum: ['available', 'booked', 'expired', 'cancelled'],
        default: 'available'
    }
},
    {
        timestamps: true
    });
    
module.exports = mongoose.model('CapacityPost', schema);
