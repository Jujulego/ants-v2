import { DexieOptions } from 'dexie';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';

import { container } from '@/inversify.config';
import { DEXIE_OPTIONS } from '@/world/idb/dexie';
import { TileRepository } from '@/world/idb/tile.repository';

// Setup
let repository: TileRepository;

beforeEach(() => {
  container.snapshot();

  // Inject new fake indexeddb instance
  container.bind<DexieOptions>(DEXIE_OPTIONS).toConstantValue({
    indexedDB: new IDBFactory(),
    IDBKeyRange: IDBKeyRange,
  });

  // Get repository instance using injected indexeddb
  repository = container.get(TileRepository);
});

afterEach(() => {
  container.restore();
});

// Tests
describe('TileRepository.get', () => {
  beforeEach(async () => {
    await repository.table.put({
      world: 'test',
      pos: { x: 0, y: 0 },
      biome: 'grass',
      history: ['sand', 'grass'],
    });
  });

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
    await expect(repository.get({ world: 'test' }, { x: 1, y: 0 }))
      .rejects.toEqual(new Error('Tile test:1,0 not found'));
  });

  it('should throw as world does not exists', async () => {
    await expect(repository.get({ world: 'toto' }, { x: 0, y: 0 }))
      .rejects.toEqual(new Error('Tile toto:0,0 not found'));
  });
});
