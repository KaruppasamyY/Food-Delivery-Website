import { Router } from "express";
import { confirmOrder, getOrderHistory } from "../controllers/orderController.js";

const router = Router();

router.post("/confirm", confirmOrder);
router.get("/history/:userId", getOrderHistory);

export default router;