import { interfaces } from 'inversify';
import { Shape } from '@jujulego/2d-maths';

import { BaseStep } from './base-step';

// Constants
export const StepOptions = Symbol('ants-v2:BaseStep:options');
export const StepLimit: interfaces.ServiceIdentifier<Shape> = Symbol('ants-v2:BaseStep:limit');
export const StepPrevious: interfaces.ServiceIdentifier<BaseStep> = Symbol('ants-v2:BaseStep:previous');
