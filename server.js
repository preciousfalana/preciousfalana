const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const path = require("path");
const zlib = require("zlib");
const mime = require("mime-types");

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
        // Compress the file
        const compressedBuffer = zlib.gzipSync(req.file.buffer);

        // Categorize the file based on its MIME type
        const fileType = mime.lookup(req.file.originalname);
        let category;
        if (fileType.startsWith("image/")) {
            category = "Image";
        } else if (fileType.startsWith("video/")) {
            category = "Video";
        } else if (fileType.startsWith("text/")) {
            category = "Text";
        } else {
            category = "Other";
        }

        const form = new FormData();
        form.append("file", compressedBuffer, req.file.originalname + ".gz");

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
            category: category,
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