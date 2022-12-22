import { Query } from '@jujulego/aegis';
import { waitForEvent } from '@jujulego/event-tree';

// Hook
export function useQuery<D>(query: Query<D>, suspense: true): D;
export function useQuery<D>(query: Query<D>, suspense?: false): D | undefined;
export function useQuery<D>(query: Query<D>, suspense = false) {
  const state = query.state;

  if (state.status === 'pending') {
    if (suspense) {
      throw waitForEvent(query, 'status');
    } else {
      return;
    }
  }

  if (state.status === 'failed') {
    throw state.error;
  }

  return state.result;
}
