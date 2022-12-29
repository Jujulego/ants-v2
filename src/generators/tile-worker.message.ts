import { type IPoint, type IShape } from '@jujulego/2d-maths';

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
  readonly area: IShape;
}

// Messages
export interface IEndMessage extends IMessage<'end'> {}
