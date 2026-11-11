const mongoose = require('mongoose'); const bcrypt = require('bcryptjs');

const schema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['customer', 'driver'], default: 'customer' }
},
    { timestamps: true });

schema.pre('save', async function () {
    if (this.isModified('password'))
        this.password = await bcrypt.hash(this.password, 10);
});

schema.methods.matchPassword = function (p) {
    return bcrypt.compare(p, this.password);
};

schema.methods.toJSON = function () {
    const u = this.toObject(); delete u.password; return u;
};

module.exports = mongoose.model('User', schema);
