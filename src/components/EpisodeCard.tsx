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
import { colors, fonts, radius, space } from '@/theme';

interface Props {
  series: Series;
  episode: Episode;
  height: number;
  active: boolean;
  locked: boolean;
  /** Next episode exists and is locked: show the cliffhanger lock when this one ends. */
  nextLocked: boolean;
  onEnded: () => void;
  onUnlock: (episode: Episode) => void;
}

export function EpisodeCard(props: Props) {
  if (props.locked) return <LockedEpisode {...props} />;
  return <PlayingEpisode {...props} />;
}

function PlayingEpisode({ series, episode, height, active, nextLocked, onEnded, onUnlock }: Props) {
  const source = playback.source(episode);
  const player = useVideoPlayer(source, (p) => {
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
  // Once the video has drawn a frame the poster underneath is dead weight — and it
  // is what flashes when the native stack snapshots this screen on the way out
  // (the video layer is not captured by the snapshot, the poster behind it is).
  const [hasFrame, setHasFrame] = useState(false);
  // Reset "ended" when the card scrolls out, so it replays from the start next time.
  const [wasActive, setWasActive] = useState(active);
  if (active !== wasActive) {
    setWasActive(active);
    if (!active) setEnded(false);
  }

  useEffect(() => {
    if (!source) return;
    if (active && !ended) player.play();
    if (!active) rewind(player);
  }, [active, ended, player, source]);

  useEventListener(player, 'playToEnd', () => {
    setEnded(true);
    onEnded();
  });

  // The next episode was locked when this one ended and has just been unlocked:
  // advance now instead of leaving the viewer on a frozen frame.
  useEffect(() => {
    if (active && ended && !nextLocked) onEnded();
  }, [active, ended, nextLocked, onEnded]);

  const duration = player.duration || episode.durationSec;
  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;
  const cliffhanger = ended && nextLocked;

  return (
    <View style={[styles.card, { height }]}>
      {!source || !hasFrame ? <Image source={episode.art} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}
      {source ? (
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={false}
          allowsPictureInPicture={false}
          onFirstFrameRender={() => setHasFrame(true)}
        />
      ) : null}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => {
          if (!source || ended) return;
          if (isPlaying) player.pause();
          else player.play();
        }}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
      />
      {!isPlaying && source && !ended ? (
        <View pointerEvents="none" style={styles.pausedBadge}>
          <Ionicons name="play" size={34} color={colors.white} />
        </View>
      ) : null}
      <Chrome series={series} episode={episode} />
      <View style={styles.progress}>
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
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', 'rgba(0,0,0,0.75)']}
        style={styles.bottomShade}
      />
      <View pointerEvents="box-none" style={styles.rail}>
        <RailButton icon="heart-outline" label={compact(episode.likes)} />
        <RailButton icon="chatbubble-outline" label={compact(episode.comments)} />
        <RailButton icon="share-social-outline" label="Share" />
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

function RailButton({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.railItem}>
      <View style={styles.railCircle}>
        <Ionicons name={icon} size={22} color={colors.white} />
      </View>
      <Text variant="caption" color={colors.textSoft}>
        {label}
      </Text>
    </View>
  );
}

function rewind(player: VideoPlayer) {
  player.pause();
  player.currentTime = 0;
}

function compact(n: number) {
  return n >= 1000 ? `${Math.round(n / 100) / 10}K`.replace('.0K', 'K') : String(n);
}

export function mmss(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
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
    backgroundColor: 'rgba(0,0,0,0.45)',
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
    backgroundColor: 'rgba(0,0,0,0.4)',
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
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  progress: { position: 'absolute', left: 0, right: 0, bottom: 96, height: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
  progressFill: { height: 3, backgroundColor: colors.cyan },
  watchText: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.black },
});
