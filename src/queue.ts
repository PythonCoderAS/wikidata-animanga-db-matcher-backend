import Yallist from 'yallist';
import { ResultItem } from './interfaces';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export type ExpectedFunctionType = (title: string) => Promise<Record<string, ResultItem>>;

export interface QueueConstructorOptions {
  func: ExpectedFunctionType
  ratelimitMs: number
  /**
   * If true, starts counting from after the last function's promise resolves. If false, starts counting from when the function is first called.
   * @default true
   */
  afterCallEnds?: boolean
}

export default class Queue {
  private func: ExpectedFunctionType
  private ratelimitMs: number
  private afterCallEnds: boolean
  private lastCalledMs = 0
  private lastFinishedMs = 0
  private inCall = false
  private function_queue: Yallist<(val: boolean) => unknown> = Yallist.create();

  constructor(options: QueueConstructorOptions){
    this.func = options.func
    this.ratelimitMs = options.ratelimitMs
    this.afterCallEnds = options.afterCallEnds ?? true
  }

  private async call_inner(title: string): Promise<Record<string, ResultItem>> {
    const now = Date.now()
    const lastCall = this.afterCallEnds ? this.lastFinishedMs : this.lastCalledMs
    const timeSinceLastCall = now - lastCall
    if(timeSinceLastCall < this.ratelimitMs){
      await sleep(this.ratelimitMs - timeSinceLastCall)
    }
    this.lastCalledMs = Date.now()
    const result = await this.func(title)
    this.lastFinishedMs = Date.now()
    if (this.function_queue.length > 0){
      this.function_queue.shift()!(true)
    } else {
      this.inCall = false
    }
    return result
  }

  async call(title: string): Promise<Record<string, ResultItem>> {
    if (!this.inCall){
      this.inCall = true
      return this.call_inner(title);
    } else {
      const promise = new Promise(resolve => this.function_queue.push(resolve))
      return promise.then(() => this.call_inner(title))
    }
  }

}
