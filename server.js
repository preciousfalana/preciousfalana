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
app.post("/upload", upload.array("files"), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({
            message: "No files uploaded",
        });
    }

    try {
        const results = await Promise.all(req.files.map(async (file) => {
            // Compress the file
            const compressedBuffer = zlib.gzipSync(file.buffer);

            // Categorize the file based on its MIME type
            const fileType = mime.lookup(file.originalname);
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
            form.append("file", compressedBuffer, file.originalname + ".gz");

            const response = await axios.post(
                "https://file.io",
                form,
                {
                    headers: {
                        ...form.getHeaders(),
                    },
                }
            );

            return {
                message: "File uploaded successfully",
                downloadLink: response.data.link,
                category: category,
            };
        }));

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({
            message: "Error uploading files",
            error: error.message,
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));