// src/features/quest/components/RetroUI.tsx
import React from "react";
import { clsx } from "clsx";

export const RetroWindow = ({
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) => (
  <div
    className={clsx(
      "border-4 border-white p-4 bg-black text-white font-mono",
      className,
    )}
  >
    {title && (
      <div
        className="-mx-4 -mt-4 mb-4 px-4 py-2 border-b-2 border-white/40 text-sm"
        style={{ color: "#ffd700" }}
      >
        {title}
      </div>
    )}
    {children}
  </div>
);

export const RetroButton = ({
  children,
  onClick,
  type = "button",
  className,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={clsx(
      "flex items-center w-full px-3 py-2 font-mono text-left",
      "bg-black text-white border-2 border-white",
      "hover:bg-[#ffd700] hover:text-black hover:border-[#ffd700]",
      "active:scale-95 transition-all group",
      "disabled:opacity-40 disabled:cursor-not-allowed",
      className,
    )}
  >
    <span className="mr-2 shrink-0 invisible group-hover:visible">▶</span>
    {children}
  </button>
);

export const RetroInput = (
  props: React.InputHTMLAttributes<HTMLInputElement>,
) => (
  <input
    {...props}
    className={clsx(
      "w-full border-2 border-white p-2 font-mono bg-black text-white",
      "focus:outline-none focus:border-[#ffd700]",
      "placeholder:opacity-40",
      props.className,
    )}
  />
);

export const RetroSelect = (
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) => (
  <select
    {...props}
    className={clsx(
      "w-full border-2 border-white p-2 font-mono bg-black text-white",
      "focus:outline-none focus:border-[#ffd700]",
      props.className,
    )}
  >
    {props.children}
  </select>
);

export const RetroHpBar = ({
  current,
  max,
  label = "HP",
}: {
  current: number;
  max: number;
  label?: string;
}) => {
  const pct = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;
  const barColor = pct > 0.5 ? "#00ff00" : pct > 0.25 ? "#ffd700" : "#ff0000";

  return (
    <div className="font-mono space-y-1">
      <div className="flex justify-between text-sm">
        <span className="opacity-70">{label}</span>
        <span style={{ color: barColor }}>
          {current} / {max}
        </span>
      </div>
      <div className="w-full h-4 border-2 border-white bg-black">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${pct * 100}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
};
