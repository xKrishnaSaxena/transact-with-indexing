const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  depositAddress: {
    type: String,
    default: "",
  },
  privateKey: {
    type: String,
    default: "",
  },
  balance: {
    type: Number,
    default: 0,
  },
});

const User = mongoose.model("User", UserSchema);

export default User;
