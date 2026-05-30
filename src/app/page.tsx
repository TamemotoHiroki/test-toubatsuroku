// src/app/page.tsx
"use client";

import { useQuestLogic } from "../features/quest/hooks/useQuestLogic";
import { HomeScreen } from "../features/quest/components/HomeScreen";
import { BattleScreen } from "../features/quest/components/BattleScreen";
import { RegisterScreen } from "../features/quest/components/RegisterScreen";

export default function QuestApp() {
  const questLogic = useQuestLogic();

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-neutral-900">
      <div className="w-full max-w-2xl min-h-[600px] p-6 bg-black">
        {questLogic.currentScreen === "home" && (
          <HomeScreen
            subjects={questLogic.subjects}
            totalBossHp={questLogic.totalBossHp}
            maxBossHp={questLogic.maxBossHp}
            player={questLogic.player}
            onNavigate={questLogic.navigateTo}
            isCleared={questLogic.isCleared}
            defeatedSubjects={questLogic.defeatedSubjects}
            onResetQuest={questLogic.resetQuest}
          />
        )}

        {questLogic.currentScreen === "battle" &&
          questLogic.selectedSubject && (
            <BattleScreen
              subject={questLogic.selectedSubject}
              onAttack={questLogic.attack}
              onCompleteTask={questLogic.completeTask}
              onBack={() => questLogic.navigateTo("home")}
            />
          )}

        {questLogic.currentScreen === "register" && (
          <RegisterScreen
            onRegister={questLogic.addSubject}
            onBack={() => questLogic.navigateTo("home")}
          />
        )}
      </div>
    </div>
  );
}
