import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  password: string;
  depositAddress: string;
  privateKey: string;
  balance: number;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true },
  password: { type: String, required: true },
  depositAddress: { type: String, default: "" },
  privateKey: { type: String, default: "" },
  balance: { type: Number, default: 0 },
});

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
