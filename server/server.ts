import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();

app.use(express.json());

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
    })
);

app.get("/", (_req, res) => {
    res.send("Endpoints: /members");
});

app.post("/members", async (req, res) => {
    try {
        const response = await axios.post(
            "https://chingu-members-api-12086067540.us-central1.run.app/v1/chingu_members/table/filtered",
            req.body,
            {
                params: req.query,
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            }
        );

        res.json(response.data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Request failed", details: err });
    }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("Server is running on port" + port);
});
