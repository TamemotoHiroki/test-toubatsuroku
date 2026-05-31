// src/features/quest/components/BattleScreen.tsx
import React, { useState, useEffect, useRef } from "react";
import { Subject } from "../types";
import { RetroWindow, RetroButton, RetroInput, RetroHpBar, RetroMessage, DamagePopup, GlitchImage } from "./RetroUI";
import { useButtonSE } from "../hooks/useButtonSE";
import { useBGM } from "../hooks/useBGM";

type TimerPhase = "idle" | "running" | "paused";

const GAMEOVER_MESSAGES = [
  "今日は勉強できませんでした。\n家でNetflixでも観ましょう。",
  "人生山あり谷あり。\n今は谷のようです。",
  "あちゃー、今年はだめかあ。\n来年も遊ぼうな！",
  "このゲームはやり直せても、\n人生は一度きりですよ？",
  "やったあ！もう一回遊べるドン！",
  "素晴らしい。",
  "素晴らしい長考です！\nあなたは芸術家タイプですね！",
  "おめでとう。",
];

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

interface Props {
  subject: Subject;
  playerHp: number;
  onAttack: (subjectId: string, minutes: number, tasks: number) => { damage: number; isDefeated: boolean };
  onCompleteMultipleTasks: (subjectId: string, taskIds: string[]) => { damage: number; isDefeated: boolean };
  onPlayerDamage: (damage: number) => void;
  onAddTask: (subjectId: string, title: string) => string;
  onAddExp: (minutes: number) => void;
  onUpdateDefeatedStudyTime: (subjectId: string, minutes: number) => void;
  onBack: () => void;
  onGameOver: () => void;
}

export const BattleScreen = ({
  subject,
  playerHp,
  onAttack,
  onCompleteMultipleTasks,
  onPlayerDamage,
  onAddTask,
  onAddExp,
  onUpdateDefeatedStudyTime,
  onBack,
  onGameOver,
}: Props) => {
  const [isAttacking, setIsAttacking] = useState(false);
  const [isDefeated, setIsDefeated] = useState(false);
  const [message, setMessage] = useState(`${subject.title} が あらわれた！`);
  const [popups, setPopups] = useState<{ id: string; damage: number }[]>([]);
  const [glitchMode, setGlitchMode] = useState<"idle" | "attack" | "defeat">("idle");
  const [glitchTrigger, setGlitchTrigger] = useState(0);

  const { playDecide, playCancel } = useButtonSE();

  const battleBgm =
    subject.importance <= 2 ? "/bgm/battle_low.mp3" :
    subject.importance <= 4 ? "/bgm/battle_mid.mp3" :
    "/bgm/battle_high.mp3";
  useBGM(playerHp > 0 ? battleBgm : "/bgm/gameover.mp3");

  const seRef = useRef<Record<string, HTMLAudioElement>>({});
  useEffect(() => {
    seRef.current = {
      defeat:   new Audio("/se/defeat.wav"),
      damage:   new Audio("/se/damage.wav"),
      gameover: new Audio("/se/gameover.wav"),
    };
  }, []);

  const gameoverPlayedRef = useRef(false);
  const gameoverMessageRef = useRef("");
  const [gameoverMessageVisible, setGameoverMessageVisible] = useState(false);
  useEffect(() => {
    if (playerHp <= 0 && !gameoverPlayedRef.current) {
      gameoverPlayedRef.current = true;
      gameoverMessageRef.current = GAMEOVER_MESSAGES[Math.floor(Math.random() * GAMEOVER_MESSAGES.length)];
      playSE("gameover");
      setTimeout(() => setGameoverMessageVisible(true), 700);
    }
  }, [playerHp]);

  const playSE = (key: "defeat" | "damage" | "gameover") => {
    const audio = seRef.current[key];
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };

  const triggerAttackGlitch = () => {
    setGlitchMode("attack");
    setGlitchTrigger(t => t + 1);
    setTimeout(() => setGlitchMode("idle"), 350);
  };

  const triggerDefeatGlitch = () => {
    setGlitchMode("defeat");
    setGlitchTrigger(t => t + 1);
  };

  const showDamagePopup = (damage: number) => {
    const id = crypto.randomUUID();
    setPopups(prev => [...prev, { id, damage }]);
    setTimeout(() => setPopups(prev => prev.filter(p => p.id !== id)), 900);
  };

  // ── タイマー状態 ────────────────────────────────────────
  const [timerPhase, setTimerPhase] = useState<TimerPhase>("idle");
  const [timeLeft, setTimeLeft] = useState(0);
  const [inputHours, setInputHours] = useState("0");
  const [inputMinutes, setInputMinutes] = useState("25");
  const [inputSeconds, setInputSeconds] = useState("0");

  // セットアップ時の選択タスク
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  // タイマー稼働中にチェックされたタスク
  const [timerCheckedTasks, setTimerCheckedTasks] = useState<Set<string>>(new Set());

  // タスク追加フォーム
  const [newTaskInput, setNewTaskInput] = useState("");

  // ── Refs ────────────────────────────────────────────────
  const timerRef = useRef<number | null>(null);
  const timerPhaseRef = useRef<TimerPhase>("idle");
  const pendingMinutesRef = useRef(0);
  const pendingTasksRef = useRef<string[]>([]);
  const timerCheckedTasksRef = useRef<Set<string>>(new Set());

  useEffect(() => { timerPhaseRef.current = timerPhase; }, [timerPhase]);
  useEffect(() => { timerCheckedTasksRef.current = timerCheckedTasks; }, [timerCheckedTasks]);

  // タイマー期限切れ処理（常に最新の props/state を参照）
  const doExpiryRef = useRef(() => {});
  doExpiryRef.current = () => {
    const min = pendingMinutesRef.current;
    const pending = pendingTasksRef.current;
    const checked = timerCheckedTasksRef.current;

    // 未チェックのタスク → プレイヤーダメージ
    const unchecked = pending.filter((id) => !checked.has(id));
    if (unchecked.length > 0) {
      const dmg = unchecked.length * 50 * subject.importance;
      onPlayerDamage(dmg);
      playSE("damage");
      setMessage(`じかんきれ！ てきのこうげき！\n-${dmg} ダメージ！`);
    }

    // 勉強時間 → EXP（ダメージは 0）
    if (min > 0) {
      onAttack(subject.id, min, 0);
    }

    setTimerCheckedTasks(new Set());
    setIsAttacking(false);
  };

  // ── インターバル ─────────────────────────────────────────
  const clearTimerInterval = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (timerPhase !== "running") return;
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return clearTimerInterval;
  }, [timerPhase]);

  // タイマー 0 → 期限切れ処理
  useEffect(() => {
    if (timeLeft !== 0 || timerPhaseRef.current !== "running") return;
    clearTimerInterval();
    setTimerPhase("idle");
    doExpiryRef.current();
  }, [timeLeft]);

  // ── ハンドラ ─────────────────────────────────────────────
  const handleToggleTask = (taskId: string) => {
    setSelectedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId); else next.add(taskId);
      return next;
    });
  };

  const handleStartTimer = () => {
    const h = parseInt(inputHours, 10) || 0;
    const m = parseInt(inputMinutes, 10) || 0;
    const s = parseInt(inputSeconds, 10) || 0;
    const totalSeconds = h * 3600 + m * 60 + s;
    if (totalSeconds <= 0) return;
    pendingMinutesRef.current = Math.floor(totalSeconds / 60);
    // isDone済みのタスクは除外（別ターン完了分を混入させない）
    const nonDoneIds = new Set(subject.tasks.filter((t) => !t.isDone).map((t) => t.id));
    pendingTasksRef.current =
      selectedTasks.size > 0
        ? Array.from(selectedTasks).filter((id) => nonDoneIds.has(id))
        : Array.from(nonDoneIds);
    setTimerCheckedTasks(new Set());
    setTimeLeft(totalSeconds);
    setTimerPhase("running");
  };

  const handlePause = () => { clearTimerInterval(); setTimerPhase("paused"); };
  const handleResume = () => setTimerPhase("running");

  const handleStop = () => {
    clearTimerInterval();
    setTimerPhase("idle");
    setTimeLeft(0);
    setTimerCheckedTasks(new Set());
  };

  const handleCancelAttack = () => {
    handleStop();
    setIsAttacking(false);
  };

  // タイマー稼働中のチェック → やった印のみ（ダメージなし）
  const handleTimerTaskToggle = (taskId: string) => {
    if (subject.tasks.find(t => t.id === taskId)?.isDone) return;
    setTimerCheckedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId); else next.add(taskId);
      return next;
    });
  };

  // 完了ボタン → チェック済みタスクをまとめて攻撃
  const handleConfirmAttack = () => {
    if (timerCheckedTasks.size === 0) return;
    const min = pendingMinutesRef.current;

    const { damage: totalDamage, isDefeated: defeated } = onCompleteMultipleTasks(
      subject.id,
      Array.from(timerCheckedTasks),
    );

    showDamagePopup(totalDamage);

    if (defeated) {
      playSE("defeat");
      triggerDefeatGlitch();
      clearTimerInterval();
      setTimerPhase("idle");
      onUpdateDefeatedStudyTime(subject.id, min);
      onAddExp(min);
      setMessage(`${subject.title} を たおした！\n+${min} EXP を獲得した！`);
      setIsDefeated(true);
      setIsAttacking(false);
    } else {
      triggerAttackGlitch();
      setMessage(`ゆうしゃのこうげき！\n${totalDamage} のダメージ！`);
    }

    setTimerCheckedTasks(new Set());
  };

  // 新規タスク追加
  const handleAddTask = () => {
    const title = newTaskInput.trim();
    if (!title) return;
    onAddTask(subject.id, title);
    setNewTaskInput("");
  };

  const maxHp = subject.tasks.length * 100;

  // ── ゲームオーバー ───────────────────────────────────────
  if (playerHp <= 0) {
    return (
      <div className="space-y-4">
        <RetroWindow title="-- GAME OVER --">
          <div className="text-center text-lg mb-3" style={{ color: "#ff0000" }}>
            <RetroMessage speed={60}>ゆうしゃ は たおれた…</RetroMessage>
          </div>
          {gameoverMessageVisible && (
            <div className="text-center text-sm opacity-80">
              <RetroMessage speed={40}>{gameoverMessageRef.current}</RetroMessage>
            </div>
          )}
        </RetroWindow>
        <RetroButton onClick={() => { playCancel(); onGameOver(); }} className="w-full">タイトルへもどる</RetroButton>
      </div>
    );
  }

  const dangerPulseDuration =
    timeLeft <= 10 ? "0.4s" : timeLeft <= 30 ? "0.7s" : "1.2s";

  // ── バトル画面 ───────────────────────────────────────────
  return (
    <div className="space-y-4">
      {timeLeft <= 60 && timerPhase === "running" && (
        <div
          className="fixed inset-0 pointer-events-none z-40"
          style={{
            background: "radial-gradient(ellipse at center, transparent 30%, rgba(255,0,0,0.3) 100%)",
            animation: `dangerPulse ${dangerPulseDuration} ease-in-out infinite`,
          }}
        />
      )}
      {/* 敵情報 + ダメージポップアップ */}
      <div className="relative">
        <RetroWindow title={subject.title}>
          <p className="text-xs opacity-50 mb-3">決戦の日: {subject.exam_date}</p>
          <RetroHpBar current={subject.current_hp} max={maxHp} />
        </RetroWindow>
        <div className="absolute top-2 right-4 flex flex-col items-end gap-1 pointer-events-none">
          {popups.map(p => (
            <DamagePopup key={p.id} value={p.damage} />
          ))}
        </div>
      </div>

      {/* モンスター画像 */}
      {subject.imageUrl && (
        <RetroWindow>
          <div className="flex items-end justify-center h-[160px] sm:h-[220px] overflow-hidden">
            <GlitchImage
              src={subject.imageUrl}
              alt={subject.title}
              glitchMode={glitchMode}
              glitchTrigger={glitchTrigger}
              idleVariant={
                subject.imageUrl?.includes("/monsters/1") ? 0 :
                subject.imageUrl?.includes("/monsters/2") ? 1 : 2
              }
            />
          </div>
        </RetroWindow>
      )}

      {/* 攻撃画面 / メッセージ */}
      {isAttacking ? (
        <RetroWindow title="-- 攻撃画面 --">

          {timerPhase === "idle" ? (
            /* ① セットアップ */
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-xs opacity-60">勉強時間</label>
                <div className="flex items-center gap-2">
                  <RetroInput
                    type="number"
                    value={inputHours}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputHours(e.target.value)}
                    min="0"
                    placeholder="0"
                    className="w-16 text-center"
                  />
                  <span className="text-xs opacity-60 shrink-0">時間</span>
                  <RetroInput
                    type="number"
                    value={inputMinutes}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMinutes(e.target.value)}
                    min="0"
                    max="59"
                    placeholder="25"
                    className="w-16 text-center"
                  />
                  <span className="text-xs opacity-60 shrink-0">分</span>
                  <RetroInput
                    type="number"
                    value={inputSeconds}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputSeconds(e.target.value)}
                    min="0"
                    max="59"
                    placeholder="0"
                    className="w-16 text-center"
                  />
                  <span className="text-xs opacity-60 shrink-0">秒</span>
                </div>
              </div>

              {/* タスク一覧 + 追加 */}
              <div className="border-t border-white/20 pt-3">
                <p className="text-xs opacity-60 mb-2">やっつけるタスク</p>
                <div className="space-y-1 mb-3">
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
                          disabled={task.isDone}
                          onChange={() => handleToggleTask(task.id)}
                          className="h-4 w-4 accent-[#ffd700] shrink-0"
                        />
                        <span className={task.isDone ? "line-through" : ""}>{task.title}</span>
                      </label>
                    ))
                  )}
                </div>

                {/* 新規タスク追加 */}
                <div className="flex gap-2">
                  <RetroInput
                    type="text"
                    value={newTaskInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTaskInput(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") { e.preventDefault(); handleAddTask(); } }}
                    placeholder="＋ 新しいタスクを追加"
                  />
                  <RetroButton type="button" onClick={() => { playDecide(); handleAddTask(); }}>追加</RetroButton>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <RetroButton onClick={() => { playCancel(); handleCancelAttack(); }}>やめる</RetroButton>
                <RetroButton
                  onClick={() => { playDecide(); handleStartTimer(); }}
                  disabled={(parseInt(inputHours) || 0) * 3600 + (parseInt(inputMinutes) || 0) * 60 + (parseInt(inputSeconds) || 0) <= 0}
                >
                  タイマー開始
                </RetroButton>
              </div>
            </div>

          ) : (
            /* ② タイマー稼働中 / 一時停止中 */
            <div className="space-y-4">
              {/* カウントダウン */}
              <div className="text-center py-3">
                <p
                  className="text-5xl font-mono font-bold tabular-nums"
                  style={{
                    color:
                      timerPhase === "paused" ? "#ffffff"
                      : timeLeft <= 60 ? "#ff0000"
                      : "#ffd700",
                  }}
                >
                  {formatTime(timeLeft)}
                </p>
                <p className="text-xs opacity-50 mt-1">
                  {timerPhase === "running" ? "カウントダウン中..." : "⏸ 一時停止中"}
                </p>
              </div>

              {/* タスク一覧（チェックで即時攻撃） */}
              <div className="border-t border-white/20 pt-3">
                <p className="text-xs opacity-60 mb-2">
                  やったタスクにチェック → 完了ボタンで攻撃
                </p>
                <div className="space-y-1">
                  {pendingTasksRef.current.length === 0 ? (
                    <p className="text-xs opacity-40">対象タスクなし</p>
                  ) : (
                    pendingTasksRef.current.map((taskId) => {
                      const task = subject.tasks.find((t) => t.id === taskId);
                      if (!task) return null;
                      const isDone = task.isDone;
                      const checked = timerCheckedTasks.has(taskId);
                      return (
                        <label
                          key={taskId}
                          className={`flex items-center gap-3 px-2 py-2 border border-white/20 text-sm cursor-pointer ${
                            isDone ? "opacity-40" : checked ? "border-[#ffd700]/60" : "hover:border-[#ffd700]/40"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked || isDone}
                            disabled={isDone || timerPhase === "paused"}
                            onChange={() => handleTimerTaskToggle(taskId)}
                            className="h-4 w-4 accent-[#ffd700] shrink-0"
                          />
                          <span className={isDone ? "line-through" : ""}>{task.title}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* 未チェック時のペナルティ表示 */}
              {pendingTasksRef.current.some((id) => !timerCheckedTasks.has(id) && !subject.tasks.find((t) => t.id === id)?.isDone) && (
                <p className="text-xs text-center" style={{ color: "#ff6666" }}>
                  未完了タスクごとに -{50 * subject.importance} ダメージ（重要度 {subject.importance}×50）
                </p>
              )}

              <div className="flex gap-2 pt-1">
                {timerPhase === "running" ? (
                  <RetroButton onClick={() => { playCancel(); handlePause(); }}>一時停止</RetroButton>
                ) : (
                  <RetroButton onClick={() => { playDecide(); handleResume(); }}>再開</RetroButton>
                )}
                <RetroButton
                  onClick={() => { playDecide(); handleConfirmAttack(); }}
                  disabled={timerCheckedTasks.size === 0 || timerPhase === "paused"}
                >
                  完了
                </RetroButton>
                <RetroButton onClick={() => { playCancel(); handleStop(); }}>終了</RetroButton>
              </div>
            </div>
          )}
        </RetroWindow>

      ) : isDefeated ? (
        <div className="space-y-4">
          <RetroWindow className="min-h-[80px]">
            <RetroMessage>{message}</RetroMessage>
          </RetroWindow>
          <RetroButton onClick={() => { playDecide(); onBack(); }} className="w-full">つづける</RetroButton>
        </div>

      ) : (
        <div className="flex gap-4">
          <RetroWindow className="flex-1 min-h-[80px]">
            <RetroMessage>{message}</RetroMessage>
          </RetroWindow>
          <div className="flex flex-col gap-2 w-28 shrink-0">
            <RetroButton onClick={() => { playDecide(); setIsAttacking(true); }}>たたかう</RetroButton>
            <RetroButton onClick={() => { playCancel(); onBack(); }}>にげる</RetroButton>
          </div>
        </div>
      )}
    </div>
  );
};
