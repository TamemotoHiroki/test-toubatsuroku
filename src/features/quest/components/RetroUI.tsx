// src/features/quest/components/RetroUI.tsx
import React from "react";
import { clsx } from "clsx";

export const RetroWindow = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={clsx(
      "border-4 border-white p-4 font-mono bg-black text-white",
      className,
    )}
  >
    {children}
  </div>
);

export const RetroButton = ({
  children,
  onClick,
  type = "button",
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}) => (
  <button
    type={type}
    onClick={onClick}
    className={clsx(
      "flex items-center w-full px-2 py-1 font-mono text-left bg-black text-white hover:bg-white hover:text-black transition-colors group",
      className,
    )}
  >
    <span className="mr-2 invisible group-hover:visible">▶</span>
    {children}
  </button>
);

export const RetroInput = (
  props: React.InputHTMLAttributes<HTMLInputElement>,
) => (
  <input
    {...props}
    className={clsx(
      "w-full border-2 border-white p-2 font-mono bg-black text-white focus:outline-none focus:border-gray-400",
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
      "w-full border-2 border-white p-2 font-mono bg-black text-white focus:outline-none focus:border-gray-400",
      props.className,
    )}
  >
    {props.children}
  </select>
);
