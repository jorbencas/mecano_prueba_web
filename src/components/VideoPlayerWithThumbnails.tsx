import React, { useRef, useState, useEffect, MouseEvent } from "react";
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress, FaClosedCaptioning, FaCog } from "react-icons/fa";

interface Thumbnail {
  time: number;
  image: string;
}

interface VideoPlayerProps {
  src: string;
  poster?: string;
  subtitlesUrl?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster, subtitlesUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [hoverTime, setHoverTime] = useState(0);
  const [hoverThumbnail, setHoverThumbnail] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [subtitleStyle, setSubtitleStyle] = useState({
    fontSize: "16px",
    color: "#FFFFFF",
  });
  const [showThumbnailBar, setShowThumbnailBar] = useState(false);
  const [views, setViews] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isThumbnailLoading, setIsThumbnailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const mediaSource = new MediaSource();
    video.src = URL.createObjectURL(mediaSource);

    mediaSource.addEventListener('sourceopen', async () => {
      try {
        const response = await fetch(src);
        const arrayBuffer = await response.arrayBuffer();
        const sourceBuffer = mediaSource.addSourceBuffer('video/mp4');
        
        sourceBuffer.addEventListener('updateend', () => {
          if (mediaSource.readyState !== 'open') {
            return;
          }
          mediaSource.endOfStream();
          generateThumbnails();
        });

        sourceBuffer.appendBuffer(arrayBuffer);
      } catch (error) {
        console.error('Error loading video:', error);
        setError('Error loading video. Please try again.');
      }
    });

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handleError = (e: Event) => {
      console.error('Video error:', e);
      setError('Error playing video. Please try again.');
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('error', handleError);

    return () => {
      URL.revokeObjectURL(video.src);
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('error', handleError);
    };
  }, [src]);

  const generateThumbnails = async () => {
    const video = videoRef.current;
    if (!video || video.duration <= 0) return;

    setIsThumbnailLoading(true);
    console.log('Starting thumbnail generation');

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      console.error('Canvas context not available');
      setIsThumbnailLoading(false);
      return;
    }

    const tempThumbnails: Thumbnail[] = [];
    const totalFrames = Math.min(10, Math.floor(video.duration));

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    for (let i = 0; i < totalFrames; i++) {
      const time = (i / totalFrames) * video.duration;
      video.currentTime = time;

      await new Promise<void>((resolve) => {
        const seeked = () => {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnailData = canvas.toDataURL('image/jpeg', 0.7);
          tempThumbnails.push({ time, image: thumbnailData });
          console.log(`Generated thumbnail for time: ${time}`);
          video.removeEventListener('seeked', seeked);
          resolve();
        };
        video.addEventListener('seeked', seeked);
      });
    }

    setThumbnails(tempThumbnails);
    setIsThumbnailLoading(false);
    console.log('Thumbnail generation complete');
  };

  const togglePlay = async () => {
    if (!videoRef.current) return;

    try {
      if (videoRef.current.paused) {
        await videoRef.current.play();
        setIsPlaying(true);
        incrementViews();
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error toggling play:', error);
      setError('Error playing video. Please try again.');
    }
  };

  const incrementViews = () => {
    const newViews = views + 1;
    setViews(newViews);
    localStorage.setItem("videoViews", newViews.toString());
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setVolume(videoRef.current.muted ? 0 : 1);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
    }
  };

  const handleProgressClick = (e: MouseEvent<HTMLDivElement>) => {
    const progressBar = progressRef.current;
    const video = videoRef.current;
    if (!progressBar || !video) return;

    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / progressBar.offsetWidth;
    video.currentTime = pos * video.duration;
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const progressBar = progressRef.current;
    const video = videoRef.current;
    if (!progressBar || !video) return;

    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / progressBar.offsetWidth;
    const time = pos * video.duration;
    setHoverTime(time);

    if (thumbnails.length > 0) {
      const closestThumbnail = thumbnails.reduce((prev, curr) =>
        Math.abs(curr.time - time) < Math.abs(prev.time - time) ? curr : prev
      );
      setHoverThumbnail(closestThumbnail.image);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const toggleSubtitles = () => {
    setShowSubtitles(!showSubtitles);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
    setShowSpeedMenu(false);
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl mx-auto bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        poster={poster}
        className="w-full"
        onClick={togglePlay}
      >
        {subtitlesUrl && (
          <track kind="subtitles" src={subtitlesUrl} srcLang="en" label="English" />
        )}
      </video>
      
      {!isPlaying && (
        <button
          className="absolute inset-0 flex items-center justify-center text-white text-6xl bg-black bg-opacity-50"
          onClick={togglePlay}
        >
          <FaPlay />
        </button>
      )}

      {showSubtitles && subtitlesUrl && (
        <div
          className="absolute bottom-16 left-0 right-0 text-center"
          style={{
            ...subtitleStyle,
            padding: "4px",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            borderRadius: "4px",
          }}
        >
          {/* Subtitles text would go here */}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-75 text-white p-4">
        <div 
          ref={progressRef}
          className="h-1 bg-gray-700 cursor-pointer mb-2"
          onClick={handleProgressClick}
          onMouseMove={handleMouseMove}
        >
          <div 
            className="h-full bg-red-500" 
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>
        {hoverThumbnail && (
          <div 
            className="absolute bottom-16 bg-black p-1 rounded"
            style={{ left: `${(hoverTime / duration) * 100}%` }}
          >
            <img src={hoverThumbnail} alt="Preview" className="w-24 h-auto" />
            <p className="text-xs text-center">{formatTime(hoverTime)}</p>
          </div>
        )}
        <div className="flex items-center justify-between">
          <button onClick={togglePlay} className="text-2xl">
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <div className="flex items-center">
            <button onClick={toggleMute} className="mr-2">
              {volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20"
            />
          </div>
          <div className="text-sm">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          <button onClick={toggleSubtitles} className="text-xl mr-2">
            <FaClosedCaptioning />
          </button>
          <div className="relative">
            <button onClick={() => setShowSpeedMenu(!showSpeedMenu)} className="text-xl mr-2">
              <FaCog />
            </button>
            {showSpeedMenu && (
              <div className="absolute bottom-full right-0 bg-gray-800 rounded p-2">
                {[0.5, 1, 1.5, 2].map(rate => (
                  <button
                    key={rate}
                    onClick={() => changePlaybackRate(rate)}
                    className={`block w-full text-left px-2 py-1 ${playbackRate === rate ? 'bg-gray-700' : ''}`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={toggleFullscreen} className="text-xl">
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </div>

      <div className="absolute top-0 left-0 bg-gray-800 text-white text-sm px-4 py-2 rounded-br-lg">
        Views: {views}
      </div>

      {showThumbnailBar && (
        <div className="absolute bottom-16 left-0 right-0 bg-gray-800 p-2 flex items-center justify-center">
          {isThumbnailLoading ? (
            <div className="flex items-center">
              <svg 
                className="animate-spin h-5 w-5 mr-3 text-white" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                ></circle>
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-white">Generating thumbnails...</span>
            </div>
          ) : thumbnails.length > 0 ? (
            <div className="flex overflow-x-auto">
              {thumbnails.map((thumbnail, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 mr-2 cursor-pointer"
                  onClick={() => videoRef.current && (videoRef.current.currentTime = thumbnail.time)}
                >
                  <img src={thumbnail.image} alt={`Thumbnail ${index}`} className="w-24 h-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-white">Unable to generate thumbnails</div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
