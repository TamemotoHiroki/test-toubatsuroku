import React, { useState } from "react";
import { Subject, Player, ScreenType, DefeatedSubject } from "../types";
import { RetroWindow, RetroButton, RetroHpBar } from "./RetroUI";

interface Props {
  subjects: Subject[];
  totalBossHp: number;
  maxBossHp: number;
  player: Player;
  onNavigate: (screen: ScreenType, id?: string) => void;
  isCleared: boolean;
  defeatedSubjects: DefeatedSubject[];
  onResetQuest: () => void;
}

export const HomeScreen = ({
  subjects,
  totalBossHp,
  maxBossHp,
  player,
  onNavigate,
  isCleared,
  defeatedSubjects,
  onResetQuest,
}: Props) => {
  const [tab, setTab] = useState<"bosses" | "cleared">("bosses");

  return (
    <div className="space-y-4">
      {/* ボス HP パネル */}
      <RetroWindow title="★ 期末テスト魔王 ★">
        <RetroHpBar current={totalBossHp} max={maxBossHp} label="BOSS HP" />
        <div className="mt-4 pt-3 border-t border-white/20 flex justify-between items-center text-sm">
          <span style={{ color: "#ffd700" }}>LV. {player.level}</span>
          <span className="opacity-50">EXP {player.exp}</span>
        </div>
      </RetroWindow>

      {isCleared ? (
        /* クリア画面 */
        <RetroWindow title="GAME CLEAR">
          <p className="text-center mb-6" style={{ color: "#ffd700" }}>
            ★ すべての試練を のりこえた！ ★
          </p>
          {defeatedSubjects.length > 0 && (
            <div className="space-y-3">
              {defeatedSubjects.map((subject) => (
                <div key={subject.id} className="border-l-2 pl-3 border-[#ffd700]">
                  <p style={{ color: "#ffd700" }} className="text-sm">{subject.title}</p>
                  <p className="text-xs opacity-60 mt-1">
                    勉強時間: {subject.study_minutes} 分　タスク: {subject.tasks_cleared} 完了
                  </p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6">
            <RetroButton onClick={onResetQuest}>
              あらたな冒険へ（周回する）
            </RetroButton>
          </div>
        </RetroWindow>
      ) : (
        <>
          {/* タブ切り替えパネル */}
          <RetroWindow>
            {/* タブ */}
            <div className="flex border-b-2 border-white/30 mb-4 -mx-4 -mt-4 px-4">
              <button
                onClick={() => setTab("bosses")}
                className={`px-4 py-2 font-mono text-sm border-r border-white/20 transition-colors ${
                  tab === "bosses"
                    ? "bg-white text-black"
                    : "bg-black text-white hover:bg-white/10"
                }`}
              >
                中ボス一覧
              </button>
              <button
                onClick={() => setTab("cleared")}
                className={`px-4 py-2 font-mono text-sm transition-colors ${
                  tab === "cleared"
                    ? "bg-white text-black"
                    : "bg-black text-white hover:bg-white/10"
                }`}
              >
                戦績
              </button>
            </div>

            {tab === "bosses" ? (
              <div className="space-y-2">
                {subjects.length === 0 ? (
                  <p className="text-sm opacity-50 py-4 text-center">平和な世界だ...</p>
                ) : (
                  subjects.map((subject) => {
                    const totalTasks = subject.tasks.length;
                    const pct = totalTasks > 0 ? subject.current_hp / (totalTasks * 100) : 0;
                    const hpColor = pct > 0.5 ? "#00ff00" : pct > 0.25 ? "#ffd700" : "#ff0000";

                    return (
                      <RetroButton
                        key={subject.id}
                        onClick={() => onNavigate("battle", subject.id)}
                      >
                        <div className="flex-1 min-w-0 py-1">
                          <div className="text-sm">{subject.title}</div>
                          <div className="flex items-center gap-3 mt-1">
                            {/* ミニ HP バー */}
                            <div className="w-20 h-2 border border-white/60 bg-black shrink-0">
                              <div
                                className="h-full"
                                style={{ width: `${pct * 100}%`, backgroundColor: hpColor }}
                              />
                            </div>
                            <span className="text-xs" style={{ color: hpColor }}>
                              {subject.current_hp}/{totalTasks * 100}
                            </span>
                            <span className="text-xs opacity-50">
                              {subject.exam_date}
                            </span>
                          </div>
                        </div>
                      </RetroButton>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {defeatedSubjects.length === 0 ? (
                  <p className="text-sm opacity-50 py-4 text-center">まだ試練をクリアしていない...</p>
                ) : (
                  defeatedSubjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="border-l-2 pl-3 border-[#ffd700] py-1"
                    >
                      <p className="text-sm" style={{ color: "#ffd700" }}>{subject.title}</p>
                      <p className="text-xs opacity-60 mt-1">決戦: {subject.exam_date}</p>
                      <p className="text-xs opacity-60">
                        勉強時間: {subject.study_minutes} 分　タスク: {subject.tasks_cleared} 完了
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </RetroWindow>

          {/* 科目登録 */}
          <RetroWindow>
            <RetroButton onClick={() => onNavigate("register")}>
              ＋ 新しき試練（科目）を登録する
            </RetroButton>
          </RetroWindow>
        </>
      )}
    </div>
  );
};
