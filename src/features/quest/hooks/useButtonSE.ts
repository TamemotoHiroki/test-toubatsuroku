import { useRef, useEffect } from "react";

export const useButtonSE = () => {
  const seRef = useRef<{ decide: HTMLAudioElement; cancel: HTMLAudioElement } | null>(null);

  useEffect(() => {
    seRef.current = {
      decide: new Audio("/se/decide.wav"),
      cancel: new Audio("/se/cancel.wav"),
    };
  }, []);

  const playDecide = () => {
    const audio = seRef.current?.decide;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };

  const playCancel = () => {
    const audio = seRef.current?.cancel;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };

  return { playDecide, playCancel };
};
