// src/features/quest/hooks/useQuestLogic.ts
import { useState, useMemo, useEffect, useRef } from "react";
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

interface StoredState {
  version: number;
  subjects: Subject[];
  player: Player;
  currentScreen: ScreenType;
  selectedSubjectId: string | null;
  isCleared: boolean;
  defeatedSubjects: Array<{
    id: string;
    title: string;
    exam_date: string;
    study_minutes: number;
    tasks_cleared: number;
  }>;
}

export const useQuestLogic = () => {
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [player, setPlayer] = useState<Player>({ level: 1, exp: 0 });
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("home");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null,
  );
  const [isCleared, setIsCleared] = useState<boolean>(false);
  const [defeatedSubjects, setDefeatedSubjects] = useState<
    Array<{
      id: string;
      title: string;
      exam_date: string;
      study_minutes: number;
      tasks_cleared: number;
    }>
  >([]);

  // Persistence settings
  const STORAGE_KEY = "quest_state_v1";
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<StoredState>;
      if (parsed?.version === 1) {
        if (Array.isArray(parsed.subjects)) setSubjects(parsed.subjects);
        if (parsed.player) setPlayer(parsed.player);
        if (parsed.currentScreen) setCurrentScreen(parsed.currentScreen);
        if (parsed.selectedSubjectId !== undefined)
          setSelectedSubjectId(parsed.selectedSubjectId);
        if (typeof parsed.isCleared === "boolean")
          setIsCleared(parsed.isCleared);
        if (Array.isArray(parsed.defeatedSubjects))
          setDefeatedSubjects(parsed.defeatedSubjects);
      }
    } catch (e) {
      // Ignore parse errors
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const scheduleSave = () => {
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current);
      }
      saveTimer.current = window.setTimeout(() => {
        const payload: StoredState = {
          version: 1,
          subjects,
          player,
          currentScreen,
          selectedSubjectId,
          isCleared,
          defeatedSubjects,
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch (e) {
          // ignore quota errors
        }
      }, 500);
    };

    scheduleSave();

    return () => {
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
    };
  }, [
    subjects,
    player,
    currentScreen,
    selectedSubjectId,
    isCleared,
    defeatedSubjects,
  ]);

  // 不正画面遷移のガード
  useEffect(() => {
    if (currentScreen === "battle" && !selectedSubjectId) {
      setCurrentScreen("home");
    }
  }, [currentScreen, selectedSubjectId]);

  const totalBossHp = useMemo(() => {
    return subjects.reduce((acc, curr) => acc + curr.current_hp, 0);
  }, [subjects]);

  const maxBossHp = useMemo(() => {
    return subjects.reduce((acc, curr) => acc + curr.total_tasks * 100, 0);
  }, [subjects]);

  const selectedSubject = useMemo(() => {
    return subjects.find((s) => s.id === selectedSubjectId);
  }, [subjects, selectedSubjectId]);

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
    if (studyMinutes <= 0 && tasksCleared <= 0)
      return { damage: 0, isDefeated: false };

    const damage = tasksCleared * 100;
    const targetSubject = subjects.find((s) => s.id === subjectId);
    const newHp = targetSubject
      ? Math.max(0, targetSubject.current_hp - damage)
      : 0;
    const isDefeated = newHp <= 0 && !!targetSubject;

    setSubjects((prev) =>
      prev.map((sub) =>
        sub.id === subjectId ? { ...sub, current_hp: newHp } : sub,
      ),
    );

    if (isDefeated && targetSubject) {
      setDefeatedSubjects((prev) => [
        ...prev,
        {
          id: targetSubject.id,
          title: targetSubject.title,
          exam_date: targetSubject.exam_date,
          study_minutes: studyMinutes,
          tasks_cleared: tasksCleared,
        },
      ]);
    }

    setPlayer((prev) => {
      const newExp = prev.exp + studyMinutes;
      const newLevel = Math.floor(newExp / 100) + 1;
      return { level: newLevel, exp: newExp };
    });

    return { damage, isDefeated };
  };

  const navigateTo = (screen: ScreenType, subjectId?: string) => {
    setCurrentScreen(screen);
    if (subjectId) {
      setSelectedSubjectId(subjectId);
    } else if (screen === "home") {
      setSubjects((prev) => {
        const remaining = prev.filter((s) => s.current_hp > 0);
        if (prev.length > 0 && remaining.length === 0) {
          setIsCleared(true);
        }
        return remaining;
      });
      setSelectedSubjectId(null);
    }
  };

  const resetQuest = () => {
    setSubjects([]);
    setIsCleared(false);
    setCurrentScreen("home");
    setSelectedSubjectId(null);
  };

  const hasAllBossesDefeated = () => {
    return isCleared;
  };

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
    hasAllBossesDefeated,
    defeatedSubjects,
    resetQuest,
  };
};
