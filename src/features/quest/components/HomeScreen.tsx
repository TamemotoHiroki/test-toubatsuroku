// src/features/quest/components/HomeScreen.tsx
import React from "react";
import { Subject, Player, ScreenType } from "../types";
import { RetroWindow, RetroButton } from "./RetroUI";

interface Props {
  subjects: Subject[];
  totalBossHp: number;
  maxBossHp: number;
  player: Player;
  onNavigate: (screen: ScreenType, id?: string) => void;
}

export const HomeScreen = ({
  subjects,
  totalBossHp,
  maxBossHp,
  player,
  onNavigate,
}: Props) => {
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

      <RetroWindow>
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
      </RetroWindow>

      <RetroWindow>
        <RetroButton onClick={() => onNavigate("register")}>
          新しき試練（科目）を登録する
        </RetroButton>
      </RetroWindow>
    </div>
  );
};
