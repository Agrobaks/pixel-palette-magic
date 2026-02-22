import { useState, useCallback, useRef } from "react";
import { SkipBack, SkipForward, Play, Pause, Volume2, VolumeX } from "lucide-react";
import ReactPlayer from "react-player";
import logo from "@/assets/logo.png";
import title1 from "@/assets/title1.jpg";
import title2 from "@/assets/title2.jpg";
import title3 from "@/assets/title3.jpg";

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string;
  videoUrl: string;
  titleUrl: string;
  prototype: string;
}

const tracks: Track[] = [
  { id: 1, title: "Fast & Furious. Smooth. On-chain", artist: "MagicBlock", duration: "2:07", videoUrl: "https://www.youtube.com/watch?v=MI1hEPVODbA", titleUrl: title1, prototype: "Luis Fonsi – Despacito" },
  { id: 2, title: "Magic Moments", artist: "MagicBlock", duration: "2:34", videoUrl: "https://www.youtube.com/watch?v=ZmNj2tOAy5U", titleUrl: title2, prototype: "Perry Como – Magic Moments" },
  { id: 3, title: "Fast, Loud & On-Chain!", artist: "MagicBlock", duration: "2:07", videoUrl: "https://www.youtube.com/watch?v=oG1mDdZwQj0", titleUrl: title3, prototype: "The Offspring – The Kids Aren't Alright" },
];

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const Index = () => {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [played, setPlayed] = useState(0);
  const [playKey, setPlayKey] = useState(0);
  const playerRef = useRef<HTMLVideoElement>(null);

  const track = tracks[currentTrack];

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => {
      if (!prev) {
        // Force remount with playing=true to bypass mobile autoplay restrictions
        setPlayKey((k) => k + 1);
      }
      return !prev;
    });
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentTrack((p) => (p === 0 ? tracks.length - 1 : p - 1));
    setPlayKey((k) => k + 1);
    setIsPlaying(true);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentTrack((p) => (p === tracks.length - 1 ? 0 : p + 1));
    setPlayKey((k) => k + 1);
    setIsPlaying(true);
  }, []);

  const handleTrackClick = (index: number) => {
    setCurrentTrack(index);
    setPlayKey((k) => k + 1);
    setIsPlaying(true);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = (e.clientX - rect.left) / rect.width;
    const video = playerRef.current;
    if (video && video.duration) {
      video.currentTime = fraction * video.duration;
    }
    setProgress(fraction);
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const el = e.currentTarget;
    if (el.duration) {
      setPlayed(el.currentTime);
      setProgress(el.currentTime / el.duration);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky top section */}
      <div className="sticky top-0 z-50 glass-panel">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 md:py-4 md:max-w-[1200px] md:w-full md:mx-auto md:px-0">
          <div className="flex items-center gap-3">
            <img src={logo} alt="MagicBlock Records" className="h-8 md:h-12 w-auto" />
          </div>
          <span className="text-muted-foreground text-xs md:text-sm md:font-medium md:tracking-wide transition-all duration-300 cursor-default author-hover-glow">
            Created by Agrobaks
          </span>
        </header>

        {/* Control Center */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 p-3 md:py-5 md:justify-center md:px-0 md:mx-auto md:max-w-[1200px] md:w-full">
          {/* Left: Player Controls */}
          <div className="w-full md:flex-1 p-5 border neon-border-solid rounded-lg flex flex-col justify-between md:max-h-[340px] neon-block-glow">
            {/* Cover + Info */}
            <div className="flex gap-4 md:gap-5">
              <div className="relative flex-shrink-0">
                <img
                  src={track.titleUrl}
                  alt={track.title}
                  className="w-28 h-28 md:w-36 md:h-36 rounded-lg object-cover shadow-lg cover-glow"
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="text-xs md:text-sm font-bold tracking-widest text-neon-purple uppercase mb-1 md:mb-2">Now Playing</p>
                <h2 className="text-lg md:text-2xl font-extrabold truncate leading-tight">{track.title}</h2>
                <p className="text-sm md:text-base text-muted-foreground truncate mt-1">{track.artist}</p>
              </div>
            </div>

            {/* Controls row */}
            <div className="flex items-center gap-5 md:gap-6 mt-5 md:mt-8 w-full">
              <button onClick={handlePrev} className="text-muted-foreground hover:text-foreground transition-colors md:text-primary md:hover:text-primary">
                <SkipBack size={20} className="md:w-6 md:h-6" />
              </button>
              <button
                onClick={handlePlayPause}
                className="w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center play-btn-glow text-primary-foreground transition-all flex-shrink-0"
              >
                {isPlaying ? <Pause size={18} className="md:w-6 md:h-6" /> : <Play size={18} className="ml-0.5 md:w-6 md:h-6" />}
              </button>
              <button onClick={handleNext} className="text-muted-foreground hover:text-foreground transition-colors md:text-primary md:hover:text-primary">
                <SkipForward size={20} className="md:w-6 md:h-6" />
              </button>
              <div className="flex items-center gap-2 md:gap-3 ml-auto mr-4">
                <button onClick={() => setMuted(!muted)} className="text-muted-foreground hover:text-foreground transition-colors">
                  {muted || volume === 0 ? <VolumeX size={16} className="md:w-5 md:h-5" /> : <Volume2 size={16} className="md:w-5 md:h-5" />}
                </button>
                <input
                  type="range" min="0" max="1" step="0.01"
                  value={muted ? 0 : volume}
                  onChange={(e) => { setVolume(parseFloat(e.target.value)); setMuted(false); }}
                  className="w-20 md:w-28 h-1 md:h-1.5 volume-slider cursor-pointer"
                  style={{
                    background: `linear-gradient(90deg, hsl(260 100% 65%), hsl(220 100% 60%) ${(muted ? 0 : volume) * 100}%, hsl(0 0% 50% / 0.3) ${(muted ? 0 : volume) * 100}%)`,
                    borderRadius: '9999px',
                  }}
                />
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-5 md:mt-6 flex items-center gap-3 text-xs md:text-sm w-full">
              <span className="w-10 text-right tabular-nums text-neon-purple font-semibold">{formatTime(played)}</span>
              <div className="flex-1 progress-bar-track bg-muted/50 rounded-full cursor-pointer relative" onClick={handleSeek}>
                <div className="h-full progress-neon rounded-full transition-all" style={{ width: `${progress * 100}%` }} />
              </div>
              <span className="w-10 tabular-nums text-muted-foreground">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Video Player */}
          <div className="w-full md:flex-1 border neon-border-solid rounded-lg overflow-hidden neon-block-glow">
            <div className="aspect-video">
              <ReactPlayer
                key={playKey}
                ref={playerRef}
                src={track.videoUrl}
                playing={isPlaying}
                volume={muted ? 0 : volume}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={(e: React.SyntheticEvent<HTMLVideoElement>) => setDuration(e.currentTarget.duration)}
                onEnded={handleNext}
                width="100%"
                height="100%"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Track List */}
      <div className="md:max-w-[1200px] md:w-full md:mx-auto max-w-full border neon-border-solid rounded-lg md:mt-4 md:mb-8 neon-block-glow">
        {/* Table header */}
        <div className="grid grid-cols-[3rem_1fr_5rem] md:grid-cols-[4rem_1fr_1fr_7rem] px-4 md:px-6 py-3 md:py-2 border-b border-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          <span>#</span>
          <span>Title</span>
          <span className="hidden md:block">Inspiration</span>
          <span className="text-right">Duration</span>
        </div>

        {/* Tracks */}
        {tracks.map((t, i) => (
          <div
            key={t.id}
            onClick={() => handleTrackClick(i)}
            className={`grid grid-cols-[3rem_1fr_5rem] md:grid-cols-[4rem_1fr_1fr_7rem] px-4 md:px-6 py-3 md:py-4 cursor-pointer transition-all duration-200 track-row-hover border-b border-muted/10 ${
              i === currentTrack ? "bg-muted/20" : ""
            }`}
          >
            <span className="flex items-center text-sm tabular-nums">
              <span className={i === currentTrack ? "text-neon-purple font-bold" : "text-muted-foreground"}>{i + 1}</span>
            </span>
            <div className="flex items-center gap-3 md:gap-4 min-w-0">
              <div className="relative flex-shrink-0">
                <img src={t.titleUrl} alt={t.title} className="w-10 h-10 md:w-12 md:h-12 rounded object-cover" />
                {i !== currentTrack && (
                  <div className="hidden md:flex absolute inset-0 items-center justify-center bg-background/50 rounded opacity-0 hover:opacity-100 transition-opacity">
                    <Play size={16} className="text-neon-purple" />
                  </div>
                )}
                {i === currentTrack && (
                  <div className="hidden md:flex absolute inset-0 items-center justify-center bg-background/40 rounded">
                    <Play size={16} className="text-neon-purple" fill="currentColor" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className={`text-sm md:text-base font-semibold truncate ${i === currentTrack ? "text-foreground" : ""}`}>{t.title}</p>
                <p className="text-xs md:text-sm text-muted-foreground truncate">{t.artist}</p>
              </div>
            </div>
            <span className="hidden md:flex items-center text-sm text-muted-foreground/70 truncate">{t.prototype}</span>
            <span className="flex items-center justify-end text-sm md:text-base text-muted-foreground tabular-nums">{t.duration}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Index;
