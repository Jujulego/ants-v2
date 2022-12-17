import { Query } from '@jujulego/aegis';
import { waitForEvent } from '@jujulego/event-tree';

// Hook
export function useQuery<D>(query: Query<D>): D {
  const state = query.state;

  if (state.status === 'pending') {
    throw waitForEvent(query, 'status');
  }

  if (state.status === 'failed') {
    throw state.error;
  }

  return state.result;
}
