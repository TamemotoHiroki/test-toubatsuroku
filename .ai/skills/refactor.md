# Refactor Skill

> このファイルは `CLAUDE.md` のルーティング指示に従い、リファクタリング作業時に読み込まれます。

---

## 役割

複雑なコードやレガシーコードを、モダンな設計思想に基づいて洗練された状態へ一瞬で書き換える、世界最高峰のシニアエンジニアとして振る舞う。

## 目的

提示されたコードを分析し、「**安全性**」「**変更の容易さ**」「**認知負荷の低さ**」を劇的に高めた「改善後のコード」のみを提示する。

## 出力ルール【厳守】

- **改善されたコードのみ**を出力する
- 挨拶・前置き・後書き・思考プロセス・解説は**一切出力しない**
- 必要なJSDocコメントやインラインコメントはコード内に含めてよい
- 出力は適切な言語のマークダウンコードブロック（` ``` `）で囲む

---

## リファクタリング基準（内部的な思考プロセスとして適用する）

### 1. 関数型プログラミングの徹底

#### 宣言的記述 — 手続き型ループの排除

`for` / `while` などの手続き型ループを排除し、`map` / `filter` / `reduce` 等の高階関数で宣言的に記述する。

```typescript
// ❌ Before
const activeSubjects: Subject[] = [];
for (let i = 0; i < subjects.length; i++) {
  if (subjects[i].current_hp > 0) activeSubjects.push(subjects[i]);
}

// ✅ After
const activeSubjects = subjects.filter(s => s.current_hp > 0);
```

```typescript
// ❌ Before
let totalHp = 0;
for (const s of subjects) totalHp += s.current_hp;

// ✅ After
const totalHp = subjects.reduce((sum, s) => sum + s.current_hp, 0);
```

```typescript
// ❌ Before
const titles: string[] = [];
subjects.forEach(s => titles.push(s.title.toUpperCase()));

// ✅ After
const titles = subjects.map(s => s.title.toUpperCase());
```

#### イミュータビリティ — 破壊的操作の排除

`let` の多用・破壊的メソッド・ミュータブルな状態操作を排除し、常に新しいオブジェクト／配列を返す。

```typescript
// ❌ Before
const applyDamage = (subjects: Subject[], id: string, damage: number) => {
  const target = subjects.find(s => s.id === id);
  if (target) target.current_hp -= damage; // 破壊的
  return subjects;
};

// ✅ After
const applyDamage = (
  subjects: readonly Subject[],
  id: string,
  damage: number,
): Subject[] =>
  subjects.map(s =>
    s.id === id ? { ...s, current_hp: Math.max(0, s.current_hp - damage) } : s,
  );
```

```typescript
// ❌ Before
let subjects = fetchSubjects();
let defeated = [];
subjects.sort((a, b) => a.exam_date.localeCompare(b.exam_date));
subjects.forEach(s => { if (s.current_hp === 0) defeated.push(s); });

// ✅ After
const subjects = fetchSubjects();
const sortedSubjects = [...subjects].sort((a, b) =>
  a.exam_date.localeCompare(b.exam_date),
);
const defeated = subjects.filter(s => s.current_hp === 0);
```

#### 純粋関数の分離 — データパイプライン化

副作用のないロジックを純粋関数として切り出し、副作用（状態更新・localStorage等）はHookの外側に一元化する。

```typescript
// ❌ Before — 副作用と計算が混在
const processAttack = (subjectId: string, damage: number) => {
  const updated = subjects.map(s =>
    s.id === subjectId ? { ...s, current_hp: Math.max(0, s.current_hp - damage) } : s,
  );
  setSubjects(updated);
  localStorage.setItem("subjects", JSON.stringify(updated));
  const defeated = updated.find(s => s.id === subjectId && s.current_hp === 0);
  if (defeated) addExp(100);
};

// ✅ After — 純粋関数でロジックを分離し、副作用は外側に一元化
const applyDamage = (subject: Subject, damage: number): Subject => ({
  ...subject,
  current_hp: Math.max(0, subject.current_hp - damage),
});

const isDefeated = (subject: Subject): boolean => subject.current_hp === 0;

const attack = useCallback((subjectId: string, damage: number): void => {
  setSubjects(prev => {
    const next = prev.map(s =>
      s.id === subjectId ? applyDamage(s, damage) : s,
    );
    if (next.find(s => s.id === subjectId && isDefeated(s))) addExp(100);
    return next;
  });
}, [addExp]);
```

---

### 2. クリーンコードと設計原則

#### ガード節 — ネストの除去

早期リターンでネストを浅くし、不要な `else` を排除する。

```typescript
// ❌ Before
const completeTask = (subjectId: string, taskId: string) => {
  const subject = subjects.find(s => s.id === subjectId);
  if (subject) {
    if (!subject.tasks.find(t => t.id === taskId)?.isDone) {
      setSubjects(prev => prev.map(s =>
        s.id === subjectId
          ? { ...s, tasks: s.tasks.map(t => t.id === taskId ? { ...t, isDone: true } : t) }
          : s,
      ));
    }
  }
};

// ✅ After
const completeTask = (subjectId: string, taskId: string): void => {
  const subject = subjects.find(s => s.id === subjectId);
  if (!subject) return;

  const task = subject.tasks.find(t => t.id === taskId);
  if (!task || task.isDone) return;

  setSubjects(prev =>
    prev.map(s =>
      s.id !== subjectId ? s : {
        ...s,
        tasks: s.tasks.map(t =>
          t.id === taskId ? { ...t, isDone: true } : t,
        ),
      },
    ),
  );
};
```

#### 単一責任とKISS — 関数の粒度

1つの関数が持つ責任を1つに絞る。過剰な抽象化を避け、純粋関数をHookで組み合わせる構造にする。

```typescript
// ❌ Before — 複数の責任を持つ巨大関数
const handleBossDefeated = (subject: Subject) => {
  const exp = subject.importance * 100;
  setPlayer(p => ({ ...p, exp: p.exp + exp }));
  const newLevel = Math.floor((player.exp + exp) / 500) + 1;
  if (newLevel > player.level) {
    setPlayer(p => ({ ...p, level: newLevel }));
    showLevelUpEffect();
  }
  setSubjects(prev => prev.filter(s => s.id !== subject.id));
  setDefeatedSubjects(prev => [...prev, {
    id: subject.id,
    title: subject.title,
    exam_date: subject.exam_date,
    study_minutes: 0,
    tasks_cleared: subject.tasks.filter(t => t.isDone).length,
  }]);
};

// ✅ After — 各責任を純粋関数として分離し、Hookで組み合わせる
const calcExpGain = (subject: Subject): number => subject.importance * 100;

const calcNewLevel = (currentExp: number, expGain: number): number =>
  Math.floor((currentExp + expGain) / 500) + 1;

const toDefeatedRecord = (subject: Subject): DefeatedSubject => ({
  id: subject.id,
  title: subject.title,
  exam_date: subject.exam_date,
  study_minutes: 0,
  tasks_cleared: subject.tasks.filter(t => t.isDone).length,
});

const handleBossDefeated = useCallback((subject: Subject): void => {
  const expGain = calcExpGain(subject);
  const newLevel = calcNewLevel(player.exp, expGain);

  setPlayer(p => ({ ...p, exp: p.exp + expGain, level: newLevel }));
  if (newLevel > player.level) showLevelUpEffect();

  setSubjects(prev => prev.filter(s => s.id !== subject.id));
  setDefeatedSubjects(prev => [...prev, toDefeatedRecord(subject)]);
}, [player.exp, player.level, showLevelUpEffect]);
```

#### 命名 — 意図と振る舞いを直接表現する

変数・関数名から「何のデータか」「何をする関数か」が瞬時に伝わるようにする。

```typescript
// ❌ Before
const data = subjects.filter(s => s.hp > 0);
const fn = (x: Subject) => x.importance * x.tasks.length;
const flag = subjects.every(s => s.isDone);

// ✅ After
const liveSubjects = subjects.filter(isAlive);
const calcSubjectWeight = (subject: Subject): number =>
  subject.importance * subject.tasks.length;
const isQuestComplete = subjects.every(isDefeated);
```

---

### 3. React 固有のパターン

#### JSX を宣言的に整理

JSX内の複雑な条件式を排除し、ガード節と意味のある変数名で構造を明確にする。

```tsx
// ❌ Before
return (
  <div>
    {subjects.length > 0 && !isLoading && !error
      ? subjects.filter(s => s.current_hp > 0).map((s, i) => (
          <div key={s.id} style={{ opacity: i === 0 ? 1 : 0.7 }}>
            {s.title} HP: {s.current_hp}/{s.max_hp}
          </div>
        ))
      : isLoading
        ? <span>Loading...</span>
        : <span>No subjects</span>
    }
  </div>
);

// ✅ After
const liveSubjects = subjects.filter(s => s.current_hp > 0);

if (isLoading) return <LoadingSpinner />;
if (error)     return <ErrorMessage message={error.message} />;
if (liveSubjects.length === 0) return <EmptyState />;

return (
  <ul>
    {liveSubjects.map(subject => (
      <SubjectCard key={subject.id} subject={subject} />
    ))}
  </ul>
);
```

#### カスタムフック内のデータパイプライン

生成ロジックを純粋関数として外出しし、Hookは `setter` へのパイプラインに徹する。

```typescript
// ❌ Before
const addSubject = (input: SubjectInput) => {
  const newSubject: Subject = {
    id: crypto.randomUUID(),
    title: input.title,
    exam_date: input.exam_date,
    importance: input.importance,
    current_hp: input.importance * 100,
    tasks: [],
  };
  const newSubjects = [...subjects, newSubject];
  setSubjects(newSubjects);
};

// ✅ After
const buildSubject = (input: SubjectInput): Subject => ({
  id: crypto.randomUUID(),
  title: input.title,
  exam_date: input.exam_date,
  importance: input.importance,
  current_hp: input.importance * 100,
  tasks: [],
});

const addSubject = useCallback((input: SubjectInput): void => {
  setSubjects(prev => [...prev, buildSubject(input)]);
}, []);
```
