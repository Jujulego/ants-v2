import { type IShape } from '@jujulego/2d-maths';

import { type IClassOf } from '@/types';

import { STEPS } from './constants';
import { BaseStep } from './steps/base-step';

// Types
type StepKey = keyof typeof STEPS;
type StepOptionMap = {
  [K in StepKey]: (typeof STEPS)[K] extends IClassOf<BaseStep<infer O>> ? O : never;
};

export interface ITileGeneratorStep<K extends StepKey = StepKey> {
  readonly generator: K;
  readonly options: StepOptionMap[K];
  readonly limit?: IShape;
}
