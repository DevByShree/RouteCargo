
const Parcel = require("../models/Parcel");
const Counter = require("../models/Counter");
const User = require("../models/User");
const Shipment = require("../models/Shipment");

const createParcel = async (req, res) => {
    try {
        // 1. Request body se data lena
        const {
            shipmentId,
            productName,
            parcelType,
            numberOfPackages,
            productImages,
            description,
        } = req.body;

        // 2. Required fields validate karna
        if (
            shipmentId === undefined ||
            shipmentId === null ||
            shipmentId === "" ||
            !productName?.trim() ||
            !parcelType?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Shipment ID, product name and parcel type are required",
            });
        }

        const validShipmentId = Number(shipmentId);

        if (
            !Number.isSafeInteger(validShipmentId) ||
            validShipmentId < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid shipment ID",
            });
        }

        // 3. Package count validate karna
        const packages = Number(numberOfPackages);

        if (
            numberOfPackages === undefined ||
            numberOfPackages === null ||
            numberOfPackages === "" ||
            !Number.isSafeInteger(packages) ||
            packages < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Number of packages must be at least 1",
            });
        }

        // 4. Parcel type validate karna
        const allowedTypes = [
            "Electronics",
            "Furniture",
            "Clothing",
            "Food",
            "Machinery",
            "Documents",
            "Other",
        ];

        if (!allowedTypes.includes(parcelType.trim())) {
            return res.status(400).json({
                success: false,
                message: "Invalid parcel type",
            });
        }

        // 5. Optional fields validate karna
        if (
            description !== undefined &&
            typeof description !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Description must be a string",
            });
        }

        if (
            productImages !== undefined &&
            (!Array.isArray(productImages) ||
                !productImages.every(
                    (image) => typeof image === "string" && image.trim()
                ))
        ) {
            return res.status(400).json({
                success: false,
                message: "Product images must be an array of valid strings",
            });
        }

        // 6. Logged-in user find karna
        if (!req.user?.id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // 7. Shipment find aur ownership verify karna
        const shipment = await Shipment.findOne({
            shipmentid: validShipmentId,
            userId: user.userId,
        });

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: "Shipment not found or does not belong to you",
            });
        }

        // 8. Unique parcelId generate karna
        const counter = await Counter.findByIdAndUpdate(
            "parcel",
            {
                $inc: { seq: 1 },
            },
            {
                returnDocument: "after",
                upsert: true,
                setDefaultsOnInsert: true,
            }
        );

        // 9. Parcel database mein save karna
        const parcel = await Parcel.create({
            parcelId: counter.seq,
            shipmentId: validShipmentId,
            userId: user.userId,
            productName: productName.trim(),
            parcelType: parcelType.trim(),
            numberOfPackages: packages,
            productImages: productImages || [],
            description: description?.trim() || "",
        });

        // 10. Success response
        return res.status(201).json({
            success: true,
            message: "Parcel created successfully",
            data: parcel,
        });
    } catch (error) {
        console.error("Create parcel error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


const getAllParcels = async (req, res) => {
    try {
        // Fetch all parcels from database
        const parcels = await Parcel.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "All parcels fetched successfully",
            totalParcels: parcels.length,
            data: parcels,
        });
    } catch (error) {
        console.error("Get all parcels error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


module.exports = { createParcel, getAllParcels };
