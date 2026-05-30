import { useState, useMemo, useEffect, useRef } from "react";
import { Subject, Player, ScreenType, DefeatedSubject, Task } from "../types";

const STORAGE_KEY = "quest_state_v1";

const createTask = (title: string, isDone = false): Task => ({
  id: crypto.randomUUID(),
  title,
  isDone,
});

const normalizeSubject = (subject: any): Subject => {
  if (Array.isArray(subject?.tasks)) {
    const tasks = subject.tasks.map((task: any, index: number) => ({
      id: typeof task?.id === "string" ? task.id : `${subject.id ?? "subject"}-task-${index}`,
      title:
        typeof task?.title === "string" && task.title.trim().length > 0
          ? task.title
          : `タスク ${index + 1}`,
      isDone: Boolean(task?.isDone),
    }));

    return {
      id: String(subject.id ?? crypto.randomUUID()),
      title: String(subject.title ?? "未設定の科目"),
      exam_date: String(subject.exam_date ?? ""),
      tasks,
      current_hp:
        typeof subject.current_hp === "number"
          ? subject.current_hp
          : tasks.filter((task) => !task.isDone).length * 100,
      importance: Number.isFinite(subject.importance)
        ? Number(subject.importance)
        : 3,
      imageUrl: subject.imageUrl,
    };
  }

  const totalTasks = Math.max(0, Number(subject?.total_tasks ?? 0));
  const currentHp = Number(subject?.current_hp ?? totalTasks * 100);
  const completedCount = Math.max(
    0,
    Math.min(totalTasks, totalTasks - Math.round(currentHp / 100)),
  );

  return {
    id: String(subject.id ?? crypto.randomUUID()),
    title: String(subject.title ?? "未設定の科目"),
    exam_date: String(subject.exam_date ?? ""),
    tasks: Array.from({ length: totalTasks }, (_, index) =>
      createTask(`タスク ${index + 1}`, index < completedCount),
    ),
    current_hp: currentHp,
    importance: Number.isFinite(subject.importance)
      ? Number(subject.importance)
      : 3,
    imageUrl: subject.imageUrl,
  };
};

const normalizeSubjects = (subjects: unknown): Subject[] => {
  if (!Array.isArray(subjects)) return [];
  return subjects.map((subject) => normalizeSubject(subject));
};

const uniqueDefeatedSubjects = (items: unknown): DefeatedSubject[] => {
  if (!Array.isArray(items)) return [];

  const map = new Map<string, DefeatedSubject>();
  items.forEach((item) => {
    if (!item || typeof item !== "object") return;
    const value = item as DefeatedSubject;
    if (typeof value.id !== "string") return;
    map.set(value.id, value);
  });

  return Array.from(map.values());
};

const INITIAL_SUBJECTS: Subject[] = [
  {
    id: "1",
    title: "微積分",
    exam_date: "2026-06-10",
    tasks: [
      createTask("極限の基本問題を解く"),
      createTask("微分の計算練習"),
      createTask("積分の計算練習"),
    ],
    current_hp: 300,
    importance: 4,
    imageUrl: "/monsters/1.png",
  },
  {
    id: "2",
    title: "量子力学",
    exam_date: "2026-06-15",
    tasks: [
      createTask("波動関数の概念を復習する"),
      createTask("シュレーディンガー方程式を確認する"),
      createTask("不確定性原理をまとめる"),
      createTask("演算子と期待値の計算練習"),
      createTask("過去問を1問解く"),
    ],
    current_hp: 500,
    importance: 5,
    imageUrl: "/monsters/2.png",
  },
];

interface StoredState {
  version: number;
  subjects: Subject[];
  player: Player;
  currentScreen: ScreenType;
  selectedSubjectId: string | null;
  isCleared: boolean;
  defeatedSubjects: DefeatedSubject[];
}

export const useQuestLogic = () => {
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [player, setPlayer] = useState<Player>({ level: 1, exp: 0 });
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("home");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [isCleared, setIsCleared] = useState<boolean>(false);
  const [defeatedSubjects, setDefeatedSubjects] = useState<DefeatedSubject[]>([]);

  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<StoredState>;
      if (parsed?.version === 1) {
        if (Array.isArray(parsed.subjects)) setSubjects(normalizeSubjects(parsed.subjects));
        if (parsed.player) setPlayer(parsed.player);
        if (parsed.currentScreen) setCurrentScreen(parsed.currentScreen);
        if (parsed.selectedSubjectId !== undefined)
          setSelectedSubjectId(parsed.selectedSubjectId);
        if (typeof parsed.isCleared === "boolean") setIsCleared(parsed.isCleared);
        if (Array.isArray(parsed.defeatedSubjects))
          setDefeatedSubjects(uniqueDefeatedSubjects(parsed.defeatedSubjects));
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const scheduleSave = () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
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
        } catch {
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
  }, [subjects, player, currentScreen, selectedSubjectId, isCleared, defeatedSubjects]);

  // 不正画面遷移のガード
  useEffect(() => {
    if (currentScreen === "battle" && !selectedSubjectId) {
      setCurrentScreen("home");
    }
  }, [currentScreen, selectedSubjectId]);

  const totalBossHp = useMemo(
    () => subjects.reduce((acc, curr) => acc + curr.current_hp, 0),
    [subjects],
  );

  const maxBossHp = useMemo(
    () => subjects.reduce((acc, curr) => acc + curr.tasks.length * 100, 0),
    [subjects],
  );

  const selectedSubject = useMemo(
    () => subjects.find((s) => s.id === selectedSubjectId),
    [subjects, selectedSubjectId],
  );

  const addSubject = (subject: Omit<Subject, "id" | "current_hp">) => {
    const monsterImages = [
      "/monsters/0.png",
      "/monsters/1.png",
      "/monsters/2.png",
      "/monsters/3.png",
      "/monsters/4.png",
    ];
    const randomImage = monsterImages[Math.floor(Math.random() * monsterImages.length)];
    const newSubject: Subject = {
      ...subject,
      id: crypto.randomUUID(),
      current_hp: subject.tasks.length * 100,
      imageUrl: randomImage,
    };
    setSubjects((prev) => [...prev, newSubject]);
    setCurrentScreen("home");
  };

  const completeTask = (subjectId: string, taskId: string) => {
    const targetSubject = subjects.find((subject) => subject.id === subjectId);
    const targetTask = targetSubject?.tasks.find((task) => task.id === taskId);

    if (!targetSubject || !targetTask || targetTask.isDone) {
      return { damage: 0, isDefeated: false };
    }

    setSubjects((prev) =>
      prev.map((subject) =>
        subject.id === subjectId
          ? {
              ...subject,
              tasks: subject.tasks.map((task) =>
                task.id === taskId ? { ...task, isDone: true } : task,
              ),
            }
          : subject,
      ),
    );

    return attack(subjectId, 0, 1);
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

    const clearedTasksAtDefeat = targetSubject
      ? Math.min(
          targetSubject.tasks.length,
          targetSubject.tasks.filter((task) => task.isDone).length + tasksCleared,
        )
      : 0;

    setSubjects((prev) =>
      prev.map((sub) =>
        sub.id === subjectId ? { ...sub, current_hp: newHp } : sub,
      ),
    );

    if (isDefeated && targetSubject) {
      setDefeatedSubjects((prev) =>
        uniqueDefeatedSubjects([
          ...prev,
          {
            id: targetSubject.id,
            title: targetSubject.title,
            exam_date: targetSubject.exam_date,
            study_minutes: studyMinutes,
            tasks_cleared: clearedTasksAtDefeat,
          },
        ]),
      );

      // 全科目撃破判定：この攻撃後に残存HP > 0 のものがなければクリア
      const allDefeated = subjects
        .map((s) => (s.id === subjectId ? { ...s, current_hp: newHp } : s))
        .every((s) => s.current_hp <= 0);
      if (allDefeated) setIsCleared(true);
    }

    setPlayer((prev) => {
      const newExp = prev.exp + studyMinutes;
      return { level: Math.floor(newExp / 100) + 1, exp: newExp };
    });

    return { damage, isDefeated };
  };

  const navigateTo = (screen: ScreenType, subjectId?: string) => {
    setCurrentScreen(screen);
    if (subjectId) {
      setSelectedSubjectId(subjectId);
    } else {
      setSelectedSubjectId(null);
      if (screen === "home") {
        setSubjects((prev) => prev.filter((s) => s.current_hp > 0 || s.tasks.length === 0));
      }
    }
  };

  const resetQuest = () => {
    setSubjects([]);
    setDefeatedSubjects([]);
    setIsCleared(false);
    setCurrentScreen("home");
    setSelectedSubjectId(null);
  };

  return {
    subjects,
    player,
    currentScreen,
    isCleared,
    totalBossHp,
    maxBossHp,
    selectedSubject,
    addSubject,
    completeTask,
    attack,
    navigateTo,
    defeatedSubjects,
    resetQuest,
  };
};
