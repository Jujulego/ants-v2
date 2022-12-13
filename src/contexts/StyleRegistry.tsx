'use client';

import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { useServerInsertedHTML } from 'next/navigation';
import { ReactNode, useMemo } from 'react';

// Types
export interface StyleRegistryProps {
  children: ReactNode;
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
    const names = flush();

    if (names.size === 0) return null;

    let key = cache.key;
    let styles = '';

    for (const name of names) {
      key += ' ' + name;
      styles += cache.inserted[name];
    }

    return (
      <style
        data-emotion={key}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  // Render
  return (
    <CacheProvider value={cache}>
      { children }
    </CacheProvider>
  );
}
