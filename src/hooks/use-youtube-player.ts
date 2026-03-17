import { useEffect, useRef, useCallback, useState } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

interface UseYouTubePlayerOptions {
  videoId: string;
  containerId: string;
  autoplay: boolean;
  volume: number;
  muted: boolean;
  onStateChange?: (isPlaying: boolean) => void;
  onReady?: () => void;
}

export function useYouTubePlayer({
  videoId,
  containerId,
  autoplay,
  volume,
  muted,
  onStateChange,
  onReady,
}: UseYouTubePlayerOptions) {
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Load YT API script once
  useEffect(() => {
    if (window.YT && window.YT.Player) return;
    if (document.getElementById("yt-iframe-api")) return;
    const tag = document.createElement("script");
    tag.id = "yt-iframe-api";
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }, []);

  // Create / recreate player when videoId changes
  useEffect(() => {
    let cancelled = false;

    const createPlayer = () => {
      if (cancelled) return;
      // Destroy old player
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
      setIsReady(false);
      setCurrentTime(0);
      setProgress(0);
      setDuration(0);

      playerRef.current = new window.YT.Player(containerId, {
        videoId,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: (e: any) => {
            if (cancelled) return;
            setIsReady(true);
            const dur = e.target.getDuration() || 0;
            setDuration(dur);
            e.target.setVolume(muted ? 0 : volume * 100);
            onReady?.();
          },
          onStateChange: (e: any) => {
            if (cancelled) return;
            const playing = e.data === window.YT.PlayerState.PLAYING;
            onStateChange?.(playing);
            // Update duration if not set
            if (playing) {
              const dur = e.target.getDuration();
              if (dur) setDuration(dur);
            }
          },
        },
      });
    };

    const waitForAPI = () => {
      if (window.YT && window.YT.Player) {
        createPlayer();
      } else {
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          prev?.();
          createPlayer();
        };
      }
    };

    waitForAPI();

    return () => {
      cancelled = true;
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, containerId]);

  // Poll current time
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      if (!playerRef.current?.getCurrentTime) return;
      try {
        const t = playerRef.current.getCurrentTime() || 0;
        const d = playerRef.current.getDuration() || 0;
        setCurrentTime(t);
        if (d > 0) {
          setDuration(d);
          setProgress(t / d);
        }
      } catch {}
    }, 250);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isReady]);

  // Sync volume
  useEffect(() => {
    if (!isReady || !playerRef.current) return;
    try {
      if (muted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume * 100);
      }
    } catch {}
  }, [volume, muted, isReady]);

  const play = useCallback(() => {
    try { playerRef.current?.playVideo(); } catch {}
  }, []);

  const pause = useCallback(() => {
    try { playerRef.current?.pauseVideo(); } catch {}
  }, []);

  const seekTo = useCallback((fraction: number) => {
    if (!playerRef.current?.getDuration) return;
    try {
      const d = playerRef.current.getDuration();
      playerRef.current.seekTo(fraction * d, true);
    } catch {}
  }, []);

  return { currentTime, duration, progress, play, pause, seekTo, isReady };
}
