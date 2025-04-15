import Cart from "../models/Cart.js";

export async function addToCart(req, res) {
    try {
        const { userId, foodItemId, name, price } = req.body;
        let cart = await Cart.findOne({ userId });

        const newItem = { foodItemId, name, price, quantity: 1 }; // Start with quantity 1

        if (!cart) {
            cart = new Cart({ userId, items: [newItem] });
        } else {
            // Check if the item already exists in the cart
            const existingItemIndex = cart.items.findIndex(
                (item) => item.foodItemId === foodItemId
            );

            if (existingItemIndex > -1) {
                // If the item exists, increment the quantity
                cart.items[existingItemIndex].quantity += 1;
            } else {
                // If the item doesn't exist, add it to the cart
                cart.items.push(newItem);
            }
        }
        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: "Error adding to cart", error });
    }
}

/*export async function updateCart(req, res) {
    try {
        const { userId, items } = req.body;
        const cart = await Cart.findOneAndUpdate({ userId }, { items }, { new: true });
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: "Error updating cart", error });
    }
}*/

export async function removeFromCart(req, res) {
    try {
        const { userId, foodItemId } = req.body;

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const itemIndex = cart.items.findIndex(item => item.foodItemId === foodItemId);

        if (itemIndex > -1) {
            if (cart.items[itemIndex].quantity > 1) {
                cart.items[itemIndex].quantity -= 1;
            } else {
                cart.items.splice(itemIndex, 1); // Remove the item if quantity is 1
            }
            const updatedCart = await cart.save();
            res.status(200).json(updatedCart);
        } else {
            res.status(404).json({ message: "Item not found in cart" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error removing item", error });
    }
}

export async function clearCart(req, res) {
    try {
        console.log("Request Body:", req.body); // Debugging
        const { userId } = req.body;
        const result = await Cart.deleteOne({ userId });

        console.log("Delete Result:", result); // Debugging

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Cart not found" });
        }

        res.status(200).json({ message: "Cart cleared successfully" });
    } catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({ message: "Error clearing cart", error });
    }
}