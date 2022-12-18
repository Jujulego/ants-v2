import { pointsOf, rect } from '@jujulego/2d-maths';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';

import { container } from '@/inversify.config';
import { DEXIE_OPTIONS, DexieDatabase } from '@/world/web/dexie';
import { WorldWebService } from '@/world/web/world-web.service';

// Setup
const TEST_AREA = rect({ t: 5, l: 0, r: 5, b: 0 });
let database: DexieDatabase;
let service: WorldWebService;

beforeEach(async () => {
  container.snapshot();

  // Inject new fake indexeddb instance
  container.bind(DEXIE_OPTIONS).toConstantValue({
    indexedDB: new IDBFactory(),
    IDBKeyRange: IDBKeyRange,
  });

  // Get repository instance using injected indexeddb
  database = container.get(DexieDatabase);
  service = container.get(WorldWebService);

  // Insert some data
  await database.transaction('rw', service.tiles, async () => {
    for (const pos of pointsOf(TEST_AREA)) {
      await service.tiles.put({
        world: 'test',
        pos,
        biome: 'grass',
        generationSteps: ['sand', 'grass'],
      });
    }
  });
});

afterEach(() => {
  container.restore();
});

// Tests
describe('WorldWebService.loadTilesIn', () => {
  it('should return all tiles within given shape', async () => {
    await expect(service.loadTilesIn('test', rect({ t: 1, l: 0, r: 3, b: 0 })))
      .resolves.toEqual([
        { world: 'test', pos: { x: 0, y: 0 }, biome: 'grass', generationSteps: ['sand', 'grass'] },
        { world: 'test', pos: { x: 1, y: 0 }, biome: 'grass', generationSteps: ['sand', 'grass'] },
        { world: 'test', pos: { x: 2, y: 0 }, biome: 'grass', generationSteps: ['sand', 'grass'] },
      ]);
  });
});

describe('WorldWebService.getTile', () => {
  it('should return asked tile', async () => {
    await expect(service.getTile('test', { x: 0, y: 0 }))
      .resolves.toEqual({
        world: 'test',
        pos: { x: 0, y: 0 },
        biome: 'grass',
        generationSteps: ['sand', 'grass']
      });
  });

  it('should throw if tile does not exists', async () => {
    await expect(service.getTile('test', { x: -1, y: -1 }))
      .rejects.toEqual(new Error('Tile test:-1,-1 not found'));
  });

  it('should throw if world does not exists', async () => {
    await expect(service.getTile('toto', { x: 0, y: 0 }))
      .rejects.toEqual(new Error('Tile toto:0,0 not found'));
  });
});

describe('WorldWebService.bulkGetTile', () => {
  it('should return all asked tiles (if they exists)', async () => {
    await expect(service.bulkGetTile('test', [{ x: 0, y: 0 }, { x: 1, y: 2 }, { x: 0, y: -1 }]))
      .resolves.toEqual([
        {
          world: 'test',
          pos: { x: 0, y: 0 },
          biome: 'grass',
          generationSteps: ['sand', 'grass']
        },
        {
          world: 'test',
          pos: { x: 1, y: 2 },
          biome: 'grass',
          generationSteps: ['sand', 'grass']
        },
      ]);
  });
});

describe('WorldWebService.put', () => {
  it('should update given tile', async () => {
    await service.putTile('test', {
      pos: { x: 0, y: 0 },
      biome: 'rock',
      generationSteps: ['sand', 'grass', 'rock']
    });

    await expect(database.tiles.get(['test', 0, 0]))
      .resolves.toEqual({
        world: 'test',
        pos: { x: 0, y: 0 },
        biome: 'rock',
        generationSteps: ['sand', 'grass', 'rock']
      });
  });

  it('should create given tile', async () => {
    await service.putTile('test', {
      pos: { x: 0, y: -1 },
      biome: 'rock',
      generationSteps: ['sand', 'grass', 'rock']
    });

    await expect(database.tiles.get(['test', 0, -1]))
      .resolves.toEqual({
        world: 'test',
        pos: { x: 0, y: -1 },
        biome: 'rock',
        generationSteps: ['sand', 'grass', 'rock']
      });
  });
});

describe('WorldWebService.bulkPutTile', () => {
  it('should update all given tiles', async () => {
    await service.bulkPutTile('test', [
      {
        pos: { x: 0, y: 0 },
        biome: 'rock',
        generationSteps: ['sand', 'grass', 'rock']
      },
      {
        pos: { x: 1, y: 2 },
        biome: 'rock',
        generationSteps: ['sand', 'grass', 'rock']
      }
    ]);

    await expect(database.tiles.get(['test', 0, 0]))
      .resolves.toEqual({
        world: 'test',
        pos: { x: 0, y: 0 },
        biome: 'rock',
        generationSteps: ['sand', 'grass', 'rock']
      });

    await expect(database.tiles.get(['test', 1, 2]))
      .resolves.toEqual({
        world: 'test',
        pos: { x: 1, y: 2 },
        biome: 'rock',
        generationSteps: ['sand', 'grass', 'rock']
      });
  });

  it('should create all given tiles', async () => {
    await service.bulkPutTile('test', [
      {
        pos: { x: -1, y: 0 },
        biome: 'rock',
        generationSteps: ['sand', 'grass', 'rock']
      },
      {
        pos: { x: -1, y: 2 },
        biome: 'rock',
        generationSteps: ['sand', 'grass', 'rock']
      }
    ]);

    await expect(database.tiles.get(['test', -1, 0]))
      .resolves.toEqual({
        world: 'test',
        pos: { x: -1, y: 0 },
        biome: 'rock',
        generationSteps: ['sand', 'grass', 'rock']
      });

    await expect(database.tiles.get(['test', -1, 2]))
      .resolves.toEqual({
        world: 'test',
        pos: { x: -1, y: 2 },
        biome: 'rock',
        generationSteps: ['sand', 'grass', 'rock']
      });
  });
});
