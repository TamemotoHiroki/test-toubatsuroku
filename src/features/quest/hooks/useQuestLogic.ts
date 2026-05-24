// src/features/quest/hooks/useQuestLogic.ts
import { useState, useMemo } from "react";
import { Subject, Player, ScreenType } from "../types";

const INITIAL_SUBJECTS: Subject[] = [
  {
    id: "1",
    title: "微積分",
    exam_date: "2026-06-10",
    total_tasks: 5,
    current_hp: 500,
    importance: 4,
  },
  {
    id: "2",
    title: "量子力学",
    exam_date: "2026-06-15",
    total_tasks: 8,
    current_hp: 800,
    importance: 5,
  },
];

export const useQuestLogic = () => {
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [player, setPlayer] = useState<Player>({ level: 1, exp: 0 });
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("home");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null,
  );

  const totalBossHp = useMemo(() => {
    return subjects.reduce((acc, curr) => acc + curr.current_hp, 0);
  }, [subjects]);

  const maxBossHp = useMemo(() => {
    return subjects.reduce((acc, curr) => acc + curr.total_tasks * 100, 0);
  }, [subjects]);

  const addSubject = (subject: Omit<Subject, "id" | "current_hp">) => {
    const newSubject: Subject = {
      ...subject,
      id: crypto.randomUUID(),
      current_hp: subject.total_tasks * 100,
    };
    setSubjects((prev) => [...prev, newSubject]);
    setCurrentScreen("home");
  };

  const attack = (
    subjectId: string,
    studyMinutes: number,
    tasksCleared: number,
  ) => {
    if (studyMinutes <= 0 && tasksCleared <= 0) return 0;

    const damage = tasksCleared * 100;

    setSubjects((prev) =>
      prev.map((sub) =>
        sub.id === subjectId
          ? { ...sub, current_hp: Math.max(0, sub.current_hp - damage) }
          : sub,
      ),
    );

    setPlayer((prev) => {
      const newExp = prev.exp + studyMinutes;
      const newLevel = Math.floor(newExp / 100) + 1;
      return { level: newLevel, exp: newExp };
    });

    return damage;
  };

  const navigateTo = (screen: ScreenType, subjectId?: string) => {
    setCurrentScreen(screen);
    if (subjectId) {
      setSelectedSubjectId(subjectId);
    }
  };

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  return {
    subjects,
    player,
    currentScreen,
    totalBossHp,
    maxBossHp,
    selectedSubject,
    addSubject,
    attack,
    navigateTo,
  };
};
