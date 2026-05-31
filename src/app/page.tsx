// src/app/page.tsx
"use client";

import { useState, useCallback } from "react";
import { useQuestLogic } from "../features/quest/hooks/useQuestLogic";
import { HomeScreen } from "../features/quest/components/HomeScreen";
import { BattleScreen } from "../features/quest/components/BattleScreen";
import { RegisterScreen } from "../features/quest/components/RegisterScreen";
import { ScreenType } from "../features/quest/types";

const FADE_MS = 150;

export default function QuestApp() {
  const questLogic = useQuestLogic();
  const [fading, setFading] = useState(false);

  const navigate = useCallback((screen: ScreenType, id?: string) => {
    setFading(true);
    setTimeout(() => {
      questLogic.navigateTo(screen, id);
      setFading(false);
    }, FADE_MS);
  }, [questLogic]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-[#0a0a0a]">
      <div
        className="w-full max-w-2xl p-3 sm:p-6 bg-[#000020] transition-opacity duration-150"
        style={{ opacity: fading ? 0 : 1 }}
      >
        {questLogic.currentScreen === "home" && (
          <HomeScreen
            subjects={questLogic.subjects}
            totalBossHp={questLogic.totalBossHp}
            maxBossHp={questLogic.maxBossHp}
            player={questLogic.player}
            onNavigate={navigate}
            isCleared={questLogic.isCleared}
            defeatedSubjects={questLogic.defeatedSubjects}
            onResetQuest={questLogic.resetQuest}
          />
        )}

        {questLogic.currentScreen === "battle" &&
          questLogic.selectedSubject && (
            <BattleScreen
              subject={questLogic.selectedSubject}
              playerHp={questLogic.player.hp}
              onAttack={questLogic.attack}
              onCompleteMultipleTasks={questLogic.completeMultipleTasks}
              onPlayerDamage={questLogic.playerTakeDamage}
              onAddTask={questLogic.addTask}
              onAddExp={questLogic.addExp}
              onUpdateDefeatedStudyTime={questLogic.updateDefeatedStudyTime}
              onBack={() => navigate("home")}
              onGameOver={() => {
                questLogic.restorePlayerHp();
                navigate("home");
              }}
            />
          )}

        {questLogic.currentScreen === "register" && (
          <RegisterScreen
            onRegister={questLogic.addSubject}
            onBack={() => navigate("home")}
          />
        )}
      </div>
    </div>
  );
}
