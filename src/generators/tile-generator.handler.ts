import { Point } from '@jujulego/2d-maths';
import { inject, injectable } from 'inversify';

import { container } from '@/inversify.config';
import { WorkerHandler } from '@/workers/worker-handler';

import { TileGenerator } from './tile-generator';
import { type ITileGeneratorFactory, TileGeneratorFactory } from './tile-generator.factory';
import {
  deserializeAreaRequest,
  deserializeSetupRequest,
  type IAreaRequest,
  type IEndMessage,
  type ISetupRequest,
  type ITileRequest
} from './tile-generator.message';
import { IPayload } from '@/workers/message';

// Handler
@injectable()
class TileGeneratorHandler extends WorkerHandler<ISetupRequest | ITileRequest | IAreaRequest, IEndMessage> {
  // Attributes
  readonly name = 'tile-generator';
  private _generator?: TileGenerator;

  // Constructor
  constructor(
    @inject(TileGeneratorFactory)
    private readonly _generatorFactory: ITileGeneratorFactory,
  ) {
    super();
  }

  // Methods
  protected async handle(request: IPayload<ISetupRequest | ITileRequest | IAreaRequest>): Promise<IPayload<IEndMessage>> {
    switch (request.type) {
      case 'setup':
        await this._handleSetup(request);
        break;

      case 'tile':
        await this._handleTile(request);
        break;

      case 'area':
        await this._handleArea(request);
        break;
    }

    return {
      sessionId: request.sessionId,
      type: 'end',
    };
  }

  private async _handleSetup(request: ISetupRequest): Promise<void> {
    const { steps } = deserializeSetupRequest(request);
    this._generator = await this._generatorFactory(steps);
  }

  private async _handleTile(request: ITileRequest): Promise<void> {
    if (!this._generator) {
      throw new Error('Worker\'s generator not yet initialised');
    }

    await this._generator.generateTile(request.world, new Point(request.pos));
  }

  private async _handleArea(request: IAreaRequest): Promise<void> {
    if (!this._generator) {
      throw new Error('Worker\'s generator not yet initialised');
    }

    const { area } = deserializeAreaRequest(request);
    await this._generator.generateTilesIn(request.world, area);
  }
}

// Initiate worker
container.resolve(TileGeneratorHandler);
