// src/features/quest/types/index.ts
export interface Task {
  id: string;
  title: string;
  isDone: boolean;
}

export interface Subject {
  id: string;
  title: string;
  exam_date: string;
  tasks: Task[];
  current_hp: number;
  importance: number;
  imageUrl?: string;
}

export interface Player {
  level: number;
  exp: number;
}

export interface DefeatedSubject {
  id: string;
  title: string;
  exam_date: string;
  study_minutes: number;
  tasks_cleared: number;
}

export type ScreenType = "home" | "battle" | "register";
