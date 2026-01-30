# Creepy Cuties — Weapon Crafting Prototype (GitHub Pages)

A small, **GitHub Pages-hostable** React demo that showcases:

- The **Weapon Crafting ↔ Narrative Prototype** (Boss Arena / Sarah’s Lab / Sam’s Weaponry)
- A **Tree Presentation** (goal dependencies, sourcing paths, decomposition)

Built with **Vite + React + TypeScript**.

---

## Demo Sections

The app has two views:

1. **Prototype**
   - Boss Arena: sequential boss unlocks, refights, drops + coins, Disease 2nd win grants **Wooden Pole**
   - Sarah’s Lab: token/item crafting + decomposition
   - Sam’s Weaponry: weapon crafting + decomposition

2. **Trees**
   - Slide-style presentation of:
     - Helbard Goal Tree
     - Resource Sourcing Tree
     - Decomposition Tree

---

## Local Development

### Requirements

- Node.js 18+ (Node 20 recommended)

### Run

```bash
npm install
npm run dev
```

Open the printed local URL.

### Build

```bash
npm run build
npm run preview
```

---

## Deploy to GitHub Pages

This repo includes a GitHub Actions workflow that builds and deploys the `dist/` folder to GitHub Pages.

### 1) Create a GitHub repo

- Create a new repo (e.g. `cc-crafting-prototype`)
- Push this project to the repo’s `main` branch

### 2) Enable GitHub Pages via Actions

In GitHub:

- **Settings → Pages**
- Under **Build and deployment** choose:
  - **Source:** `GitHub Actions`

### 3) Push to `main`

Any push to `main` triggers deployment.

After the workflow finishes, your site will be available at:

- `https://<username>.github.io/<repo>/`

---

## GitHub Pages Base Path (important)

GitHub Pages serves project sites under `/<repo>/`.

This project automatically detects the repo name in CI and sets Vite’s `base` path accordingly in `vite.config.ts`:

- Local dev: base is `/`
- GitHub Actions build: base becomes `/<repo>/`

So you usually **do not need** to edit anything.

---

## Intended Gameplay Loop

1. Go to the **Boss Arena**
2. Defeat bosses to get:
   - Tokens
   - Coins
   - NPC Rank Items *(on second wins)*
3. Visit **Sarah’s Lab** to:
   - Buy/craft missing tokens or Wooden Pole
   - Decompose items if needed
4. Visit **Sam’s Weaponry** to:
   - Craft weapons (Spear / Axe / Helbard)
   - Decompose weapons if needed
5. Repeat fights and crafting to progress both:
   - **combat power** (weapons)
   - **narrative relationships** (NPC Rank Items)


#### Tech Doc:
# Creepy Cuties — Weapon Crafting Prototype (GitHub Pages)

A small, **GitHub Pages-hostable** React demo that showcases:

- The **Weapon Crafting ↔ Narrative Prototype** (Boss Arena / Sarah’s Lab / Sam’s Weaponry)
- A **Tree Presentation** (goal dependencies, sourcing paths, decomposition)

Built with **Vite + React + TypeScript**.

---

## Demo Sections

The app has two views:

1. **Prototype**
   - Boss Arena: sequential boss unlocks, refights, drops + coins, Disease 2nd win grants **Wooden Pole**
   - Sarah’s Lab: token/item crafting + decomposition
   - Sam’s Weaponry: weapon crafting + decomposition

2. **Trees**
   - Slide-style presentation of:
     - Helbard Goal Tree
     - Resource Sourcing Tree
     - Decomposition Tree

---

## Local Development

### Requirements

- Node.js 18+ (Node 20 recommended)

### Run

```bash
npm install
npm run dev
```

Open the printed local URL.

### Build

```bash
npm run build
npm run preview
```

---

## Deploy to GitHub Pages

This repo includes a GitHub Actions workflow that builds and deploys the `dist/` folder to GitHub Pages.

### 1) Create a GitHub repo

- Create a new repo (e.g. `cc-crafting-prototype`)
- Push this project to the repo’s `main` branch

### 2) Enable GitHub Pages via Actions

In GitHub:

- **Settings → Pages**
- Under **Build and deployment** choose:
  - **Source:** `GitHub Actions`

### 3) Push to `main`

Any push to `main` triggers deployment.

After the workflow finishes, your site will be available at:

- `https://<username>.github.io/<repo>/`

---

## GitHub Pages Base Path (important)

GitHub Pages serves project sites under `/<repo>/`.

This project automatically detects the repo name in CI and sets Vite’s `base` path accordingly in `vite.config.ts`:

- Local dev: base is `/`
- GitHub Actions build: base becomes `/<repo>/`

So you usually **do not need** to edit anything.

---

## Project Structure

```
.
├─ .github/workflows/deploy.yml
├─ index.html
├─ src/
│  ├─ App.tsx
│  ├─ main.tsx
│  ├─ styles.css
│  └─ components/
│     ├─ WeaponCraftingNarrativePrototype.tsx
│     └─ CraftingTreesPresentation.tsx
├─ vite.config.ts
├─ tsconfig*.json
└─ package.json
```

---

## Notes

- Boss coin rewards are **prototype placeholders**.
- **Decomposition returns only items** (ingredient tokens/items). Coins are **not** returned.
- Only one NPC Rank Item is modeled: **Wooden Pole**.
