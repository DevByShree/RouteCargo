const mongoose = require('mongoose');

const file = new mongoose.Schema({

    url: { type: String, required: true },
    originalName: String,
    mimeType: String,
    size: Number
},
    { _id: false });

const schema = new mongoose.Schema({
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    driverProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'DriverProfile', index: true },
    name: { type: String, required: true, trim: true },
    number: { type: String, required: true, trim: true, uppercase: true },
    type: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 0 },
    capacityUnit: { type: String, default: 'ton' },
    dimensions: {
        lengthCm: { type: Number, min: 0, default: null },
        widthCm: { type: Number, min: 0, default: null },
        heightCm: { type: Number, min: 0, default: null },
    },
    volumeCapacityM3: { type: Number, min: 0, default: null },
    axles: { type: Number, min: 1, max: 20, default: null },
    fuelType: { type: String, default: '' },
    modelYear: { type: Number, min: 1950, max: 2100, default: null },
    available: { type: Boolean, default: true },
    documents: { type: [file], default: [] },
    photos: { type: [file], default: [] }
},
    { timestamps: true });

schema.index({ driverId: 1, number: 1 }, { unique: true });

module.exports = mongoose.model('Vehicle', schema);
