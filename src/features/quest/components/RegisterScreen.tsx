// src/features/quest/components/RegisterScreen.tsx
import React, { useState } from "react";
import { Subject } from "../types";
import { RetroWindow, RetroButton, RetroInput, RetroSelect } from "./RetroUI";

interface Props {
  onRegister: (subject: Omit<Subject, "id" | "current_hp">) => void;
  onBack: () => void;
}

export const RegisterScreen = ({ onRegister, onBack }: Props) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [tasks, setTasks] = useState("5");
  const [importance, setImportance] = useState("3");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !tasks) return;

    onRegister({
      title,
      exam_date: date,
      total_tasks: parseInt(tasks, 10),
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
          <div>
            <label className="block mb-1 text-sm">総タスク数</label>
            <RetroInput
              type="number"
              value={tasks}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTasks(e.target.value)
              }
              min="1"
              required
            />
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
