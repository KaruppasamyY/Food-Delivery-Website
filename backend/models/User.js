import { Schema, model } from "mongoose";

const UserSchema = new Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Remove the pre-save hook that hashes the password
// No hashing is performed, the password is stored as it is

export default model("User", UserSchema);