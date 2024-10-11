import { Redis } from "ioredis"
import configs from "./configs.js"

export const redis = new Redis(configs.redis.uri);

