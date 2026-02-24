import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";


dotenv.config();

const app = express();

app.use(cors());


app.use(express.json());


app.get("/", (req, res) => {
    res.send("Hello world!");
});

app.get("/health", (req, res) => {
    res.send({ status: "ok" });
});

app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});