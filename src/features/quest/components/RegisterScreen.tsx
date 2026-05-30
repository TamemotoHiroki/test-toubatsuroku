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
      { id: crypto.randomUUID(), title: trimmedTitle, isDone: false },
    ]);
    setTaskTitle("");
  };

  const handleTaskKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTask();
    }
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
      <RetroWindow title="ふっかつのじゅもん（科目登録）">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 科目名 */}
          <div>
            <label className="block mb-1 text-xs opacity-60">科目のなまえ</label>
            <RetroInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 微積分"
              required
            />
          </div>

          {/* 日付 */}
          <div>
            <label className="block mb-1 text-xs opacity-60">決戦の日</label>
            <RetroInput
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* 重要度 */}
          <div>
            <label className="block mb-1 text-xs opacity-60">重要度 (1〜5)</label>
            <RetroSelect
              value={importance}
              onChange={(e) => setImportance(e.target.value)}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n} className="bg-black text-white">
                  {"★".repeat(n)}{"☆".repeat(5 - n)}　{n}
                </option>
              ))}
            </RetroSelect>
          </div>

          {/* タスク追加 */}
          <div className="border-t border-white/20 pt-4 space-y-3">
            <p className="text-xs opacity-60">タスクを追加（Enter または「追加」）</p>
            <div className="flex gap-2">
              <RetroInput
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                onKeyDown={handleTaskKeyDown}
                placeholder="例: 微分の練習問題"
              />
              <RetroButton type="button" onClick={addTask}>
                追加
              </RetroButton>
            </div>

            {tasks.length === 0 ? (
              <p className="text-xs opacity-40 py-2 text-center border border-white/10">
                まだタスクがありません
              </p>
            ) : (
              <div className="space-y-1">
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 border-l-2 border-[#ffd700] pl-3 py-1 pr-2"
                  >
                    <span className="text-xs opacity-40 shrink-0 w-5 text-right">
                      {index + 1}.
                    </span>
                    <span className="flex-1 text-sm">{task.title}</span>
                    <button
                      type="button"
                      onClick={() => removeTask(task.id)}
                      className="text-xs opacity-40 hover:opacity-100 hover:text-[#ff0000] transition-colors shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 送信 */}
          <div className="flex gap-3 pt-1 border-t border-white/20">
            <RetroButton type="submit" disabled={!title || !date || tasks.length === 0}>
              登録する
            </RetroButton>
            <RetroButton type="button" onClick={onBack}>
              もどる
            </RetroButton>
          </div>
        </form>
      </RetroWindow>
    </div>
  );
};
