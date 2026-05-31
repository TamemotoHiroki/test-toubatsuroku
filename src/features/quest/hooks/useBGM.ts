import { useEffect } from "react";

// モジュールレベルのシングルトン: 常に1つのBGMのみ再生
let activeBGM: HTMLAudioElement | null = null;
let pendingUnlock: (() => void) | null = null;

const stopActiveBGM = () => {
  if (activeBGM) {
    activeBGM.pause();
    activeBGM.currentTime = 0;
    activeBGM = null;
  }
  if (pendingUnlock) {
    document.removeEventListener("click", pendingUnlock);
    document.removeEventListener("keydown", pendingUnlock);
    pendingUnlock = null;
  }
};

export const useBGM = (src: string | null, volume = 0.5) => {
  useEffect(() => {
    // 既存のBGM・unlock待ちを完全に停止してからスタート
    stopActiveBGM();

    if (!src) return;

    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = volume;
    activeBGM = audio;

    const unlock = () => {
      audio.play().catch(() => {});
      pendingUnlock = null;
    };

    audio.play().catch(() => {
      // Autoplay Policy でブロックされたら最初のユーザー操作で再生
      pendingUnlock = unlock;
      document.addEventListener("click", unlock, { once: true });
      document.addEventListener("keydown", unlock, { once: true });
    });

    return stopActiveBGM;
  }, [src]);
};
