import { Router } from "express";
import { addToCart, removeFromCart, clearCart } from "../controllers/cartController.js";
import Cart from '../models/Cart.js';

const router = Router();

router.post("/add", addToCart);
router.delete("/delete", clearCart);
router.delete("/remove", removeFromCart);
router.get('/:userId', async (req, res) => { // New route to fetch cart by userId
    try {
        const userId = req.params.userId;
        const cart = await Cart.findOne({ userId });
        if (cart) {
            res.status(200).json(cart);
        } else {
            res.status(200).json({ userId: userId, items: [] }); // Return an empty cart if not found
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching cart", error });
    }
});

export default router;