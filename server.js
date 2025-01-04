const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const path = require("path");

const app = express();
const upload = multer();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Endpoint for uploading files
app.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            message: "No file uploaded",
        });
    }

    try {
        const form = new FormData();
        form.append("file", req.file.buffer, req.file.originalname);

        const response = await axios.post(
            "https://file.io",
            form,
            {
                headers: {
                    ...form.getHeaders(),
                },
            }
        );

        console.log(response.data); // Log the full response data

        res.status(200).json({
            message: "File uploaded successfully",
            downloadLink: response.data.link, // Ensure this is the correct property
        });
    } catch (error) {
        res.status(500).json({
            message: "Error uploading file",
            error: error.message,
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));