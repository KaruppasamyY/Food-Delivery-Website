import Order from "../models/Order.js";

export async function confirmOrder(req, res) {
    try {
        console.log("Received order confirmation request:", req.body); // Log the request body
        const { userId, items, totalPrice, deliveryAddress } = req.body;
        console.log("userId:", userId);
        console.log("items:", items);
        console.log("totalPrice:", totalPrice);
        console.log("deliveryAddress:", deliveryAddress);
        const order = new Order({ userId, items, totalPrice, deliveryAddress });

        await order.save();
        res.status(201).json({ message: "Order confirmed", orderId: order._id });
    } catch (error) {
        res.status(500).json({ message: "Error confirming order", error });
    }
}

export async function getOrderHistory(req, res) {
    try {
        const { userId } = req.params;
        const orders = await Order.find({ userId }).sort({ orderDate: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Error fetching order history", error });
    }
}