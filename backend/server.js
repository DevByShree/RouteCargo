const express = require("express");
const dotenv = require("dotenv")
const connectDB = require("./src/config/db");

dotenv.config();
const app = express();
app.use(express.json());

connectDB();

const PORT = process.env.PORT || 5000;


app.get("/", (req, res) => {
    res.json({
        Message: "RouteCargo Backend is running"
    })
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})