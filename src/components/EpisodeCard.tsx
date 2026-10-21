import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEvent, useEventListener } from 'expo';
import { useVideoPlayer, VideoView, type VideoPlayer } from 'expo-video';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { LockCard } from '@/components/LockCard';
import { Text } from '@/components/Text';
import type { Episode, Series } from '@/data/types';
import { playback } from '@/services/playback';
import { colors, radius, scrim, space } from '@/theme';
import { compact, mmss } from '@/utils/format';

interface Props {
  series: Series;
  episode: Episode;
  index: number;
  height: number;
  /** This card is the one on screen. Only the active card plays. */
  active: boolean;
  locked: boolean;
  /** Next episode exists and is locked: show the cliffhanger lock when this one ends. */
  nextLocked: boolean;
  /** Called with this card's index when the viewer should move on to the next episode. */
  onAdvance: (fromIndex: number) => void;
  onUnlock: (episode: Episode) => void;
}

export function EpisodeCard(props: Props) {
  if (props.locked) return <LockedEpisode {...props} />;
  return <PlayingEpisode {...props} />;
}

function PlayingEpisode({ series, episode, index, height, active, nextLocked, onAdvance, onUnlock }: Props) {
  const player = useVideoPlayer(playback.source(episode), (p) => {
    p.loop = false;
    p.timeUpdateEventInterval = 0.25;
  });
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const { currentTime } = useEvent(player, 'timeUpdate', {
    currentTime: 0,
    bufferedPosition: 0,
    currentLiveTimestamp: null,
    currentOffsetFromLive: null,
  });
  const [ended, setEnded] = useState(false);
  // Reset "ended" when the card scrolls out, so it replays from the start next time.
  const [wasActive, setWasActive] = useState(active);
  if (active !== wasActive) {
    setWasActive(active);
    if (!active) setEnded(false);
  }

  useEffect(() => {
    if (active && !ended) player.play();
    if (!active) rewind(player);
  }, [active, ended, player]);

  useEventListener(player, 'playToEnd', () => setEnded(true));

  // The single place that moves the feed on. Runs when this episode ends with the
  // next one free, and again if the next one gets unlocked while sitting here.
  useEffect(() => {
    if (active && ended && !nextLocked) onAdvance(index);
  }, [active, ended, nextLocked, onAdvance, index]);

  const duration = player.duration || episode.durationSec;
  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;
  const cliffhanger = ended && nextLocked;

  return (
    <View style={[styles.card, { height }]}>
      {/* Nothing under the video: a poster showed for a beat before the first frame on
          Android, and it is what the native stack's exit snapshot reveals on iOS. Black
          until the first frame is the honest state. */}
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
        allowsPictureInPicture={false}
        // Android: a SurfaceView ignores the card's clipping, so a cover-scaled 9:16
        // video wraps its overflow to the bottom of the card. TextureView clips correctly.
        surfaceType="textureView"
      />
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => {
          if (ended) return;
          if (isPlaying) player.pause();
          else player.play();
        }}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
      />
      {!isPlaying && !ended ? (
        <View pointerEvents="none" style={styles.pausedBadge}>
          <Ionicons name="play" size={34} color={colors.white} />
        </View>
      ) : null}
      <Chrome series={series} episode={episode} />
      <View style={styles.progress} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      {cliffhanger ? (
        <LockCard
          title={`Unlock Episode ${episode.number + 1}`}
          subtitle="The cliffhanger continues"
          onPress={() => onUnlock(episode)}
          emphasis
        />
      ) : null}
    </View>
  );
}

function LockedEpisode({ series, episode, height, onUnlock }: Props) {
  return (
    <View style={[styles.card, { height }]}>
      <Image source={episode.art} style={StyleSheet.absoluteFill} contentFit="cover" />
      <View style={styles.dim} />
      <Chrome series={series} episode={episode} />
      <LockCard title={`Unlock Episode ${episode.number}`} onPress={() => onUnlock(episode)} />
    </View>
  );
}

function Chrome({ series, episode }: { series: Series; episode: Episode }) {
  return (
    <>
      <LinearGradient pointerEvents="none" colors={['transparent', scrim(0.75)]} style={styles.bottomShade} />
      <View pointerEvents="box-none" style={styles.rail}>
        <RailButton icon="heart-outline" label={compact(episode.likes)} a11y="Like" />
        <RailButton icon="chatbubble-outline" label={compact(episode.comments)} a11y="Comments" />
        <RailButton icon="share-social-outline" label="Share" a11y="Share" />
      </View>
      <View pointerEvents="box-none" style={styles.meta}>
        <Text variant="title" style={styles.metaTitle}>
          {series.title}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.epPill}>
            <Text variant="label" color={colors.textSoft}>
              Ep {episode.number}
            </Text>
          </View>
          <Text color={colors.textFaint}>•</Text>
          <Text variant="bodyMedium" color={colors.textSoft}>
            {mmss(episode.durationSec)}
          </Text>
        </View>
        <Text variant="bodyMedium" color={colors.textSoft} numberOfLines={1}>
          {episode.title}
        </Text>
      </View>
    </>
  );
}

/** Design affordance; inert in the mock (see CLAUDE.md "Inert affordances"). */
function RailButton({ icon, label, a11y }: { icon: keyof typeof Ionicons.glyphMap; label: string; a11y: string }) {
  return (
    <Pressable style={styles.railItem} accessibilityRole="button" accessibilityLabel={a11y}>
      <View style={styles.railCircle}>
        <Ionicons name={icon} size={22} color={colors.white} />
      </View>
      <Text variant="caption" color={colors.textSoft}>
        {label}
      </Text>
    </Pressable>
  );
}

// Plain function: the compiler lint forbids mutating a hook's return value inside an effect.
function rewind(player: VideoPlayer) {
  player.pause();
  player.currentTime = 0;
}

const styles = StyleSheet.create({
  card: { width: '100%', backgroundColor: colors.black, overflow: 'hidden' },
  dim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(6,21,50,0.45)' },
  bottomShade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '40%' },
  pausedBadge: {
    position: 'absolute',
    top: '45%',
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: scrim(0.45),
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
  },
  rail: { position: 'absolute', right: space.md, bottom: 150, alignItems: 'center', gap: space.lg },
  railItem: { alignItems: 'center', gap: 4 },
  railCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: scrim(0.4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { position: 'absolute', left: space.lg, right: 90, bottom: 120, gap: 6 },
  metaTitle: { fontSize: 22, lineHeight: 28 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  epPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: scrim(0.15, true),
  },
  progress: { position: 'absolute', left: 0, right: 0, bottom: 96, height: 3, backgroundColor: scrim(0.2, true) },
  progressFill: { height: 3, backgroundColor: colors.cyan },
});
