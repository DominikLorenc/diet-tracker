import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";


dotenv.config();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes',
});

const app = express();

app.use(cors());
app.use(limiter);


app.use(express.json());
app.use(cookieParser())



app.get("/health", (req, res) => {
    res.send({ status: "ok" });

});

app.use('/api/v1', apiRoutes);


const PORT = process.env.PORT || 4000;


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});