import { BST } from './bst';

// Types
interface PQItem<T> {
  priority: number;
  data: T;
}

// Class
export class PriorityQueue<T> {
  // Attributes
  private readonly _bst = BST.empty((item: PQItem<T>) => item.priority, (a, b) => a - b);

  // Methods
  insert(data: T, priority = 0): void {
    this._bst.insert({ priority, data }, 'after');
  }

  pop(): T | null {
    return this._bst.pop()?.data ?? null;
  }
}
