import { injectable } from 'inversify';
import ms from 'pretty-ms';
import { concatMap, Subject, tap } from 'rxjs';

import { type Awaitable } from '@/types';

import { type IMessage, type IPayload } from './message';

// Class
@injectable()
export abstract class WorkerHandler<Req extends IMessage, Msg extends IMessage> {
  // Attributes
  abstract readonly name: string;

  // Constructor
  constructor() {
    // Listen for events
    const request$$ = new Subject<IPayload<Req>>();

    request$$.pipe(
      tap((req) => {
        performance.mark(`receive-${req.sessionId}`);
        console.debug(
          `[${this.name}] Received %c${req.type}%c request %c(#${req.sessionId})`,
          'font-weight: bold',
          'font-weight: normal',
          'color: grey'
        );
      }),
      concatMap(async (req) => {
        // Log queue time
        performance.mark(`end-queue-${req.sessionId}`);
        const queue = performance.measure(`queue-${req.sessionId}`, `receive-${req.sessionId}`, `end-queue-${req.sessionId}`);
        console.debug(
          `[${this.name}] %c${req.type}%c waited ${ms(queue.duration)} %c(#${req.sessionId})`,
          'font-weight: bold',
          'font-weight: normal',
          'color: grey'
        );

        try {
          return await this.handle(req);
        } finally {
          // Log compute time
          performance.mark(`end-compute-${req.sessionId}`);
          const compute = performance.measure(`compute-${req.sessionId}`, `end-queue-${req.sessionId}`, `end-compute-${req.sessionId}`);

          console.info(
            `[${this.name}] %c${req.type}%c took ${ms(compute.duration)} %c(#${req.sessionId})`,
            'font-weight: bold',
            'font-weight: normal',
            'color: grey'
          );
        }
      }),
    ).subscribe((res) => {
      if (res) {
        this.send(res);
      }
    });

    self.addEventListener('message', (event: MessageEvent<IPayload<Req>>) => {
      request$$.next(event.data);
    });

    // Worker is ready
    self.postMessage({
      sessionId: '--init--',
      type: '--started--',
    });
  }

  // Methods
  protected abstract handle(request: IPayload<Req>): Awaitable<IPayload<Msg> | void>;

  protected send(msg: IPayload<Msg>): void {
    self.postMessage(msg);
  }
}
