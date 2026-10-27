import validateEnvVar from "@/_utils/validateEnvVar";
import { Redis } from "@upstash/redis";

const redisUrl = validateEnvVar("UPSTASH_REDIS_REST_URL", "string");
const redisToken = validateEnvVar("UPSTASH_REDIS_REST_TOKEN", "string");

export const redis = new Redis({ url: redisUrl, token: redisToken});
