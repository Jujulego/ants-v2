import { IClassOf } from '@/types';
import { BaseStep } from '@/generators/steps/base-step';

import { CellularStep } from './steps/cellular.step';
import { RandomStep } from './steps/random.step';
import { UniformStep } from './steps/uniform.step';

// Constants
export const STEPS = {
  'cellular': CellularStep,
  'random': RandomStep,
  'uniform': UniformStep,
} satisfies Record<string, IClassOf<BaseStep>>;
