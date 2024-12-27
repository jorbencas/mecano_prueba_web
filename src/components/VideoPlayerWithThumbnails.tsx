import React, { useRef, useState, useEffect, MouseEvent } from "react";
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand } from "react-icons/fa";

interface Thumbnail {
  time: number;
  image: string;
}

interface VideoPlayerProps {
  src: string;
  poster?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [hoverTime, setHoverTime] = useState(0);
  const [hoverThumbnail, setHoverThumbnail] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('loadedmetadata', generateThumbnails);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('loadedmetadata', generateThumbnails);
    };
  }, []);

  const generateThumbnails = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      console.error('Canvas context not available');
      return;
    }

    const frameCount = 10;
    const interval = video.duration / frameCount;
    const tempThumbnails: Thumbnail[] = [];

    const captureFrame = (index: number) => {
      if (index >= frameCount) {
        setThumbnails(tempThumbnails);
        return;
      }

      const currentTime = interval * index;
      video.currentTime = currentTime;

      video.onseeked = () => {
        try {
          canvas.width = video.videoWidth / 4;
          canvas.height = video.videoHeight / 4;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnailData = canvas.toDataURL('image/png');
          tempThumbnails.push({ time: currentTime, image: thumbnailData });
          captureFrame(index + 1);
        } catch (error) {
          console.error('Error capturing frame:', error);
          captureFrame(index + 1);
        }
      };
    };

    captureFrame(0);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) videoRef.current.volume = newVolume;
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

    const closestThumbnail = thumbnails.reduce((prev, curr) =>
      Math.abs(curr.time - time) < Math.abs(prev.time - time) ? curr : prev
    );
    setHoverThumbnail(closestThumbnail.image);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full"
        onClick={togglePlay}
      />
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
            <button onClick={() => setVolume(v => v === 0 ? 1 : 0)} className="mr-2">
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
          <button onClick={() => videoRef.current?.requestFullscreen()} className="text-xl">
            <FaExpand />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
