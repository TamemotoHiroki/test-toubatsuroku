// src/features/quest/components/HomeScreen.tsx
import React, { useState } from "react";
import { Subject, Player, ScreenType } from "../types";
import { RetroWindow, RetroButton } from "./RetroUI";

interface DefeatedSubject {
  id: string;
  title: string;
  exam_date: string;
  study_minutes: number;
  tasks_cleared: number;
}

interface Props {
  subjects: Subject[];
  totalBossHp: number;
  maxBossHp: number;
  player: Player;
  onNavigate: (screen: ScreenType, id?: string) => void;
  hasAllBossesDefeated: () => boolean;
  defeatedSubjects: DefeatedSubject[];
}

export const HomeScreen = ({
  subjects,
  totalBossHp,
  maxBossHp,
  player,
  onNavigate,
  hasAllBossesDefeated,
  defeatedSubjects,
}: Props) => {
  const [tab, setTab] = useState<"bosses" | "cleared">("bosses");

  return (
    <div className="space-y-4">
      <RetroWindow className="text-center">
        <h1 className="mb-2 text-xl">期末テスト魔王</h1>
        <p className="text-2xl">
          HP: {totalBossHp} / {maxBossHp}
        </p>
        <div className="mt-4 pt-2 border-t border-white text-left text-sm">
          勇者レベル: {player.level} (EXP: {player.exp})
        </div>
      </RetroWindow>

      {hasAllBossesDefeated() ? (
        <RetroWindow className="text-center text-2xl">
          <p className="mb-4">すべての試練を のりこえた！</p>
          <div className="mt-6 pt-4 border-t border-white text-left">
            <h2 className="mb-4 text-lg text-center">最終戦績</h2>
            {defeatedSubjects.length > 0 && (
              <div className="space-y-3 text-sm">
                {defeatedSubjects.map((subject) => (
                  <div key={subject.id} className="border-b border-white pb-2">
                    <p className="font-bold">{subject.title}</p>
                    <p>勉強時間: {subject.study_minutes} 分</p>
                    <p>クリアしたタスク: {subject.tasks_cleared}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </RetroWindow>
      ) : (
        <>
          <RetroWindow>
            <div className="flex gap-2 mb-4">
              <RetroButton
                onClick={() => setTab("bosses")}
              >
                {tab === "bosses" ? "★" : "  "} 中ボス一覧
              </RetroButton>
              <RetroButton
                onClick={() => setTab("cleared")}
              >
                {tab === "cleared" ? "★" : "  "} 戦績
              </RetroButton>
            </div>

            {tab === "bosses" ? (
              <div>
                <h2 className="mb-4 text-lg">中ボス一覧（科目）</h2>
                <div className="space-y-2">
                  {subjects.length === 0 ? (
                    <p>平和な世界だ...</p>
                  ) : (
                    subjects.map((subject) => (
                      <RetroButton
                        key={subject.id}
                        onClick={() => onNavigate("battle", subject.id)}
                      >
                        {subject.title} [HP {subject.current_hp}/
                        {subject.total_tasks * 100}] 決戦: {subject.exam_date}
                      </RetroButton>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h2 className="mb-4 text-lg">戦績一覧</h2>
                {defeatedSubjects.length === 0 ? (
                  <p>まだ試練を クリアしていない...</p>
                ) : (
                  <div className="space-y-3">
                    {defeatedSubjects.map((subject) => (
                      <div
                        key={subject.id}
                        className="border-b border-white pb-3 text-sm"
                      >
                        <p className="font-bold text-lg">{subject.title}</p>
                        <p>決戦: {subject.exam_date}</p>
                        <p>勉強時間: {subject.study_minutes} 分</p>
                        <p>クリアしたタスク: {subject.tasks_cleared}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </RetroWindow>
        </>
      )}

      <RetroWindow>
        <RetroButton onClick={() => onNavigate("register")}>
          新しき試練（科目）を登録する
        </RetroButton>
      </RetroWindow>
    </div>
  );
};
