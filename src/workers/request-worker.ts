import { nanoid } from 'nanoid/async';
import { concatMap, defer, filter, Observable, share, Subject } from 'rxjs';

import { type IMessage, type IPayload } from './message';

// Class
export abstract class RequestWorker<Req extends IMessage, Msg extends IMessage> {
  // Attributes
  abstract readonly name: string;

  private _worker?: Promise<Worker>;
  private readonly _messages$$ = new Subject<IPayload<Msg>>();
  readonly messages$ = this._messages$$.asObservable();

  // Methods
  protected abstract _loadWorker(): Worker;

  private _startWorker(): Promise<Worker> {
    return new Promise<Worker>((resolve, reject) => {
      const worker = this._loadWorker();

      worker.addEventListener('message', (event: MessageEvent<IPayload<Msg>>) => {
        if (event.data.sessionId === '--init--') {
          if (event.data.type === '--started--') {
            resolve(worker);
          }
        } else {
          this._messages$$.next(event.data);
        }
      });

      worker.addEventListener('error', (event) => {
        reject(event.error);
      });
    });
  }

  private async _getWorker(): Promise<Worker> {
    if (this._worker) {
      return this._worker;
    }

    // Load worker with retry logic
    let tries = 3;

    while (tries > 0) {
      try {
        this._worker = this._startWorker();
        return this._worker;
      } catch (err) {
        console.warn(`Failed to load worker ${this.name} retrying in 1s`);

        tries--;

        if (tries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }

    throw new Error(`Unable to load worker ${this.name}`);
  }

  request(req: Req, priority = 0): Observable<Msg> {
    return defer(async () => {
      const sessionId = await nanoid();

      // Send request
      this._getWorker()
        .then((worker) => worker.postMessage({ sessionId, sessionPriority: priority, ...req }));

      return sessionId;
    }).pipe(
      // Observe messages
      concatMap((sessionId) => this.messages$.pipe(
        filter((msg) => msg.sessionId === sessionId),
      )),
      share(),
    );
  }
}
