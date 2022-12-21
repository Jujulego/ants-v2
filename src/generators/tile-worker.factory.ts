import { interfaces } from 'inversify';

import { container } from '@/inversify.config';

import { TileWorker } from './tile-worker';
import { type ITileGeneratorStep } from './types';

// Types
export type ITileWorkerFactory = (steps: ITileGeneratorStep[]) => Promise<TileWorker>;

// Symbol
export const TileWorkerFactory: interfaces.ServiceIdentifier<ITileWorkerFactory> = Symbol('ants-v2:TileWorkerFactory');

// Provider
container.bind(TileWorkerFactory).toProvider<TileWorker>(({ container }) => {
  return async function (steps: ITileGeneratorStep[]) {
    const worker = new TileWorker();
    await worker.setup(steps);

    return worker;
  };
});
