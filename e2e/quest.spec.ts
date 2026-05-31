import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

// ── 1. ホーム画面 ─────────────────────────────────────────
test("ホーム画面が表示される", async ({ page }) => {
  await expect(page.getByText("期末テスト魔王")).toBeVisible();
  await expect(page.getByText("中ボス一覧")).toBeVisible();
  await expect(page.getByText("新しき試練")).toBeVisible();
});

// ── 2. 科目登録 ───────────────────────────────────────────
test("科目を登録するとホームに表示される", async ({ page }) => {
  await page.getByText("新しき試練").click();
  await page.getByPlaceholder("例: 微積分").fill("数学II");
  await page.getByLabel("決戦の日").fill("2026-12-01");
  await page.getByPlaceholder("例: 微分の練習問題").fill("練習問題を解く");
  await page.getByText("追加").first().click();
  await page.getByText("登録する").click();
  await expect(page.getByText("数学II")).toBeVisible();
});

// ── 3. バトル画面への遷移 ─────────────────────────────────
test("科目をクリックするとバトル画面に遷移する", async ({ page }) => {
  await page.getByText("新しき試練").click();
  await page.getByPlaceholder("例: 微積分").fill("英語");
  await page.getByLabel("決戦の日").fill("2026-12-01");
  await page.getByPlaceholder("例: 微分の練習問題").fill("単語帳を読む");
  await page.getByText("追加").first().click();
  await page.getByText("登録する").click();
  await page.getByText("英語").click();
  await expect(page.getByText("たたかう")).toBeVisible();
  await expect(page.getByText("にげる")).toBeVisible();
});

// ── 4. にげるでホームに戻る ───────────────────────────────
test("にげるでホーム画面に戻る", async ({ page }) => {
  await page.getByText("新しき試練").click();
  await page.getByPlaceholder("例: 微積分").fill("物理");
  await page.getByLabel("決戦の日").fill("2026-12-01");
  await page.getByPlaceholder("例: 微分の練習問題").fill("問題集P1");
  await page.getByText("追加").first().click();
  await page.getByText("登録する").click();
  await page.getByText("物理").click();
  await page.getByText("にげる").click();
  await expect(page.getByText("期末テスト魔王")).toBeVisible();
});

// ── 5. バトル画面にHPバーが表示される ────────────────────
test("バトル画面にHPバーが表示される", async ({ page }) => {
  await page.getByText("新しき試練").click();
  await page.getByPlaceholder("例: 微積分").fill("化学");
  await page.getByLabel("決戦の日").fill("2026-12-01");
  await page.getByPlaceholder("例: 微分の練習問題").fill("元素記号を覚える");
  await page.getByText("追加").first().click();
  await page.getByText("登録する").click();
  await page.getByText("化学").click();
  await expect(page.getByText("HP")).toBeVisible();
});

// ── 6. タスク追加 ─────────────────────────────────────────
test("バトル画面でタスクを追加できる", async ({ page }) => {
  await page.getByText("新しき試練").click();
  await page.getByPlaceholder("例: 微積分").fill("歴史");
  await page.getByLabel("決戦の日").fill("2026-12-01");
  await page.getByPlaceholder("例: 微分の練習問題").fill("教科書を読む");
  await page.getByText("追加").first().click();
  await page.getByText("登録する").click();
  await page.getByText("歴史").click();
  await page.getByText("たたかう").click();
  await page.getByPlaceholder("＋ 新しいタスクを追加").fill("ノートにまとめる");
  await page.keyboard.press("Enter");
  await expect(page.getByText("ノートにまとめる")).toBeVisible();
});
