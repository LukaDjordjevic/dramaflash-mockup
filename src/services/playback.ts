// Playback service. One place that knows how an episode becomes a player
// source. The mock bundles short clips; the real app would hand expo-video an
// HLS URL (plus DRM config) from the TargetVideo player platform, or swap the
// whole layer for a native wrapper around their SDK — see docs/decisions.md.
import type { VideoSource } from 'expo-video';

import type { Episode } from '@/data/types';

export const playback = {
  source(episode: Episode): VideoSource {
    return {
      assetId: episode.clip,
      metadata: { title: episode.title, artist: `Episode ${episode.number}` },
    };
  },
};
