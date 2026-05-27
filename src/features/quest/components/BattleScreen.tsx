// src/features/quest/components/BattleScreen.tsx
import React, { useState } from "react";
import { Subject } from "../types";
import { RetroWindow, RetroButton, RetroInput } from "./RetroUI";

interface Props {
  subject: Subject;
  onAttack: (subjectId: string, minutes: number, tasks: number) => { damage: number; isDefeated: boolean };
  onBack: () => void;
}

export const BattleScreen = ({ subject, onAttack, onBack }: Props) => {
  const [isAttacking, setIsAttacking] = useState(false);
  const [isDefeated, setIsDefeated] = useState(false);
  const [minutes, setMinutes] = useState<string>("");
  const [tasks, setTasks] = useState<string>("");
  const [message, setMessage] = useState<string>(
    `${subject.title} が あらわれた！`,
  );

  const handleAttackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const min = parseInt(minutes, 10) || 0;
    const tsk = parseInt(tasks, 10) || 0;

    if (min <= 0 && tsk <= 0) return;

    const result = onAttack(subject.id, min, tsk);
    const { damage, isDefeated: defeated } = result;

    if (defeated) {
      setMessage(
        `${subject.title} を たおした！\n+${min} EXP を獲得した！`,
      );
      setIsDefeated(true);
    } else {
      setMessage(
        `ゆうしゃ の こうげき！\n${subject.title} に ${damage} の ダメージ！`,
      );
    }
    setIsAttacking(false);
    setMinutes("");
    setTasks("");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 justify-between">
        <RetroWindow className="flex-1">
          <p>{subject.title}</p>
          <p>決戦: {subject.exam_date}</p>
          <p>HP: {subject.current_hp}</p>
        </RetroWindow>
      </div>

      <RetroWindow className="flex items-center justify-center h-48 text-2xl animate-pulse">
        {!isDefeated && `${subject.title}の巨獣`}
      </RetroWindow>

      {isAttacking ? (
        <RetroWindow>
          <form onSubmit={handleAttackSubmit} className="space-y-4">
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
            <div>
              <label className="block mb-1 text-sm">クリアしたタスク数</label>
              <RetroInput
                type="number"
                value={tasks}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTasks(e.target.value)
                }
                min="0"
                required
              />
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
                <RetroButton onClick={() => setIsAttacking(true)}>
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
