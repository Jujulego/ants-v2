import { type IPoint, type IShape } from '@jujulego/2d-maths';
import { filter, firstValueFrom } from 'rxjs';

import { RequestWorker } from '@/workers/request-worker';

import { type ITileGeneratorStep } from './types';
import {
  type IAreaRequest,
  type IEndMessage,
  type ISetupRequest,
  type ITileRequest
} from './tile-worker.message';

// Worker
export class TileWorker extends RequestWorker<ISetupRequest | ITileRequest | IAreaRequest, IEndMessage> {
  // Attributes
  readonly name = 'tile-generator';

  // Methods
  protected _loadWorker(): Worker {
    return new Worker(new URL('./tile-worker.worker.ts', import.meta.url));
  }

  async setup(steps: ITileGeneratorStep[]): Promise<void> {
    const msg$ = this.request({ type: 'setup', steps });

    await firstValueFrom(msg$.pipe(
      filter(({ type }) => type === 'end'),
    ));
  }

  async generateTile(world: string, pos: IPoint): Promise<void> {
    const msg$ = this.request({ type: 'tile', world, pos });

    await firstValueFrom(msg$.pipe(
      filter(({ type }) => type === 'end'),
    ));
  }

  async generateTilesIn(world: string, area: IShape): Promise<void> {
    const msg$ = this.request({ type: 'area', world, area });

    await firstValueFrom(msg$.pipe(
      filter(({ type }) => type === 'end'),
    ));
  }
}
