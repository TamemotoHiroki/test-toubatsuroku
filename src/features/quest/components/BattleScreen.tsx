// src/features/quest/components/BattleScreen.tsx
import React, { useState } from "react";
import { Subject } from "../types";
import { RetroWindow, RetroButton, RetroInput, RetroHpBar } from "./RetroUI";

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
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<string>(
    `${subject.title} が あらわれた！`,
  );

  const maxHp = subject.tasks.length * 100;

  const handleAttackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const min = parseInt(minutes, 10) || 0;

    // チェックされたタスク数
    const tasksToComplete = Array.from(selectedTasks);

    // タスクを先に完了状態にする
    for (const taskId of tasksToComplete) {
      onCompleteTask(subject.id, taskId);
    }

    // 勉強時間のみで攻撃
    if (min > 0) {
      const result = onAttack(subject.id, min, tasksToComplete.length);
      const { damage, isDefeated: defeated } = result;

      if (defeated) {
        setMessage(
          `${subject.title} を たおした！\n+${min} EXP を獲得した！`,
        );
        setIsDefeated(true);
      } else if (damage > 0) {
        setMessage(`ゆうしゃ の こうげき！\n${damage} の ダメージ！`);
      }
    } else if (tasksToComplete.length > 0) {
      // タスク完了のみの場合
      const result = onAttack(subject.id, 0, tasksToComplete.length);
      const { damage, isDefeated: defeated } = result;

      if (defeated) {
        setMessage(
          `${subject.title} を たおした！\n+${tasksToComplete.length * 100} ダメージ！`,
        );
        setIsDefeated(true);
      } else if (damage > 0) {
        setMessage(`ゆうしゃ の こうげき！\n${damage} の ダメージ！`);
      }
    }

    setIsAttacking(false);
    setMinutes("");
    setSelectedTasks(new Set());
    setTurnCompletedTasks(0);
  };

  const handleToggleTask = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  return (
    <div className="space-y-4">
      {/* 敵情報 */}
      <RetroWindow title={subject.title}>
        <p className="text-xs opacity-50 mb-3">決戦の日: {subject.exam_date}</p>
        <RetroHpBar current={subject.current_hp} max={maxHp} />
      </RetroWindow>

      {/* モンスター画像 */}
      <RetroWindow>
        <div className="flex items-center justify-center min-h-[220px]">
          {!isDefeated && subject.imageUrl ? (
            <img
              src={subject.imageUrl}
              alt={subject.title}
              className="h-64 w-64 object-contain"
              style={{ imageRendering: "pixelated" }}
            />
          ) : null}
        </div>
      </RetroWindow>

      {/* 攻撃フォーム or メッセージウィンドウ */}
      {isAttacking ? (
        <RetroWindow title="-- 攻撃画面 --">
          <form onSubmit={handleAttackSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-xs opacity-60">勉強時間（分）</label>
              <RetroInput
                type="number"
                value={minutes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setMinutes(e.target.value)
                }
                min="1"
                placeholder="0"
              />
            </div>

            <div className="border-t border-white/20 pt-3 space-y-1">
              <p className="text-xs opacity-60 mb-2">タスク一覧</p>
              {subject.tasks.length === 0 ? (
                <p className="text-xs opacity-40">タスクがない</p>
              ) : (
                subject.tasks.map((task) => (
                  <label
                    key={task.id}
                    className={`flex items-center gap-3 px-2 py-2 border border-white/20 cursor-pointer text-sm ${
                      task.isDone ? "opacity-40" : "hover:border-[#ffd700]/60"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTasks.has(task.id) || task.isDone}
                      disabled={task.isDone || isDefeated}
                      onChange={() => handleToggleTask(task.id)}
                      className="h-4 w-4 accent-[#ffd700] shrink-0"
                    />
                    <span className={task.isDone ? "line-through" : ""}>
                      {task.title}
                    </span>
                  </label>
                ))
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <RetroButton type="button" onClick={() => setIsAttacking(false)}>
                やめる
              </RetroButton>
              <RetroButton type="submit">きめる</RetroButton>
            </div>
          </form>
        </RetroWindow>
      ) : isDefeated ? (
        <div className="space-y-4">
          <RetroWindow className="min-h-[80px] whitespace-pre-wrap text-sm leading-relaxed">
            {message}
          </RetroWindow>
          <RetroButton onClick={onBack} className="w-full">
            つづける
          </RetroButton>
        </div>
      ) : (
        <div className="flex gap-4">
          {/* メッセージ */}
          <RetroWindow className="flex-1 min-h-[80px] whitespace-pre-wrap text-sm leading-relaxed">
            {message}
          </RetroWindow>

          {/* コマンド */}
          <div className="flex flex-col gap-2 w-28 shrink-0">
            <RetroButton
              onClick={() => {
                setTurnCompletedTasks(0);
                setIsAttacking(true);
              }}
            >
              たたかう
            </RetroButton>
            <RetroButton onClick={onBack}>にげる</RetroButton>
          </div>
        </div>
      )}
    </div>
  );
};
