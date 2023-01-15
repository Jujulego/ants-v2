import { waitForEvent } from '@jujulego/event-tree';

import { BST } from './bst';
import { Condition } from './condition';

// Types
interface PQItem<T> {
  priority: number;
  data: T;
}

// Class
export class PriorityQueue<T> implements AsyncIterable<T> {
  // Attributes
  private readonly _bst = BST.empty((item: PQItem<T>) => item.priority, (a, b) => a - b);
  private readonly _condition = new Condition(() => this._bst.length > 0);

  // Methods
  insert(data: T, priority = 0): void {
    this._bst.insert({ priority, data }, 'after');
    this._condition.check();
  }

  async pop(): Promise<T> {
    let item = this._bst.pop();

    while (!item) {
      await waitForEvent(this._condition, 'result.true');
      item = this._bst.pop();
    }

    return item.data;
  }

  [Symbol.asyncIterator](): AsyncIterator<T, void> {
    return {
      next: async (): Promise<IteratorResult<T, void>> => ({ value: await this.pop() }),
    };
  }
}
