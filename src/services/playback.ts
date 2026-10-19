// Playback service. One place that knows how an episode becomes a player
// source. The mock bundles short clips; the real app would hand expo-video an
// HLS URL (plus DRM config) from the TargetVideo player platform, or swap the
// whole layer for a native wrapper around their SDK — see README "Decisions".
import type { VideoSource } from 'expo-video';

import type { Episode } from '@/data/types';

export const playback = {
  /** Source for expo-video, or null when the episode has no media in the mock. */
  source(episode: Episode): VideoSource | null {
    if (episode.clip == null) return null;
    return {
      assetId: episode.clip,
      metadata: { title: episode.title, artist: `Episode ${episode.number}` },
    };
  },
  /** Seconds before the end at which the next episode starts preloading. */
  preloadLeadSec: 5,
};
