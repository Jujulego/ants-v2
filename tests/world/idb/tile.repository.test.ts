import { pointsOf, rect } from '@jujulego/2d-maths';
import { DexieOptions } from 'dexie';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';

import { container } from '@/inversify.config';
import { DEXIE_OPTIONS, DexieDatabase, TILES_XY_INDEX } from '@/world/idb/dexie';
import { TileRepository } from '@/world/idb/tile.repository';

// Setup
const TEST_AREA = rect({ t: 5, l: 0, r: 5, b: 0 });
let database: DexieDatabase;
let repository: TileRepository;

beforeEach(async () => {
  container.snapshot();

  // Inject new fake indexeddb instance
  container.bind<DexieOptions>(DEXIE_OPTIONS).toConstantValue({
    indexedDB: new IDBFactory(),
    IDBKeyRange: IDBKeyRange,
  });

  // Get repository instance using injected indexeddb
  database = container.get(DexieDatabase);
  repository = container.get(TileRepository);

  // Insert some data
  await database.transaction('rw', repository.table, async () => {
    for (const pos of pointsOf(TEST_AREA)) {
      await repository.table.put({
        world: 'test',
        pos,
        biome: 'grass',
        history: ['sand', 'grass'],
      });
    }
  });
});

afterEach(() => {
  container.restore();
});

// Tests
describe('TileRepository.load', () => {
  it('should return all selected tiles', async () => {
    const tiles = repository.table
      .where(TILES_XY_INDEX).between(['test', 0, 0], ['test', 0, 3]);

    await expect(repository.load({ world: 'test' }, tiles))
      .resolves.toEqual([
        { pos: { x: 0, y: 0 }, biome: 'grass' },
        { pos: { x: 0, y: 1 }, biome: 'grass' },
        { pos: { x: 0, y: 2 }, biome: 'grass' },
      ]);
  });
});

describe('TileRepository.get', () => {
  it('should return latest version of tile', async () => {
    await expect(repository.get({ world: 'test' }, { x: 0, y: 0 }))
      .resolves.toEqual({
        pos: { x: 0, y: 0 },
        biome: 'grass'
      });
  });

  it('should return version 0 of tile', async () => {
    await expect(repository.get({ world: 'test', version: 0 }, { x: 0, y: 0 }))
      .resolves.toEqual({
        pos: { x: 0, y: 0 },
        biome: 'sand'
      });
  });

  it('should return version 2 of tile (=> latest because v2 does not exists)', async () => {
    await expect(repository.get({ world: 'test', version: 2 }, { x: 0, y: 0 }))
      .resolves.toEqual({
        pos: { x: 0, y: 0 },
        biome: 'grass'
      });
  });

  it('should throw as tile does not exists', async () => {
    await expect(repository.get({ world: 'test' }, { x: -1, y: -1 }))
      .rejects.toEqual(new Error('Tile test:-1,-1 not found'));
  });

  it('should throw as world does not exists', async () => {
    await expect(repository.get({ world: 'toto' }, { x: 0, y: 0 }))
      .rejects.toEqual(new Error('Tile toto:0,0 not found'));
  });
});

describe('TileRepository.bulkGet', () => {
  it('should return latest version of all asked tiles', async () => {
    await expect(repository.bulkGet({ world: 'test' }, [{ x: 0, y: 0 }, { x: 1, y: 2 }, { x: 0, y: -1 }]))
      .resolves.toEqual([
        {
          pos: { x: 0, y: 0 },
          biome: 'grass'
        },
        {
          pos: { x: 1, y: 2 },
          biome: 'grass'
        },
      ]);
  });

  it('should return version 0 of all asked tiles', async () => {
    await expect(repository.bulkGet({ world: 'test', version: 0 }, [{ x: 0, y: 0 }, { x: 1, y: 2 }]))
      .resolves.toEqual([
        {
          pos: { x: 0, y: 0 },
          biome: 'sand'
        },
        {
          pos: { x: 1, y: 2 },
          biome: 'sand'
        },
      ]);
  });
});

describe('TileRepository.put', () => {
  it('should create a new version to given tile', async () => {
    await repository.put({ world: 'test' }, {
      pos: { x: 0, y: 0 },
      biome: 'rock'
    });

    await expect(database.tiles.get(['test', 0, 0]))
      .resolves.toEqual({
        world: 'test',
        pos: { x: 0, y: 0 },
        biome: 'rock',
        history: ['sand', 'grass', 'rock']
      });
  });

  it('should update given version of given tile and remove next versions', async () => {
    await repository.put({ world: 'test', version: 0 }, {
      pos: { x: 0, y: 0 },
      biome: 'rock'
    });

    await expect(database.tiles.get(['test', 0, 0]))
      .resolves.toEqual({
        world: 'test',
        pos: { x: 0, y: 0 },
        biome: 'rock',
        history: ['rock']
      });
  });

  it('should update latest version of given tile', async () => {
    await repository.put({ world: 'test', version: 1 }, {
      pos: { x: 0, y: 0 },
      biome: 'rock'
    });

    await expect(database.tiles.get(['test', 0, 0]))
      .resolves.toEqual({
        world: 'test',
        pos: { x: 0, y: 0 },
        biome: 'rock',
        history: ['sand', 'rock']
      });
  });

  it('should create given version of given tile and all missing version', async () => {
    await repository.put({ world: 'test', version: 4 }, {
      pos: { x: 0, y: 0 },
      biome: 'rock'
    });

    await expect(database.tiles.get(['test', 0, 0]))
      .resolves.toEqual({
        world: 'test',
        pos: { x: 0, y: 0 },
        biome: 'rock',
        history: ['sand', 'grass', 'grass', 'grass', 'rock']
      });
  });
});

describe('TileRepository.bulkPut', () => {
  it('should update all given tiles', async () => {
    await repository.bulkPut({ world: 'test' }, [
      {
        pos: { x: 0, y: 0 },
        biome: 'rock'
      },
      {
        pos: { x: 1, y: 2 },
        biome: 'rock'
      }
    ]);

    await expect(database.tiles.get(['test', 0, 0]))
      .resolves.toEqual({
        world: 'test',
        pos: { x: 0, y: 0 },
        biome: 'rock',
        history: ['sand', 'grass', 'rock']
      });

    await expect(database.tiles.get(['test', 1, 2]))
      .resolves.toEqual({
        world: 'test',
        pos: { x: 1, y: 2 },
        biome: 'rock',
        history: ['sand', 'grass', 'rock']
      });
  });

  it('should create all given tiles', async () => {
    await repository.bulkPut({ world: 'test' }, [
      {
        pos: { x: -1, y: 0 },
        biome: 'rock'
      },
      {
        pos: { x: -1, y: 2 },
        biome: 'rock'
      }
    ]);

    await expect(database.tiles.get(['test', -1, 0]))
      .resolves.toEqual({
        world: 'test',
        pos: { x: -1, y: 0 },
        biome: 'rock',
        history: ['rock']
      });

    await expect(database.tiles.get(['test', -1, 2]))
      .resolves.toEqual({
        world: 'test',
        pos: { x: -1, y: 2 },
        biome: 'rock',
        history: ['rock']
      });
  });
});
