import { Redis, type Redis as Client, type RedisKey } from 'ioredis';

export default class RedisDb {
  private redis: Client;
  private readonly ttl?: number;

  constructor(ttl = 0) {
    this.redis = new Redis();
    this.ttl = ttl;
  }
  async read(key: RedisKey) {
    const session = await this.redis.get(key);
    if (session === null || session === undefined) {
      return undefined;
    }
    return JSON.parse(session);
  }
  async write(key: RedisKey, value: any) {
    await this.redis.set(key, JSON.stringify(value));
    if (this.ttl) {
      this.redis.expire(key, this.ttl);
    }
  }
  async delete(key: RedisKey) {
    await this.redis.del(key);
  }
}