import { injectable } from 'inversify';
import ms from 'pretty-ms';

import { PriorityQueue } from '@/utils/priority-queue';
import { type Awaitable } from '@/types';

import { type IMessage, type IPayload } from './message';

// Class
@injectable()
export abstract class WorkerHandler<Req extends IMessage, Msg extends IMessage> {
  // Attributes
  abstract readonly name: string;
  private readonly _queue = new PriorityQueue<IPayload<Req>>();

  // Constructor
  constructor() {
    // Store events into the queue
    self.addEventListener('message', (event: MessageEvent<IPayload<Req>>) => {
      const req = event.data;

      performance.mark(`receive-${req.type}-${req.sessionId}`);
      console.debug(
        `[${this.name}] Received %c${req.type}%c request %c(#${req.sessionId})`,
        'font-weight: bold',
        'font-weight: normal',
        'color: grey'
      );

      this._queue.insert(req);
    });

    this._loop();

    // Worker is ready
    self.postMessage({
      sessionId: '--init--',
      type: '--started--',
    });
  }

  // Methods
  private async _loop(): Promise<void> {
    for await (const req of this._queue) {
      // Log queue time
      performance.mark(`end-queue-${req.type}-${req.sessionId}`);
      const queue = performance.measure(`queue-${req.type}-${req.sessionId}`, `receive-${req.type}-${req.sessionId}`, `end-queue-${req.type}-${req.sessionId}`);
      console.debug(
        `[${this.name}] %c${req.type}%c waited ${ms(queue.duration)} %c(#${req.sessionId})`,
        'font-weight: bold',
        'font-weight: normal',
        'color: grey'
      );

      try {
        // Run task and return result
        const res = await this.handle(req);

        if (res) {
          this.send(res);
        }
      } finally {
        // Log compute time
        performance.mark(`end-compute-${req.type}-${req.sessionId}`);
        const compute = performance.measure(`compute-${req.type}-${req.sessionId}`, `end-queue-${req.type}-${req.sessionId}`, `end-compute-${req.type}-${req.sessionId}`);

        console.info(
          `[${this.name}] %c${req.type}%c took ${ms(compute.duration)} %c(#${req.sessionId})`,
          'font-weight: bold',
          'font-weight: normal',
          'color: grey'
        );
      }
    }
  }

  protected abstract handle(request: IPayload<Req>): Awaitable<IPayload<Msg> | void>;

  protected send(msg: IPayload<Msg>): void {
    self.postMessage(msg);
  }
}
