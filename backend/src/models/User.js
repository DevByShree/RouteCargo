const mongoose = require('mongoose'); const bcrypt = require('bcryptjs');

<<<<<<< HEAD
const userSchema = new mongoose.Schema(
    {
        userId: {
            type: Number,
            unique: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 6,
        },
        role: {
            type: String,
            enum: ["user", "driver"],
            // default: "customer",
        },
    },
    { timestamps: true }
);
=======
const schema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['customer', 'driver'], default: 'customer' }
},
    { timestamps: true });
>>>>>>> 70b053697d292abc5ba02ed2984539de8b4cb543

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
