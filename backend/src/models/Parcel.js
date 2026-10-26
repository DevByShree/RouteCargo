
const mongoose = require("mongoose");

const parcelSchema = new mongoose.Schema(
    {
        parcelId: {
            type: Number,
            unique: true,
            required: true,
        },

        shipmentId: {
            type: Number,
            required: true,
            index: true,
        },

        userId: {
            type: Number,
            required: true,
            index: true,
        },

        productName: {
            type: String,
            required: true,
            trim: true,
        },

        parcelType: {
            type: String,
            required: true,
            enum: [
                "Electronics",
                "Furniture",
                "Clothing",
                "Food",
                "Machinery",
                "Documents",
                "Other",
            ],
        },

        numberOfPackages: {
            type: Number,
            required: true,
            min: 1,
            default: 1,
        },

        productImages: [
            {
                type: String,
                trim: true,
            },
        ],

        description: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = mongoose.model("Parcel", parcelSchema);
