import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes";


dotenv.config();

const app = express();

app.use(cors());


app.use(express.json());



app.get("/health", (req, res) => {
    res.send({ status: "ok" });

});

app.use('/api/v1', apiRoutes);


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});