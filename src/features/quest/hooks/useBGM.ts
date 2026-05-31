import { useEffect } from "react";

export const useBGM = (src: string | null, volume = 0.5) => {
  useEffect(() => {
    if (!src) return;

    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = volume;

    const unlock = () => {
      audio.play().catch(() => {});
    };

    // 即時再生を試みる。Autoplay Policy でブロックされたら
    // 最初のユーザー操作で再生する
    audio.play().catch(() => {
      document.addEventListener("click", unlock, { once: true });
      document.addEventListener("keydown", unlock, { once: true });
    });

    return () => {
      audio.pause();
      audio.currentTime = 0;
      document.removeEventListener("click", unlock);
      document.removeEventListener("keydown", unlock);
    };
  }, [src]);
};
