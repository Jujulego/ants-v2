'use client';

import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { useServerInsertedHTML } from 'next/navigation';
import { ReactNode, useMemo } from 'react';

// Types
export interface StyleRegistryProps {
  children: ReactNode;
}

// Utils
function each<T, R>(iterable: Iterable<T>, map: (val: T) => R): R[] {
  const result: R[] = [];

  for (const val of iterable) {
    result.push(map(val));
  }

  return result;
}

// Component
export default function StyleRegistry({ children }: StyleRegistryProps) {
  // Setup cache
  const { cache, flush } = useMemo(() => {
    const cache = createCache({ key: 'mui-style' });

    const prevInserted = cache.insert;
    let inserted = new Set<string>();

    cache.insert = (...args) => {
      const serialized = args[1];
      inserted.add(serialized.name);

      return prevInserted(...args);
    };

    return {
      cache,
      flush() {
        const previous = inserted;
        inserted = new Set();

        return previous;
      }
    };
  }, []);

  // Inject styles
  useServerInsertedHTML(() => {
    return (
      <>
        { each(flush(), (name) => {
          const style = cache.inserted[name];

          return style === true ? null : (
            <style
              key={name}
              data-emotion={`${cache.key} ${name}`}
              dangerouslySetInnerHTML={{ __html: style }}
            />
          );
        }) }
      </>
    );
  });

  // Render
  return (
    <CacheProvider value={cache}>
      { children }
    </CacheProvider>
  );
}
