// src/features/quest/types/index.ts
export interface Subject {
  id: string;
  title: string;
  exam_date: string;
  total_tasks: number;
  current_hp: number;
  importance: number;
}

export interface Player {
  level: number;
  exp: number;
}

export type ScreenType = "home" | "battle" | "register";
