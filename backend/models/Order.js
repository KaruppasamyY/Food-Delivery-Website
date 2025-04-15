import { Schema, model } from "mongoose";

const OrderSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
        {
            name: String,
            price: Number,
            quantity: Number,
        },
    ],
    totalPrice: Number,
    orderDate: { type: Date, default: Date.now },
    deliveryAddress: {
        firstname: { type: String, required: true },
        lastname: { type: String, required: true },
        email: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipcode: { type: String, required: true },
        country: { type: String, required: true },
        phone: { type: String, required: true },
    }
});

export default model("Order", OrderSchema);