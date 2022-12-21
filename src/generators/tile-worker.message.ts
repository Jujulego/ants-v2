import { type IPoint, Shape } from '@jujulego/2d-maths';

import { deserializeShape } from '@/utils/deserialize';
import { type IMessage } from '@/workers/message';

import { type ITileGeneratorStep } from './types';

// Requests
export interface ISetupRequest extends IMessage<'setup'> {
  readonly steps: ITileGeneratorStep[];
}

export interface ITileRequest extends IMessage<'tile'> {
  readonly world: string;
  readonly pos: IPoint;
}

export interface IAreaRequest extends IMessage<'area'> {
  readonly world: string;
  readonly area: Shape;
}

// Messages
export interface IEndMessage extends IMessage<'end'> {}

// Utils
export function deserializeSetupRequest(req: ISetupRequest): ISetupRequest {
  return {
    ...req,
    steps: req.steps.map((step) => ({
      ...step,
      limit: step.limit && deserializeShape(step.limit as any),
    })),
  };
}

export function deserializeAreaRequest(req: IAreaRequest): IAreaRequest {
  return {
    ...req,
    area: deserializeShape(req.area as any),
  };
}
