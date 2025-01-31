import { HDNodeWallet } from "ethers";
import express, { request, response } from "express";
import mongoose from "mongoose";
import config from "./utils/config";
import User from "./models/user";
import { mnemonicToSeedSync } from "bip39";

const app = express();
app.use(express.json());

const MONGO_URL = config.MONGO_URL;

const SEED = mnemonicToSeedSync(config.MNEMONIC);

mongoose.connect(MONGO_URL);
console.log("DB connected");
app.post("/signup", async (req = request, res = response) => {
  const { username, password } = req.body;
  const user = await new User({
    username,
    password,
  });
  const userCount = await User.countDocuments();
  const wallet = HDNodeWallet.fromSeed(SEED);
  const derivePath = `m/44'/60'/${userCount}'/0`;
  const node = wallet.derivePath(derivePath);
  user.privateKey = node.privateKey;
  user.depositAddress = node.address;

  user.save().then((user: any) => {
    res.send({
      userId: user._id,
    });
  });
});
app.get("/depositAddress/:userId", async (req = request, res = response) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (user) res.send(user.depositAddress);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
