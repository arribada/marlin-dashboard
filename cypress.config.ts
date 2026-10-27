import { defineConfig } from "cypress";
import * as dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
  "CYPRESS_BASE_URL",
];
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

export default defineConfig({
  e2e: {
    setupNodeEvents() {},
    baseUrl: process.env.CYPRESS_BASE_URL,
  },

  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },

  env: {
    ENABLE_TEST_LOGIN: true,
    NEXT_PUBLIC_CARTO_API_KEY: process.env.NEXT_PUBLIC_CARTO_API_KEY,
  }
});
