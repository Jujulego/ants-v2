// Type utils
export interface IClassOf<T> {
  new (...args: any[]): T;
}

export type Awaitable<T> = PromiseLike<T> | T;
