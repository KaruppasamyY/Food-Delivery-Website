import { Router } from "express";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();
const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", async (req, res) => {
    try {
        const { items, deliveryAddress, userId, totalPrice, deliveryFee, success_url, cancel_url } = req.body;

        // Prepare item lineItems
        const lineItems = items.map(item => ({
            price_data: {
                currency: "gbp",
                product_data: {
                    name: item.name,
                },
                unit_amount: item.price * 100, // Convert to pence
            },
            quantity: item.quantity,
        }));

        // Add delivery fee as a separate line item
        if (deliveryFee && deliveryFee > 0) {
            lineItems.push({
                price_data: {
                    currency: "gbp",
                    product_data: {
                        name: "Delivery Fee",
                    },
                    unit_amount: deliveryFee * 100, // e.g., £2 becomes 200
                },
                quantity: 1,
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: lineItems,
            success_url: success_url,
            cancel_url: cancel_url,
            metadata: {
                userId: userId,
                deliveryData: JSON.stringify(deliveryAddress),
                items: JSON.stringify(items),
                totalPrice: totalPrice,
            }
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Stripe checkout error", error });
    }
});

export default router;