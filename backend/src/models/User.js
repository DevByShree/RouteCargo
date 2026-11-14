const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 96d284424f2df9dbc6d4d4a4c2f2a1ceae46b657
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
<<<<<<< HEAD
=======
const schema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['customer', 'driver'], default: 'customer' }
},
    { timestamps: true });
>>>>>>> 70b053697d292abc5ba02ed2984539de8b4cb543
=======
>>>>>>> 96d284424f2df9dbc6d4d4a4c2f2a1ceae46b657

// Hash password before saving
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Compare candidate password with stored hash
userSchema.methods.matchPassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Exclude password from JSON output by default
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

module.exports = mongoose.model("User", userSchema);
