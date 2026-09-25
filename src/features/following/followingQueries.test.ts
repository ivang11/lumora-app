import { describe, expect, it } from 'vitest';

import { followingKey, followingQueryOptions } from './followingQueries';

describe('following queries', () => {
  it('isolates cached following shows by user', () => {
    expect(followingKey(7)).toEqual(['lumora', 'following', 7]);
    expect(followingKey(8)).not.toEqual(followingKey(7));
  });

  it('does not request following shows without an authenticated session', () => {
    expect(followingQueryOptions(null, null).enabled).toBe(false);
  });
});
