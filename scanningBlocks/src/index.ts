import { formatEther, JsonRpcProvider } from "ethers";
import axios from "axios";
import config from "./utils/config";
import mongoose from "mongoose";
import User from "./models/user";

const alchemyUrl = config.ALCHEMY_URL;

const provider = new JsonRpcProvider(alchemyUrl);

async function main() {
  await mongoose.connect(config.MONGO_URL, {});

  const dbUsers = await User.find(
    {},
    { depositAddress: 1, _id: 1, balance: 1 }
  );
  const dbAddresses = dbUsers.map((user) => user.depositAddress);

  console.log(dbAddresses);
  const transactions = await getTransactionReceipt();

  if (!transactions?.result) return;

  const dbTransactions = transactions.result.filter((x) => {
    return dbAddresses.includes(x.to);
  });
  console.log("db Transactions");
  console.log(dbTransactions);

  const fullTxns = await Promise.all(
    dbTransactions.map(async ({ transactionHash }) => {
      const txn = await provider.getTransaction(transactionHash);

      return txn;
    })
  );

  for (const txn of fullTxns) {
    if (!txn || !txn.to || !txn.value) continue;

    const recipient = txn.to.toLowerCase();
    const amountInEth = parseFloat(formatEther(txn.value));

    const user = dbUsers.find(
      (i) => i.depositAddress.toLowerCase() === recipient
    );
    if (user) {
      await User.updateOne(
        {
          _id: user._id,
        },
        {
          $inc: { balance: amountInEth },
        }
      );
      console.log(`Updated balance for ${recipient}: +${amountInEth} ETH`);
    }
  }
}

interface TransactionReceipt {
  transactionHash: string;
  from: string;
  to: string;
}

interface TransactionReceiptResponse {
  result: TransactionReceipt[];
}
interface BlockNumberResponse {
  result: string;
}

async function getTransactionReceipt(): Promise<TransactionReceiptResponse> {
  const response1 = await axios.post<BlockNumberResponse>(alchemyUrl, {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_blockNumber",
    params: [],
  });

  let data = JSON.stringify({
    id: 1,
    jsonrpc: "2.0",
    method: "eth_getBlockReceipts",
    params: [`${response1.data.result}`],
  });

  let config = {
    method: "post",
    url: alchemyUrl,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    data: data,
  };

  const response = await axios.request(config);
  //@ts-ignore
  return response.data;
}

main();
