import { JsonRpcProvider } from "ethers";
import axios from "axios";
import config from "./utils/config";
import mongoose from "mongoose";
import User from "./models/user";
interface Response {
  jsonrpc: string;
  id: number;
  result: string;
}

const alchemyUrl = config.ALCHEMY_URL;

const provider = new JsonRpcProvider(alchemyUrl);

async function main() {
  await mongoose.connect(config.MONGO_URL, {});
  const dbAddresses = await User.find().then((users) =>
    users.map((user) => user.depositAddress)
  );

  const transactions = await getTransactionReceipt();

  const dbTransactions = transactions?.result.filter((x) =>
    dbAddresses.includes(x.to)
  );

  const fullTxns = await Promise.all(
    dbTransactions.map(async ({ transactionHash }) => {
      const txn = await provider.getTransaction(transactionHash);
      return txn;
    })
  );

  console.log(fullTxns);
}

interface TransactionReceipt {
  transactionHash: string;
  from: string;
  to: string;
}

interface TransactionReceiptResponse {
  result: TransactionReceipt[];
}

async function getTransactionReceipt(): Promise<TransactionReceiptResponse> {
  const response1 = await axios.post(alchemyUrl, {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_blockNumber",
    params: [],
  });
  //@ts-ignore
  const data1: Response = response1.data;
  console.log(data1.result);

  let data = JSON.stringify({
    id: 1,
    jsonrpc: "2.0",
    method: "eth_getBlockReceipts",
    params: [`${data1.result}`],
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
