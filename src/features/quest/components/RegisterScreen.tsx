// src/features/quest/components/RegisterScreen.tsx
import React, { useState } from "react";
import { Subject, Task } from "../types";
import { RetroWindow, RetroButton, RetroInput, RetroSelect } from "./RetroUI";

interface Props {
  onRegister: (subject: Omit<Subject, "id" | "current_hp">) => void;
  onBack: () => void;
}

export const RegisterScreen = ({ onRegister, onBack }: Props) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [importance, setImportance] = useState("3");
  const [taskTitle, setTaskTitle] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = () => {
    const trimmedTitle = taskTitle.trim();
    if (!trimmedTitle) return;

    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: trimmedTitle,
        isDone: false,
      },
    ]);
    setTaskTitle("");
  };

  const removeTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || tasks.length === 0) return;

    onRegister({
      title,
      exam_date: date,
      tasks,
      importance: parseInt(importance, 10),
    });
  };

  return (
    <div className="space-y-4">
      <RetroWindow>
        <h2 className="mb-4 text-lg">ふっかつのじゅもん（科目登録）</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm">科目のなまえ</label>
            <RetroInput
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTitle(e.target.value)
              }
              placeholder="例: 微積分"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">決戦の日</label>
            <RetroInput
              type="date"
              value={date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDate(e.target.value)
              }
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">重要度 (1-5)</label>
            <RetroSelect
              value={importance}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setImportance(e.target.value)
              }
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n} className="bg-black text-white">
                  {n}
                </option>
              ))}
            </RetroSelect>
          </div>

          <div className="space-y-3 pt-2 border-t border-white/30">
            <label className="block mb-1 text-sm">タスクを追加</label>
            <div className="flex gap-2">
              <RetroInput
                value={taskTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTaskTitle(e.target.value)
                }
                placeholder="例: 微分の練習問題 1"
              />
              <RetroButton type="button" onClick={addTask}>
                追加
              </RetroButton>
            </div>

            <div className="space-y-2">
              {tasks.length === 0 ? (
                <p className="text-sm opacity-80">まだタスクがない。1件以上追加してから登録する。</p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-3 border border-white/30 px-3 py-2"
                  >
                    <span>{task.title}</span>
                    <RetroButton type="button" onClick={() => removeTask(task.id)}>
                      削除
                    </RetroButton>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <RetroButton type="submit">登録する</RetroButton>
            <RetroButton type="button" onClick={onBack}>
              もどる
            </RetroButton>
          </div>
        </form>
      </RetroWindow>
    </div>
  );
};
