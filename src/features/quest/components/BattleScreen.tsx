// src/features/quest/components/BattleScreen.tsx
import React, { useState } from "react";
import { Subject } from "../types";
import { RetroWindow, RetroButton, RetroInput } from "./RetroUI";

interface Props {
  subject: Subject;
  onAttack: (subjectId: string, minutes: number, tasks: number) => { damage: number; isDefeated: boolean };
  onCompleteTask: (subjectId: string, taskId: string) => { damage: number; isDefeated: boolean };
  onBack: () => void;
}

export const BattleScreen = ({ subject, onAttack, onCompleteTask, onBack }: Props) => {
  const [isAttacking, setIsAttacking] = useState(false);
  const [isDefeated, setIsDefeated] = useState(false);
  const [minutes, setMinutes] = useState<string>("");
  const [turnCompletedTasks, setTurnCompletedTasks] = useState(0);
  const [message, setMessage] = useState<string>(
    `${subject.title} が あらわれた！`,
  );

  const maxHp = subject.tasks.length * 100;

  const handleAttackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const min = parseInt(minutes, 10) || 0;

    if (min <= 0) return;

    const result = onAttack(subject.id, min, 0);
    const { damage, isDefeated: defeated } = result;

    if (defeated) {
      setMessage(
        `${subject.title} を たおした！\n+${min} EXP を獲得した！`,
      );
      setIsDefeated(true);
    } else {
      if (damage > 0) {
        setMessage(
          `ゆうしゃ の こうげき！\n${subject.title} に ${damage} の ダメージ！`,
        );
      }
    }
    setIsAttacking(false);
    setMinutes("");
    setTurnCompletedTasks(0);
  };

  const handleToggleTask = (taskId: string, taskTitle: string) => {
    const result = onCompleteTask(subject.id, taskId);
    if (result.damage <= 0) return;

    const nextTurnCompletedTasks = turnCompletedTasks + 1;
    setTurnCompletedTasks(nextTurnCompletedTasks);
    const damageText = `${nextTurnCompletedTasks * 100} の ダメージ！`;

    if (result.isDefeated) {
      setMessage(`${subject.title} を たおした！\n${subject.title} に ${damageText}`);
      setIsDefeated(true);
    } else {
      setMessage(`ゆうしゃ の こうげき！\n${subject.title} に ${damageText}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr] items-start">
        <RetroWindow className="flex flex-col gap-2">
          <p>{subject.title}</p>
          <p>決戦: {subject.exam_date}</p>
          <p>HP: {subject.current_hp}/{maxHp}</p>
        </RetroWindow>

        <RetroWindow className="flex items-center justify-center min-h-[220px]">
          {!isDefeated && subject.imageUrl && (
            <img
              src={subject.imageUrl}
              alt={subject.title}
              className="h-48 w-48 object-contain"
            />
          )}
        </RetroWindow>
      </div>

      {isAttacking ? (
        <RetroWindow>
          <form onSubmit={handleAttackSubmit} className="space-y-4">
            <p className="text-lg">攻撃画面</p>
            <p>どれだけ修行した？</p>
            <div>
              <label className="block mb-1 text-sm">勉強時間（分）</label>
              <RetroInput
                type="number"
                value={minutes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setMinutes(e.target.value)
                }
                min="0"
                required
              />
            </div>
            <div className="space-y-2 border-t border-white/30 pt-3">
              <p className="text-sm">タスク一覧</p>
              {subject.tasks.length === 0 ? (
                <p className="text-sm opacity-80">タスクがない</p>
              ) : (
                <div className="space-y-1 text-sm">
                  {subject.tasks.map((task) => (
                    <label
                      key={task.id}
                      className={`flex items-center gap-3 rounded border border-white/20 px-2 py-1 cursor-pointer ${task.isDone ? "opacity-70" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={task.isDone}
                        disabled={task.isDone || isDefeated}
                        onChange={() => handleToggleTask(task.id, task.title)}
                        className="h-4 w-4"
                      />
                      <span className={task.isDone ? "line-through" : ""}>
                        {task.title}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <RetroButton type="button" onClick={() => setIsAttacking(false)}>
                やめる
              </RetroButton>
              <RetroButton type="submit">きめる</RetroButton>
            </div>
          </form>
        </RetroWindow>
      ) : (
        <div className="flex gap-4">
          <RetroWindow className="w-2/3 whitespace-pre-wrap">
            {message}
          </RetroWindow>

          <RetroWindow className="flex flex-col gap-2 w-1/3">
            {isDefeated ? (
              <RetroButton onClick={onBack}>つづける</RetroButton>
            ) : (
              <>
                <RetroButton
                  onClick={() => {
                    setTurnCompletedTasks(0);
                    setIsAttacking(true);
                  }}
                >
                  たたかう
                </RetroButton>
                <RetroButton onClick={onBack}>にげる</RetroButton>
              </>
            )}
          </RetroWindow>
        </div>
      )}
    </div>
  );
};
