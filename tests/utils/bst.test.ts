import { BST } from '@/utils/bst';

// Prepare data
const numbers = [1, 2, 2, 2, 4, 5];
let bst: BST<number>;

beforeEach(() => {
  bst = BST.fromArray(numbers, n => n, (a, b) => a - b);
});

// Tests suites
describe('BST.nearest', () => {
  test('lt mode', () => {
    expect(bst.nearest(0, 'lt')).toBeNull();
    expect(bst.nearest(4, 'lt')).toBe(2);
    expect(bst.nearest(10, 'lt')).toBe(5);
  });

  test('lte mode', () => {
    expect(bst.nearest(0, 'lte')).toBeNull();
    expect(bst.nearest(4, 'lte')).toBe(4);
    expect(bst.nearest(10, 'lte')).toBe(5);
  });

  test('gte mode', () => {
    expect(bst.nearest(0, 'gte')).toBe(1);
    expect(bst.nearest(4, 'gte')).toBe(4);
    expect(bst.nearest(10, 'gte')).toBeNull();
  });

  test('gt mode', () => {
    expect(bst.nearest(0, 'gt')).toBe(1);
    expect(bst.nearest(4, 'gt')).toBe(5);
    expect(bst.nearest(10, 'gt')).toBeNull();
  });
});

describe('BST.search', () => {
  test('on existing element', () => {
    expect(bst.search(2)).toEqual([2, 2, 2]);
  });

  test('on unknown elements', () => {
    expect(bst.search(3))
      .toEqual([]);

    expect(bst.search(10))
      .toEqual([]);
  });
});

describe('BST.insert', () => {
  test('a new element after same key group', () => {
    bst.insert(4);

    expect(bst.array)
      .toEqual([1, 2, 2, 2, 4, 4, 5]);
  });

  test('a new element before same key group', () => {
    bst.insert(1);

    expect(bst.array)
      .toEqual([1, 1, 2, 2, 2, 4, 5]);
  });

  test('a new element before first', () => {
    bst.insert(0);

    expect(bst.array)
      .toEqual([0, 1, 2, 2, 2, 4, 5]);
  });

  test('a new element after last', () => {
    bst.insert(6);

    expect(bst.array)
      .toEqual([1, 2, 2, 2, 4, 5, 6]);
  });

  test('in an empty bst', () => {
    const bst = BST.empty<number>(n => n, (a, b) => a - b);
    bst.insert(6);

    expect(bst.array)
      .toEqual([6]);
  });
});

describe('BST.remove', () => {
  test('an existing element', () => {
    expect(bst.remove(2))
      .toEqual([2, 2, 2]);

    expect(bst.array)
      .toEqual([1, 4, 5]);
  });

  test('a missing element', () => {
    expect(bst.remove(0))
      .toEqual([]);

    expect(bst.array)
      .toEqual([1, 2, 2, 2, 4, 5]);
  });
});

describe('BST.removeUntil', () => {
  test('an existing element', () => {
    expect(bst.removeUntil(2))
      .toEqual([1]);

    expect(bst.array)
      .toEqual([2, 2, 2, 4, 5]);
  });
});
