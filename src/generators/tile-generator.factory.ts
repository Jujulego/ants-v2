import { Shape } from '@jujulego/2d-maths';
import { interfaces } from 'inversify';

import { container } from '@/inversify.config';
import { WorldService } from '@/world/world.service';
import { type IClassOf } from '@/types';

import { STEPS } from './constants';
import { TileGenerator } from './tile-generator';
import { BaseStep } from './steps/base-step';
import { StepLimit, StepOptions, StepPrevious } from './steps/symbols';

// Types
type StepKey = keyof typeof STEPS;
type StepOptionMap = {
  [K in StepKey]: (typeof STEPS)[K] extends IClassOf<BaseStep<infer O>> ? O : never;
};

export interface ITileGeneratorStep<K extends StepKey = StepKey> {
  readonly generator: K;
  readonly options: StepOptionMap[K];
  readonly limit?: Shape;
}

export type ITileGeneratorFactory = (steps: ITileGeneratorStep[]) => Promise<TileGenerator>;

// Symbol
export const TileGeneratorFactory: interfaces.ServiceIdentifier<ITileGeneratorFactory> = Symbol('ants-v2:TileGeneratorFactory');

// Provider
container.bind(TileGeneratorFactory).toProvider<TileGenerator>(({ container }) => {
  return async function (steps: ITileGeneratorStep[]) {
    // Create steps
    let lastStep: BaseStep | undefined;

    for (const step of steps) {
      // Create step ioc container
      const env = container.createChild();

      env.bind(StepOptions).toConstantValue(step.options);

      if (lastStep) {
        env.bind(StepPrevious).toConstantValue(lastStep);
      }

      if (step.limit) {
        env.bind(StepLimit).toConstantValue(step.limit);
      }

      // Create generator
      lastStep = env.resolve<BaseStep>(STEPS[step.generator]);
    }

    if (!lastStep) {
      throw new Error('A TileGenerator needs at least one step');
    }

    // Create generator
    const world = await container.getAsync(WorldService);

    return new TileGenerator(lastStep, world);
  };
});
