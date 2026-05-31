# ファイル構造解説

## 全体の考え方

```
UIの表示 (components) ← ロジック・状態 (hooks) ← 型定義 (types)
          ↑
     page.tsx が画面を切り替える
```

- **components** は「どう見せるか」だけを担当し、計算はしない
- **hooks** は「どう動くか」を担当し、JSXは書かない
- **types** は全体で使うデータの型を定義する

---

## src/app/globals.css

グローバルなCSS。CSSアニメーションのキーフレームをすべてここで定義している。

| キーフレーム名 | 用途 |
|---|---|
| `damageFloat` | ダメージ数値が上に浮かんで消える |
| `glitchAttack` | 攻撃時のシェイク + RGB分離（0.35秒） |
| `glitchDefeat` | 撃破時の細かいシェイク + 落下フェードアウト（1.4秒） |
| `idleBreath` | アイドルA: ゆっくり拡大縮小（呼吸感） |
| `idleFloat` | アイドルB: 上下に浮遊 |
| `idleGlitch` | アイドルC: たまにRGBがバチる |
| `confettiFall` | 紙吹雪の落下 |
| `confettiSpin` | 紙吹雪の回転 |
| `clearSlideUp` | クリア画面のスライドアップ |

---

## src/app/page.tsx

アプリのエントリポイント。**画面の切り替えだけ**を担当する。

- `useQuestLogic()` でゲーム全体の状態を取得する
- `currentScreen` の値に応じて3つの画面コンポーネントを切り替える
- フェードイン/アウト（150ms）の制御もここで行う
- ロジックはゼロ。状態を受け取ってコンポーネントに渡すだけ

```
currentScreen === "home"     → <HomeScreen />
currentScreen === "battle"   → <BattleScreen />
currentScreen === "register" → <RegisterScreen />
```

---

## src/features/quest/types/index.ts

アプリ全体で使うデータの型定義。

| 型名 | 説明 |
|---|---|
| `Task` | タスク1件。id / タイトル / 完了フラグ |
| `Subject` | 科目（ボス）。タスク一覧 / HP / 重要度 / 画像URL |
| `Player` | プレイヤー。レベル / EXP / HP |
| `DefeatedSubject` | 倒した科目の記録。勉強時間 / 完了タスク数 |
| `ScreenType` | 画面の種類。`"home"` / `"battle"` / `"register"` |

**HP の計算式**: `タスク数 × 100`（タスク1件完了で100ダメージ）

---

## src/features/quest/hooks/useQuestLogic.ts

**アプリのロジックをすべて持つカスタムHook。** ゲームの心臓部。

### 管理している状態

| 状態 | 説明 |
|---|---|
| `subjects` | 現在の科目（ボス）一覧 |
| `player` | プレイヤーのレベル・EXP・HP |
| `currentScreen` | 現在表示している画面 |
| `selectedSubjectId` | バトル中の科目ID |
| `isCleared` | 全科目クリア済みフラグ |
| `defeatedSubjects` | 倒した科目の記録 |

### localStorage への保存

キー `quest_state_v1` に全状態をJSONで保存。変更から500ms後に保存（デバウンス処理）。

### 主な関数

| 関数 | 何をするか |
|---|---|
| `addSubject` | 科目を追加。モンスター画像をランダム選択 |
| `addTask` | タスクを追加。HP も +100 |
| `completeTask` | タスクを完了にして `attack()` を呼ぶ |
| `attack` | HPを減らす。0以下で撃破。全科目撃破でクリア |
| `playerTakeDamage` | プレイヤーのHPを減らす（タイマー失敗ペナルティ） |
| `addExp` | 勉強時間（分）をEXPに加算。100EXPでレベルアップ |
| `navigateTo` | 画面を切り替える。ホームに戻る時は撃破済み科目を除外 |
| `resetQuest` | 全データをリセット |

---

## src/features/quest/components/RetroUI.tsx

**共通UIコンポーネント集。** 全UIパーツをこのファイルで定義している。

| コンポーネント | 役割 |
|---|---|
| `RetroWindow` | 白枠の黒背景ウィンドウ。タイトル帯付き |
| `RetroButton` | ホバーでゴールド、▶カーソル付きのボタン |
| `RetroInput` | テキスト入力欄 |
| `RetroSelect` | ドロップダウン選択 |
| `RetroTab` | タブ切り替えボタン |
| `RetroHpBar` | HP残量に応じて緑→黄→赤に変化するHPバー |
| `RetroMessage` | タイプライター効果で1文字ずつ表示。▌カーソル付き |
| `DamagePopup` | `-100` のような数値が上に浮かんで消えるエフェクト |
| `GlitchImage` | モンスター画像。アイドル/攻撃/撃破の3モードでアニメーション切り替え |
| `Confetti` | ゴールドの紙吹雪パーティクル（クリア時） |

### GlitchImage のアニメーションロジック

```
起動時: A(呼吸) / B(浮遊) / C(グリッチ) をランダムで選択
  ↓ タスクチェック時
攻撃グリッチ（0.35秒）
  ↓ HP=0時
撃破グリッチ（1.4秒、細かいシェイクで落下フェードアウト）
```

---

## src/features/quest/components/HomeScreen.tsx

ホーム画面。

- 全ボスの合計HPバーを表示
- タブで「中ボス一覧」「戦績」を切り替え
- 科目をクリックするとバトル画面へ
- 全科目クリア時はGAME CLEAR画面に切り替わり、紙吹雪が降る

---

## src/features/quest/components/BattleScreen.tsx

バトル画面。最もロジックが多いコンポーネント。

### 主な状態

| 状態 | 説明 |
|---|---|
| `isAttacking` | タイマー設定パネルを表示中かどうか |
| `isDefeated` | ボスを倒したかどうか |
| `timerPhase` | タイマーの状態（`idle` / `running` / `paused`） |
| `glitchMode` | グリッチアニメの状態（`idle` / `attack` / `defeat`） |
| `popups` | 表示中のダメージポップアップ一覧 |

### タイマーの流れ

```
1. 勉強時間（分）を入力
2. やっつけるタスクを選択（未選択なら全タスク対象）
3. タイマー開始
4. タイマー中にタスクをチェック → 即時攻撃 + グリッチエフェクト
5. タイマー終了時:
   - 未完了タスクがあればプレイヤーにダメージ（重要度×50/件）
   - 勉強時間はEXPに加算
```

### プレイヤーHP が 0 になると

ゲームオーバー画面を表示。`playerHp <= 0` のガード節により即座に別の画面を返す。

---

## src/features/quest/components/RegisterScreen.tsx

科目登録フォーム画面。

- 科目名 / 試験日 / 重要度（1〜5）を入力
- タスクを1件以上追加しないと登録できない
- Enterキーでタスクを素早く追加できる
- 登録後は `addSubject()` を呼んでホームに戻る
