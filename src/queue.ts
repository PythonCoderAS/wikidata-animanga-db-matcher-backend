import Yallist from "yallist";

import { ResultItem } from "./interfaces";

async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export type ExpectedFunctionType = (
  title: string
) => Promise<Record<string, ResultItem>>;

export interface QueueInfoConstructorOptions {
  ratelimitMs: number;
  /**
   * If true, starts counting from after the last function's promise resolves. If false, starts counting from when the function is first called.
   * @default true
   */
  afterCallEnds?: boolean;
}
export interface QueueConstructorOptions extends QueueInfoConstructorOptions {
  func: ExpectedFunctionType;
  /**
   * Ties the Queue to a name. Supplying the name will always bring back the same Queue info.
   * This means that two Queues with different functions will share the same ratelimits.
   */
  name?: string;
}

export class QueueInfo {
  private ratelimitMs: number;
  private afterCallEnds: boolean;
  private lastCalledMs = 0;
  private lastFinishedMs = 0;
  private inCall = false;
  private functionQueue: Yallist<(val: boolean) => unknown> = Yallist.create();
  constructor(options: QueueInfoConstructorOptions) {
    this.ratelimitMs = options.ratelimitMs;
    this.afterCallEnds = options.afterCallEnds ?? true;
  }

  private lastCall(): number {
    return this.afterCallEnds ? this.lastFinishedMs : this.lastCalledMs;
  }

  public async ratelimit() {
    const now = Date.now();
    const lastCall = this.lastCall();
    const timeSinceLastCall = now - lastCall;
    if (timeSinceLastCall < this.ratelimitMs) {
      await sleep(this.ratelimitMs - timeSinceLastCall);
    }
    return;
  }

  public async startCall() {
    this.inCall = true;
    await this.ratelimit();
    this.lastCalledMs = Date.now();
  }

  public endCall() {
    this.lastFinishedMs = Date.now();
    if (this.functionQueue.length > 0) {
      this.functionQueue.shift()!(true);
    } else {
      this.inCall = false;
    }
  }

  public busy() {
    return this.inCall;
  }

  public queueFunction(): Promise<unknown> {
    return new Promise((resolve) => {
      this.functionQueue.push(resolve);
    });
  }
}

export const namedQueues: Record<string, QueueInfo> = {};

export default class Queue {
  private func: ExpectedFunctionType;
  private queueInfo: QueueInfo;

  constructor(options: QueueConstructorOptions) {
    this.func = options.func;
    if (options.name) {
      if (namedQueues[options.name]) {
        this.queueInfo = namedQueues[options.name];
      } else {
        this.queueInfo = new QueueInfo(options);
        namedQueues[options.name] = this.queueInfo;
      }
    } else {
      this.queueInfo = new QueueInfo(options);
    }
  }

  private async callInner(title: string): Promise<Record<string, ResultItem>> {
    await this.queueInfo.startCall();
    const result = await this.func(title);
    this.queueInfo.endCall();
    return result;
  }

  async call(title: string): Promise<Record<string, ResultItem>> {
    if (!this.queueInfo.busy()) {
      return this.callInner(title);
    }

    return this.queueInfo.queueFunction().then(() => this.callInner(title));
  }
}
