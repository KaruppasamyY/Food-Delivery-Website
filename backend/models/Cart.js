import { Schema, model } from "mongoose";

const CartSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
        {
            foodItemId: { type: String, required: true },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, default: 1 }
        }
    ],
    updatedAt: { type: Date, default: Date.now }
});

export default model("Cart", CartSchema);