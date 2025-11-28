import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for audio playback
 * @param {string} url - Audio file URL
 * @returns {object} Audio state and methods
 */
export const useAudio = (url) => {
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(url);

    const audio = audioRef.current;

    const setAudioData = () => {
      setDuration(audio.duration);
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', () => setPlaying(false));

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', () => setPlaying(false));
      audio.pause();
    };
  }, [url]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const play = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
    }
  };

  const toggle = () => {
    playing ? pause() : play();
  };

  const seek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const changeVolume = (newVolume) => {
    setVolume(Math.max(0, Math.min(1, newVolume)));
  };

  return {
    playing,
    duration,
    currentTime,
    volume,
    play,
    pause,
    toggle,
    seek,
    changeVolume
  };
};

export default useAudio;