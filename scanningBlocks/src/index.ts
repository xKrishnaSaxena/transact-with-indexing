import { formatEther, JsonRpcProvider } from "ethers";
import axios from "axios";
import config from "./utils/config";
import mongoose from "mongoose";
import User from "./models/user";

const alchemyUrl = config.ALCHEMY_URL;
const provider = new JsonRpcProvider(alchemyUrl);
let lastProcessedBlock = 0;

async function main() {
  await mongoose.connect(config.MONGO_URL, {});
  lastProcessedBlock = await getLatestBlockNumber();
  pollNewBlocks();
}

async function pollNewBlocks() {
  while (true) {
    const latestBlock = await getLatestBlockNumber();
    console.log("Latest Block -> ", latestBlock);
    console.log("Last Processed Block -> ", lastProcessedBlock);
    if (latestBlock > lastProcessedBlock) {
      for (
        let blockNumber = lastProcessedBlock + 1;
        blockNumber <= latestBlock;
        blockNumber++
      ) {
        await processBlockTransactions(blockNumber);
      }
      lastProcessedBlock = latestBlock;
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}
interface BlockNumberResponse {
  result: string;
}

async function getLatestBlockNumber(): Promise<number> {
  const response = await axios.post<BlockNumberResponse>(alchemyUrl, {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_blockNumber",
    params: [],
  });
  return parseInt(response.data.result, 16);
}

async function processBlockTransactions(blockNumber: number) {
  const transactions = await getTransactionReceipt(blockNumber);
  if (!transactions?.result) return;

  const dbUsers = await User.find(
    {},
    { depositAddress: 1, _id: 1, balance: 1 }
  );
  const dbAddresses = dbUsers.map((user) => user.depositAddress.toLowerCase());

  const dbTransactions = transactions.result.filter((tx) =>
    dbAddresses.includes(tx.to?.toLowerCase())
  );
  if (dbTransactions.length === 0) return;

  const fullTxns = await Promise.all(
    dbTransactions.map(
      async ({ transactionHash }) =>
        await provider.getTransaction(transactionHash)
    )
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
        { _id: user._id },
        { $inc: { balance: amountInEth } }
      );
      console.log(`Updated balance for ${recipient}: +${amountInEth} ETH`);
    }
  }
}

async function getTransactionReceipt(
  blockNumber: number
): Promise<TransactionReceiptResponse> {
  const response = await axios.post(alchemyUrl, {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_getBlockReceipts",
    params: ["0x" + blockNumber.toString(16)],
  });
  //@ts-ignore
  return response.data;
}

interface TransactionReceipt {
  transactionHash: string;
  from: string;
  to: string;
}

interface TransactionReceiptResponse {
  result: TransactionReceipt[];
}

main();
