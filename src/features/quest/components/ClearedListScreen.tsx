// src/features/quest/components/ClearedListScreen.tsx
import React from "react";
import { RetroWindow, RetroButton } from "./RetroUI";

interface DefeatedSubject {
  id: string;
  title: string;
  exam_date: string;
  study_minutes: number;
  tasks_cleared: number;
}

interface Props {
  defeatedSubjects: DefeatedSubject[];
  onBack: () => void;
}

export const ClearedListScreen = ({ defeatedSubjects, onBack }: Props) => {
  return (
    <div className="space-y-4">
      <RetroWindow className="text-center text-xl">
        戦績一覧
      </RetroWindow>

      <RetroWindow>
        {defeatedSubjects.length === 0 ? (
          <p>まだ試練を クリアしていない...</p>
        ) : (
          <div className="space-y-3">
            {defeatedSubjects.map((subject) => (
              <div key={subject.id} className="border-b border-white pb-3 text-sm">
                <p className="font-bold text-lg">{subject.title}</p>
                <p>決戦: {subject.exam_date}</p>
                <p>勉強時間: {subject.study_minutes} 分</p>
                <p>クリアしたタスク: {subject.tasks_cleared}</p>
              </div>
            ))}
          </div>
        )}
      </RetroWindow>

      <RetroWindow>
        <RetroButton onClick={onBack}>もどる</RetroButton>
      </RetroWindow>
    </div>
  );
};
