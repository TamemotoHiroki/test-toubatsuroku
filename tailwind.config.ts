import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ▼ ここから追加 ▼
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-6px)" },
          "40%, 80%": { transform: "translateX(6px)" },
        },
        flash: {
          "0%, 100%": { filter: "brightness(1) invert(0)" },
          "50%": { filter: "brightness(2) invert(1)" }, // 一瞬白黒反転してフラッシュ
        },
        blinkFade: {
          "0%": {
            opacity: "1",
            filter: "brightness(1) sepia(0) hue-rotate(0deg)",
          },
          "20%": {
            opacity: "0",
            filter: "brightness(1.5) sepia(1) hue-rotate(-50deg) saturate(5)",
          }, // 赤く光る
          "40%": {
            opacity: "1",
            filter: "brightness(1.5) sepia(1) hue-rotate(-50deg) saturate(5)",
          },
          "60%": {
            opacity: "0",
            filter: "brightness(1.5) sepia(1) hue-rotate(-50deg) saturate(5)",
          },
          "80%": {
            opacity: "1",
            filter: "brightness(1.5) sepia(1) hue-rotate(-50deg) saturate(5)",
          },
          "100%": {
            opacity: "0",
            filter: "brightness(1.5) sepia(1) hue-rotate(-50deg) saturate(5)",
          },
        },
      },
      animation: {
        shake: "shake 0.25s ease-in-out",
        flash: "flash 0.15s ease-in-out",
        blinkFade: "blinkFade 0.8s forwards", // forwardsで消えた状態を維持
      },
      // ▲ ここまで追加 ▲
    },
  },
  plugins: [],
};
export default config;
