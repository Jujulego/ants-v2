// Types
export interface IMessage<T extends string = string> {
  readonly type: T;
}

export type IPayload<M extends IMessage> = M & {
  readonly sessionId: string;
};
