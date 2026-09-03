import { describe, expect, it } from "vitest";

import {
  emptyMediaState,
  mediaStateKey,
  mediaStateQueryOptions,
} from "@/features/media/mediaQueries";

describe("mediaQueries", () => {
  it("isolates cached media state by user", () => {
    expect(mediaStateKey("show", "42", 1)).not.toEqual(
      mediaStateKey("show", "42", 2),
    );
  });

  it("isolates guest state from authenticated state", () => {
    expect(mediaStateKey("movie", "7", null)).toEqual([
      "lumora",
      "media-state",
      "guest",
      "movie",
      "7",
    ]);
    expect(mediaStateKey("movie", "7", 3)).not.toEqual(
      mediaStateKey("movie", "7", null),
    );
  });

  it("does not enable a state request without a token", () => {
    const options = mediaStateQueryOptions("show", "42", null, null);

    expect(options.enabled).toBe(false);
  });

  it("creates fresh empty state values", () => {
    const first = emptyMediaState();
    const second = emptyMediaState();

    first.watched_episode_ids.push(1);

    expect(second).toEqual({
      watchlist: null,
      favorite: null,
      watched_episode_ids: [],
    });
  });
});
