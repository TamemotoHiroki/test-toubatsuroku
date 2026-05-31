import { useEffect } from "react";

// アプリ全体で1つのAudio要素のみ使用 → 物理的に重複不可
let bgmAudio: HTMLAudioElement | null = null;

const getAudio = (volume: number): HTMLAudioElement => {
  if (!bgmAudio) {
    bgmAudio = new Audio();
    bgmAudio.loop = true;
  }
  bgmAudio.volume = volume;
  return bgmAudio;
};

export const useBGM = (src: string | null, volume = 0.5) => {
  useEffect(() => {
    const audio = getAudio(volume);

    if (!src) {
      audio.pause();
      return;
    }

    // 既に同じsrcを再生中なら何もしない
    const nextSrc = new URL(src, window.location.href).href;
    if (audio.src === nextSrc && !audio.paused) return;

    // srcが変わった場合は切り替え
    if (audio.src !== nextSrc) {
      audio.pause();
      audio.src = src;
      audio.currentTime = 0;
    }

    const tryPlay = () => {
      audio.play().catch(() => {
        // Autoplay Policy でブロックされたら最初の操作で再生
        const unlock = () => {
          audio.play().catch(() => {});
          document.removeEventListener("keydown", unlock);
        };
        document.addEventListener("click", unlock, { once: true });
        document.addEventListener("keydown", unlock, { once: true });
      });
    };

    tryPlay();
  }, [src, volume]);
};
