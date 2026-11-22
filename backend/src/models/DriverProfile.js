const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    ownerName: { type: String, required: true, trim: true, maxlength: 100 },
    contactNumber: { type: String, trim: true, maxlength: 20, default: '' },
    email: { type: String, trim: true, lowercase: true },
    verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    isActive: { type: Boolean, default: true, index: true },
    altNumber: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    companyName: { type: String, trim: true, default: '' },
    gstNumber: { type: String, trim: true, uppercase: true, default: '' },
    companyAddress: { type: String, trim: true, default: '' },
    yearEstablishment: { type: Number, min: 1800, max: 2100, default: null }
},
    { timestamps: true });

module.exports = mongoose.model('DriverProfile', schema);
