# Creepy Cuties — Weapon Crafting Prototype (Plain JS, No NPM)

This is a **static** React demo that runs with **CDN scripts** (no Node, no npm, no build step).  
It includes:

- **Weapon Crafting ↔ Narrative Prototype** (Boss Arena / Sarah’s Lab / Sam’s Weaponry)
- **Crafting Trees Presentation** (Goal tree / Sourcing tree / Decomposition tree)

## Run locally

Just open `index.html` in a browser.

> Tip: Some browsers block `file://` imports in strict environments. If anything doesn't load, run a tiny local server:
>
> - Python: `python -m http.server 8080`
> - Then open: `http://localhost:8080`

## Deploy to GitHub Pages

1. Create a GitHub repo and push these files.
2. In GitHub: **Settings → Pages**
3. Under **Build and deployment**:
   - **Source:** `Deploy from a branch`
   - **Branch:** `main` (or `master`) and **Folder:** `/ (root)`
4. Save. Your demo will be available at:
   - `https://<username>.github.io/<repo>/`

## Files

- `index.html` — loads React, ReactDOM, Babel, and the app
- `app.jsx` — the full demo (two views)
- `style.css` — minimal global styles

## Notes

- Babel runs in the browser to transform JSX. This is fine for a demo; for production, use a build step.

# Weapon Crafting ↔ Narrative Prototype

This prototype demonstrates a small slice of the **weapon crafting system** and how it connects to the **narrative/relationship system** via **NPC Rank Items**.

---

## Core Concept

- The player moves between **three places**:
  - **Boss Arena**
  - **Sarah’s Lab**
  - **Sam’s Weaponry**
- The player fights **four bosses sequentially** in the Boss Arena.
  - Defeating a boss unlocks the next boss.
  - Previously defeated bosses can be fought again to farm resources.
- Each boss has a **unique droppable token**.
- Some fights can also yield **NPC Rank Items** (on repeat defeats).
  - NPC Rank Items represent relationship milestones.
  - Obtaining them increases the player’s relationship level with the relevant NPC.

---

## Locations

### 1) Boss Arena
- Hosts sequential boss fights.
- Allows refights for resource farming.
- Victory rewards:
  1. Boss token(s)
  2. Coins
  3. NPC Rank Item *(only if this is the second time defeating that boss)*

### 2) Sarah’s Lab
- Allows the player to:
  - **Buy/Craft tokens** using recipes + coins
  - **Craft NPC Rank Items** (prototype includes Wooden Pole)
  - **Decompose** items/tokens back into their ingredient items *(coins are sunk)*

### 3) Sam’s Weaponry
- Allows the player to:
  - **Craft weapons** using tokens/items + coins
  - **Decompose** crafted weapons back into their ingredient items *(coins are sunk)*

---

## Boss Sequence & Token Drops

Boss fights unlock sequentially:

1. **Wound** → drops **Wound’s Feet**
2. **Toxic** → drops **Toxic’s Tongue**
3. **Shiver & Fever** *(two bosses in one fight)* → drops:
   - **Shiver’s Wing**
   - **Fever’s Fang**
4. **Disease** → drops **Disease’s Horn**

---

## Refights & NPC Rank Items (Prototype Scope)

- The **first** time you defeat a boss, you receive:
  - Boss token(s) + coins
- The **second** time you defeat a boss, you receive:
  - Boss token(s) + coins + **NPC Rank Item**

### NPC Rank Item in this prototype
- **Wooden Pole**
  - Obtained after defeating **Disease** for the **second time**

---

## Rewards After a Boss Defeat

After winning a boss fight, the player receives:

1. The boss’s unique droppable token(s)
2. Coins
3. An NPC Rank Item *(only on the second defeat of that boss)*

---

## Sam’s Weapon Crafting Recipes

Sam crafts three weapons:

1. **Spear**
   - **Wound’s Feet** + **Wooden Pole** + **400 coins**
2. **Axe**
   - **Disease’s Horn** + **Wooden Pole** + **500 coins**
3. **Helbard**
   - **Spear** + **Axe** + **Shiver’s Wing** + **1200 coins**

---

## Sarah’s Lab Recipes (Tokens & Rank Items)

Sarah can buy/craft tokens and rank items using coins:

1. **Wound’s Feet**
   - **100 coins**
2. **Wooden Pole**
   - **Wound’s Feet** + **Shiver’s Wing** + **Disease’s Horn** + **300 coins**
3. **Toxic’s Tongue**
   - **Wound’s Feet** + **200 coins**
4. **Shiver’s Wing**
   - **Wound’s Feet** + **Toxic’s Tongue** + **300 coins**
5. **Fever’s Fang**
   - **Wound’s Feet** + **Toxic’s Tongue** + **300 coins**
6. **Disease’s Horn**
   - **Shiver’s Wing** + **Fever’s Fang** + **Wound’s Feet** + **Toxic’s Tongue** + **500 coins**

✅ This means the player can obtain **tokens** and even **NPC Rank Items** using **coins**, not only boss drops.

---

## Decomposition

**Decomposition** allows the player to break an item/token into its **ingredient items** based on its recipe.

- Decomposition can be performed in:
  - **Sarah’s Lab**
  - **Sam’s Weaponry**
- Coins are **not refunded**
  - Decomposition returns **only the ingredient items**
  - Coins act as an economy sink

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
