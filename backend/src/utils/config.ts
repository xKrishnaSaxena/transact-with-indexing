import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

interface ENV {
  MONGO_URL: string | undefined;
  MNEMONIC: string | undefined;
}

interface Config {
  MONGO_URL: string;
  MNEMONIC: string;
}

const getConfig = (): ENV => {
  return {
    MONGO_URL: process.env.MONGO_URL,
    MNEMONIC: process.env.MNEMONIC,
  };
};

const getSanitzedConfig = (config: ENV): Config => {
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) {
      throw new Error(`Missing key ${key} in config.env`);
    }
  }
  return config as Config;
};

const config = getConfig();

const sanitizedConfig = getSanitzedConfig(config);

export default sanitizedConfig;
