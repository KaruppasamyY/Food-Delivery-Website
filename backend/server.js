import express, { json } from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import dotenv from 'dotenv';
import cartRoutes from "./routes/cartRoutes.js"; // Make sure to include the .js extension
import orderRoutes from "./routes/orderRoutes.js"; // Make sure to include the .js extension
import authRoutes from "./routes/authRoutes.js";   // Make sure to include the .js extension
import stripeRoutes from "./routes/stripeRoutes.js"
dotenv.config();

connectDB();

const app = express();
app.use(json());
app.use(cors());

app.use("/cart", cartRoutes);
app.use("/order", orderRoutes);
app.use("/user", authRoutes);
app.use("/stripe", stripeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));