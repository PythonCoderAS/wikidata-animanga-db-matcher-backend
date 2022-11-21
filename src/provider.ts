import LRUCache from "lru-cache";
import { ResultItem } from "./interfaces";
import Queue, { QueueConstructorOptions } from "./queue.js";


export default abstract class Provider {
  private queue: Queue;
  private cache: LRUCache<string, Record<string, ResultItem>> = new LRUCache({ ttl: 3600, max: 1000 });
  constructor(ratelimitMs: number, customQueueConstructorOptions?: Partial<QueueConstructorOptions>){
    this.queue = new Queue({
      func: this.getTitle,
      ratelimitMs: ratelimitMs,
      ...customQueueConstructorOptions
    })
  }

  async check_cache(title: string): Promise<Record<string, ResultItem>> {
    const cached = this.cache.has(title)
    if (cached){
      return this.cache.get(title)!
    } else {
      const retval = await this.queue.call(title)
      this.cache.set(title, retval)
      return retval
    }
  }

  abstract getTitle(title: string): Promise<Record<string, ResultItem>>;

  async get(titles: string[]): Promise<Record<string, ResultItem>>{
    const promises = titles.map(title => this.check_cache(title))
    const results = await Promise.all(promises)
    return Object.assign({}, ...results)
  }

}
