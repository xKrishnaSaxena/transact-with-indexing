import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

interface ENV {
  MONGO_URL: string | undefined;
  ALCHEMY_URL: string | undefined;
}

interface Config {
  MONGO_URL: string;
  ALCHEMY_URL: string;
}

const getConfig = (): ENV => {
  return {
    MONGO_URL: process.env.MONGO_URL,
    ALCHEMY_URL: process.env.ALCHEMY_URL,
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
