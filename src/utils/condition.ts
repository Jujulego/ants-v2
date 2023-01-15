import { EventSource } from '@jujulego/event-tree';

// Types
export type ConditionEventMap = {
  'result.true': true,
  'result.false': false,
}

// Class
export class Condition extends EventSource<ConditionEventMap> {
  // Constructor
  constructor(
    readonly condition: () => boolean,
  ) {
    super();
  }

  // Methods
  check(): void {
    const res = this.condition();
    this.emit(`result.${res}`, res);
  }
}
