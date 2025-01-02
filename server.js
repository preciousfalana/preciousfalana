const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const app = express();
const upload = multer();

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
        res.status(200).json({
            message: "File uploaded successfully",
            downloadLink: response.data.link,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error uploading file",
            error: error.message,
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));