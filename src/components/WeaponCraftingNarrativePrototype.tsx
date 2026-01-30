import React, { useMemo, useReducer, useState } from "react";

/**
 * Creepy Cuties — Weapon Crafting + Narrative Prototype
 * Single-file React prototype (no external deps).
 *
 * Features
 * - 3 locations: Boss Arena, Sarah's Lab, Sam's Weaponry
 * - 4 sequential bosses with refight support
 * - Drops: token(s) + coins; 2nd Disease kill also grants Wooden Pole (NPC-rank item)
 * - Sarah crafts tokens/rank items (and sells Wound's Feet) via recipes
 * - Sam crafts weapons via recipes
 * - Decomposition: break crafted items back into ingredient items (coins not returned)
 */

// -----------------------------
// Domain
// -----------------------------

type ItemName = string;

type BossId = "wound" | "toxic" | "shiver_fever" | "disease";

type LocationId = "arena" | "sarah" | "sam";

type Recipe = {
  id: string;
  name: string;
  produces: ItemName;
  producesQty?: number;
  coinCost: number;
  requires: Record<ItemName, number>;
  station: LocationId; // where crafting happens
  decomposable?: boolean; // can be decomposed into requires (items only)
};

type Boss = {
  id: BossId;
  name: string;
  unlockAfter?: BossId;
  coinReward: number;
  drops: Record<ItemName, number>;
};

type Relationship = {
  npc: string;
  level: number;
  max: number;
};

const ITEMS = {
  woundFeet: "Wound's Feet",
  toxicTongue: "Toxic's Tongue",
  shiverWing: "Shiver's Wing",
  feverFang: "Fever's Fang",
  diseaseHorn: "Disease's Horn",
  woodenPole: "Wooden Pole",

  spear: "Spear",
  axe: "Axe",
  helbard: "Helbard",
} as const;

const BOSSES: Boss[] = [
  {
    id: "wound",
    name: "Wound",
    coinReward: 180,
    drops: { [ITEMS.woundFeet]: 1 },
  },
  {
    id: "toxic",
    name: "Toxic",
    unlockAfter: "wound",
    coinReward: 240,
    drops: { [ITEMS.toxicTongue]: 1 },
  },
  {
    id: "shiver_fever",
    name: "Shiver & Fever",
    unlockAfter: "toxic",
    coinReward: 320,
    drops: { [ITEMS.shiverWing]: 1, [ITEMS.feverFang]: 1 },
  },
  {
    id: "disease",
    name: "Disease",
    unlockAfter: "shiver_fever",
    coinReward: 420,
    drops: { [ITEMS.diseaseHorn]: 1 },
  },
];

const SARAH_RECIPES: Recipe[] = [
  {
    id: "sarah_buy_wound_feet",
    name: "Buy Wound's Feet",
    produces: ITEMS.woundFeet,
    coinCost: 100,
    requires: {},
    station: "sarah",
    // purchased item doesn't meaningfully decompose
    decomposable: false,
  },
  {
    id: "sarah_craft_wooden_pole",
    name: "Craft Wooden Pole",
    produces: ITEMS.woodenPole,
    coinCost: 300,
    requires: {
      [ITEMS.woundFeet]: 1,
      [ITEMS.shiverWing]: 1,
      [ITEMS.diseaseHorn]: 1,
    },
    station: "sarah",
    decomposable: true,
  },
  {
    id: "sarah_craft_toxic_tongue",
    name: "Craft Toxic's Tongue",
    produces: ITEMS.toxicTongue,
    coinCost: 200,
    requires: { [ITEMS.woundFeet]: 1 },
    station: "sarah",
    decomposable: true,
  },
  {
    id: "sarah_craft_shiver_wing",
    name: "Craft Shiver's Wing",
    produces: ITEMS.shiverWing,
    coinCost: 300,
    requires: { [ITEMS.woundFeet]: 1, [ITEMS.toxicTongue]: 1 },
    station: "sarah",
    decomposable: true,
  },
  {
    id: "sarah_craft_fever_fang",
    name: "Craft Fever's Fang",
    produces: ITEMS.feverFang,
    coinCost: 300,
    requires: { [ITEMS.woundFeet]: 1, [ITEMS.toxicTongue]: 1 },
    station: "sarah",
    decomposable: true,
  },
  {
    id: "sarah_craft_disease_horn",
    name: "Craft Disease's Horn",
    produces: ITEMS.diseaseHorn,
    coinCost: 500,
    requires: {
      [ITEMS.shiverWing]: 1,
      [ITEMS.feverFang]: 1,
      [ITEMS.woundFeet]: 1,
      [ITEMS.toxicTongue]: 1,
    },
    station: "sarah",
    decomposable: true,
  },
];

const SAM_RECIPES: Recipe[] = [
  {
    id: "sam_craft_spear",
    name: "Craft Spear",
    produces: ITEMS.spear,
    coinCost: 400,
    requires: { [ITEMS.woundFeet]: 1, [ITEMS.woodenPole]: 1 },
    station: "sam",
    decomposable: true,
  },
  {
    id: "sam_craft_axe",
    name: "Craft Axe",
    produces: ITEMS.axe,
    coinCost: 500,
    requires: { [ITEMS.diseaseHorn]: 1, [ITEMS.woodenPole]: 1 },
    station: "sam",
    decomposable: true,
  },
  {
    id: "sam_craft_helbard",
    name: "Craft Helbard",
    produces: ITEMS.helbard,
    coinCost: 1200,
    requires: { [ITEMS.spear]: 1, [ITEMS.axe]: 1, [ITEMS.shiverWing]: 1 },
    station: "sam",
    decomposable: true,
  },
];

const ALL_RECIPES = [...SARAH_RECIPES, ...SAM_RECIPES];

// Reverse index for decomposition.
const DECOMPOSE_MAP: Record<ItemName, Recipe> = Object.fromEntries(
  ALL_RECIPES.filter((r) => r.decomposable).map((r) => [r.produces, r])
);

// -----------------------------
// State
// -----------------------------

type GameState = {
  location: LocationId;
  coins: number;
  inventory: Record<ItemName, number>;
  bossKills: Record<BossId, number>; // number of victories
  storyFlags: {
    gotWoodenPoleFromDiseaseSecondKill: boolean;
  };
  relationships: Record<string, Relationship>;
  log: Array<{ t: number; msg: string }>;
};

type Action =
  | { type: "NAV"; location: LocationId }
  | { type: "FIGHT_BOSS"; bossId: BossId }
  | { type: "CRAFT"; recipeId: string }
  | { type: "DECOMPOSE"; item: ItemName }
  | { type: "RESET" };

const initialState: GameState = {
  location: "arena",
  coins: 250,
  inventory: {},
  bossKills: { wound: 0, toxic: 0, shiver_fever: 0, disease: 0 },
  storyFlags: { gotWoodenPoleFromDiseaseSecondKill: false },
  relationships: {
    Sarah: { npc: "Sarah", level: 0, max: 7 },
    Sam: { npc: "Sam", level: 0, max: 7 },
  },
  log: [{ t: Date.now(), msg: "Run started. Wound is available in the Boss Arena." }],
};

function addLog(state: GameState, msg: string): GameState {
  const entry = { t: Date.now(), msg };
  return { ...state, log: [entry, ...state.log].slice(0, 30) };
}

function incItem(inv: Record<ItemName, number>, item: ItemName, qty: number): Record<ItemName, number> {
  const next = { ...inv };
  next[item] = (next[item] ?? 0) + qty;
  if (next[item] <= 0) delete next[item];
  return next;
}

function hasRequirements(state: GameState, recipe: Recipe): boolean {
  if (state.coins < recipe.coinCost) return false;
  for (const [item, qty] of Object.entries(recipe.requires)) {
    if ((state.inventory[item] ?? 0) < qty) return false;
  }
  return true;
}

function unlockStatus(state: GameState, boss: Boss): { unlocked: boolean; reason?: string } {
  if (!boss.unlockAfter) return { unlocked: true };
  const prereqKills = state.bossKills[boss.unlockAfter] ?? 0;
  return prereqKills > 0
    ? { unlocked: true }
    : {
        unlocked: false,
        reason: `Defeat ${BOSSES.find((b) => b.id === boss.unlockAfter)?.name ?? boss.unlockAfter} first.`,
      };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "NAV": {
      return addLog(
        { ...state, location: action.location },
        `Moved to ${action.location === "arena" ? "Boss Arena" : action.location === "sarah" ? "Sarah's Lab" : "Sam's Weaponry"}.`
      );
    }
    case "FIGHT_BOSS": {
      const boss = BOSSES.find((b) => b.id === action.bossId);
      if (!boss) return state;

      const { unlocked, reason } = unlockStatus(state, boss);
      if (!unlocked) return addLog(state, `Can't fight ${boss.name}. ${reason}`);

      // Rewards
      let next = { ...state };
      next.coins += boss.coinReward;

      // Add drops
      for (const [item, qty] of Object.entries(boss.drops)) {
        next.inventory = incItem(next.inventory, item, qty);
      }

      // Track kill count
      const prevKills = next.bossKills[boss.id] ?? 0;
      next.bossKills = { ...next.bossKills, [boss.id]: prevKills + 1 };

      // NPC Rank Item on 2nd Disease kill (simplified scope)
      if (boss.id === "disease" && prevKills + 1 >= 2 && !next.storyFlags.gotWoodenPoleFromDiseaseSecondKill) {
        next.inventory = incItem(next.inventory, ITEMS.woodenPole, 1);
        next.storyFlags = { ...next.storyFlags, gotWoodenPoleFromDiseaseSecondKill: true };

        // Relationship bump: Wooden Pole represents an NPC-rank item (prototype: Sarah)
        const r = next.relationships["Sarah"];
        next.relationships = {
          ...next.relationships,
          Sarah: { ...r, level: Math.min(r.max, r.level + 1) },
        };

        next = addLog(next, `Defeated ${boss.name} again → gained NPC Rank Item: ${ITEMS.woodenPole}. Sarah relationship +1.`);
      }

      // Narrative log
      const dropList = Object.entries(boss.drops)
        .map(([i, q]) => `${i} x${q}`)
        .join(", ");
      next = addLog(next, `Won vs ${boss.name}. +${boss.coinReward} coins. Drops: ${dropList}.`);

      return next;
    }
    case "CRAFT": {
      const recipe = ALL_RECIPES.find((r) => r.id === action.recipeId);
      if (!recipe) return state;

      if (state.location !== recipe.station) {
        return addLog(state, `Can't craft here. Go to ${recipe.station === "sarah" ? "Sarah's Lab" : "Sam's Weaponry"}.`);
      }

      if (!hasRequirements(state, recipe)) {
        return addLog(state, `Missing requirements for ${recipe.name}.`);
      }

      let next = { ...state };
      next.coins -= recipe.coinCost;
      for (const [item, qty] of Object.entries(recipe.requires)) {
        next.inventory = incItem(next.inventory, item, -qty);
      }

      const qtyOut = recipe.producesQty ?? 1;
      const hadBefore = next.inventory[recipe.produces] ?? 0;
      next.inventory = incItem(next.inventory, recipe.produces, qtyOut);

      // Relationship bump: if crafting Wooden Pole and it was not owned before, treat it as rank item gained.
      if (recipe.produces === ITEMS.woodenPole && hadBefore === 0) {
        const r = next.relationships["Sarah"];
        next.relationships = {
          ...next.relationships,
          Sarah: { ...r, level: Math.min(r.max, r.level + 1) },
        };
        next = addLog(next, `Crafted NPC Rank Item: ${ITEMS.woodenPole}. Sarah relationship +1.`);
      }

      return addLog(next, `Crafted ${recipe.produces} (cost: ${recipe.coinCost} coins).`);
    }
    case "DECOMPOSE": {
      const recipe = DECOMPOSE_MAP[action.item];
      if (!recipe) return addLog(state, `Can't decompose ${action.item}. No decomposition recipe defined.`);

      // Can decompose in either Sarah's Lab or Sam's Weaponry
      if (state.location !== "sarah" && state.location !== "sam") {
        return addLog(state, `Decomposition is only available in Sarah's Lab or Sam's Weaponry.`);
      }

      if ((state.inventory[action.item] ?? 0) < 1) {
        return addLog(state, `You don't have ${action.item} to decompose.`);
      }

      let next = { ...state };
      next.inventory = incItem(next.inventory, action.item, -1);

      // Return item requirements only (coins are not returned)
      for (const [reqItem, qty] of Object.entries(recipe.requires)) {
        next.inventory = incItem(next.inventory, reqItem, qty);
      }

      const returned =
        Object.entries(recipe.requires)
          .map(([i, q]) => `${i} x${q}`)
          .join(", ") || "(nothing)";

      return addLog(next, `Decomposed ${action.item} → returned: ${returned}. (Coins not returned)`);
    }
    case "RESET": {
      return { ...initialState, log: [{ t: Date.now(), msg: "State reset." }] };
    }
    default:
      return state;
  }
}

// -----------------------------
// UI helpers
// -----------------------------

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.15)",
        background: "rgba(255,255,255,0.06)",
        fontSize: 12,
      }}
    >
      {children}
    </span>
  );
}

function Button({
  onClick,
  disabled,
  children,
  variant = "primary",
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "danger";
}) {
  const base: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.15)",
    background:
      variant === "ghost"
        ? "transparent"
        : variant === "danger"
        ? "rgba(255, 60, 60, 0.18)"
        : "rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.92)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.45 : 1,
    fontWeight: 650,
    letterSpacing: 0.2,
  };
  return (
    <button onClick={disabled ? undefined : onClick} style={base}>
      {children}
    </button>
  );
}

function Card({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div
      style={{
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(10,10,10,0.55)",
        boxShadow: "0 10px 35px rgba(0,0,0,0.35)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 14px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        <div style={{ fontWeight: 800, letterSpacing: 0.2 }}>{title}</div>
        {right}
      </div>
      <div style={{ padding: 14 }}>{children}</div>
    </div>
  );
}

function ReqLine({ requires, coinCost }: { requires: Record<ItemName, number>; coinCost: number }) {
  const items = Object.entries(requires);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      {items.length === 0 ? <Pill>—</Pill> : items.map(([i, q]) => <Pill key={i}>{i} ×{q}</Pill>)}
      <Pill>Coins ×{coinCost}</Pill>
    </div>
  );
}

function formatBossProgress(kills: number) {
  if (kills <= 0) return "Not fought";
  if (kills === 1) return "Defeated (1×)";
  return `Defeated (${kills}×)`;
}

// -----------------------------
// App
// -----------------------------

export default function WeaponCraftingNarrativePrototype() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const unlockedBosses = useMemo(() => {
    return BOSSES.map((b) => ({ b, ...unlockStatus(state, b) }));
  }, [state]);

  const inventoryList = useMemo(() => {
    const entries = Object.entries(state.inventory)
      .filter(([, q]) => q > 0)
      .sort(([a], [b]) => a.localeCompare(b));
    return entries;
  }, [state.inventory]);

  const decomposableList = useMemo(() => {
    return inventoryList
      .filter(([item]) => Boolean(DECOMPOSE_MAP[item]))
      .map(([item, qty]) => ({ item, qty, recipe: DECOMPOSE_MAP[item] }));
  }, [inventoryList]);

  const [selectedDecomposeItem, setSelectedDecomposeItem] = useState<ItemName | "">("");

  const narrativeStage = useMemo(() => {
    const w = state.bossKills.wound;
    const t = state.bossKills.toxic;
    const sf = state.bossKills.shiver_fever;
    const d = state.bossKills.disease;
    if (d > 0) return "Act I → Disease confronted";
    if (sf > 0) return "Act I → Cold & Fever faced";
    if (t > 0) return "Act I → Toxicity revealed";
    if (w > 0) return "Act I → First wound opened";
    return "Act I → The Arena calls";
  }, [state.bossKills]);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 18,
        color: "rgba(255,255,255,0.92)",
        background:
          "radial-gradient(1200px 700px at 20% 10%, rgba(180,100,255,0.16), transparent 55%), radial-gradient(900px 600px at 80% 0%, rgba(80,200,255,0.14), transparent 55%), radial-gradient(900px 600px at 50% 100%, rgba(255,120,120,0.10), transparent 60%), #050507",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 0.3 }}>Weapon Crafting ↔ Narrative Prototype</div>
            <div style={{ marginTop: 6, opacity: 0.85, maxWidth: 820, lineHeight: 1.35 }}>
              Three places. Four bosses in sequence. Refights for resources. Sarah transforms tokens. Sam forges weapons.
              Decomposition lets you rewind items into their building parts (coins are sunk).
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Pill>
              Coins: <b style={{ marginLeft: 6 }}>{state.coins}</b>
            </Pill>
            <Button variant="danger" onClick={() => dispatch({ type: "RESET" })}>
              Reset
            </Button>
          </div>
        </div>

        <div style={{ height: 14 }} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.35fr 0.9fr",
            gap: 14,
          }}
        >
          {/* Main */}
          <div style={{ display: "grid", gap: 14 }}>
            <Card title="Locations" right={<Pill>{narrativeStage}</Pill>}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Button
                  variant={state.location === "arena" ? "primary" : "ghost"}
                  onClick={() => dispatch({ type: "NAV", location: "arena" })}
                >
                  Boss Arena
                </Button>
                <Button
                  variant={state.location === "sarah" ? "primary" : "ghost"}
                  onClick={() => dispatch({ type: "NAV", location: "sarah" })}
                >
                  Sarah's Lab
                </Button>
                <Button
                  variant={state.location === "sam" ? "primary" : "ghost"}
                  onClick={() => dispatch({ type: "NAV", location: "sam" })}
                >
                  Sam's Weaponry
                </Button>
              </div>
            </Card>

            {state.location === "arena" && (
              <Card title="Boss Arena (sequential unlocks + refights)">
                <div style={{ display: "grid", gap: 12 }}>
                  {unlockedBosses.map(({ b, unlocked, reason }) => {
                    const kills = state.bossKills[b.id] ?? 0;
                    const status = unlocked ? formatBossProgress(kills) : "Locked";
                    return (
                      <div
                        key={b.id}
                        style={{
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: 16,
                          padding: 12,
                          background: "rgba(255,255,255,0.04)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                          <div>
                            <div style={{ fontWeight: 900, fontSize: 16 }}>{b.name}</div>
                            <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <Pill>
                                Status: <b style={{ marginLeft: 6 }}>{status}</b>
                              </Pill>
                              <Pill>
                                Reward: <b style={{ marginLeft: 6 }}>+{b.coinReward} coins</b>
                              </Pill>
                              <Pill>
                                Drops:
                                <b style={{ marginLeft: 6 }}>
                                  {Object.entries(b.drops)
                                    .map(([i, q]) => `${i}×${q}`)
                                    .join(" + ")}
                                </b>
                              </Pill>
                              {b.id === "disease" && (
                                <Pill>
                                  2nd win bonus: <b style={{ marginLeft: 6 }}>{ITEMS.woodenPole}</b>
                                </Pill>
                              )}
                            </div>
                            {!unlocked && reason && <div style={{ marginTop: 8, opacity: 0.8 }}>{reason}</div>}
                          </div>
                          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <Button disabled={!unlocked} onClick={() => dispatch({ type: "FIGHT_BOSS", bossId: b.id })}>
                              Fight
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: 12, opacity: 0.85, lineHeight: 1.35 }}>
                  <b>Narrative hook:</b> each rematch is a deliberate return to the same memory. Tokens are remnants; rank items
                  are trust.
                </div>
              </Card>
            )}

            {state.location === "sarah" && (
              <Card title="Sarah's Lab (transform tokens, craft rank items, decompose)">
                <div style={{ display: "grid", gap: 12 }}>
                  {SARAH_RECIPES.map((r) => {
                    const ok = hasRequirements(state, r);
                    return (
                      <div
                        key={r.id}
                        style={{
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: 16,
                          padding: 12,
                          background: "rgba(255,255,255,0.04)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                          <div>
                            <div style={{ fontWeight: 900 }}>{r.name}</div>
                            <div style={{ marginTop: 8 }}>
                              <ReqLine requires={r.requires} coinCost={r.coinCost} />
                            </div>
                            <div style={{ marginTop: 8, opacity: 0.9 }}>
                              Produces: <b>{r.produces}</b>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <Button disabled={!ok} onClick={() => dispatch({ type: "CRAFT", recipeId: r.id })}>
                              Craft
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ height: 12 }} />

                <div
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.10)",
                    paddingTop: 12,
                  }}
                >
                  <div style={{ fontWeight: 900, marginBottom: 8 }}>Decomposition</div>
                  <div style={{ opacity: 0.85, marginBottom: 10 }}>
                    Break an item into its recipe ingredients. <b>Coins are not returned.</b>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <select
                      value={selectedDecomposeItem}
                      onChange={(e) => setSelectedDecomposeItem(e.target.value as any)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.15)",
                        background: "rgba(0,0,0,0.35)",
                        color: "rgba(255,255,255,0.9)",
                        minWidth: 260,
                      }}
                    >
                      <option value="">Select an item...</option>
                      {decomposableList.map(({ item, qty, recipe }) => (
                        <option key={item} value={item}>
                          {item} (x{qty}) → {Object.entries(recipe.requires)
                            .map(([i, q]) => `${i}×${q}`)
                            .join(" + ")}
                        </option>
                      ))}
                    </select>
                    <Button
                      disabled={!selectedDecomposeItem}
                      onClick={() => {
                        if (!selectedDecomposeItem) return;
                        dispatch({ type: "DECOMPOSE", item: selectedDecomposeItem });
                        setSelectedDecomposeItem("");
                      }}
                    >
                      Decompose
                    </Button>
                  </div>
                </div>

                <div style={{ marginTop: 12, opacity: 0.85, lineHeight: 1.35 }}>
                  <b>Narrative hook:</b> Sarah doesn't "sell" you progress—she teaches you how to reassemble it.
                </div>
              </Card>
            )}

            {state.location === "sam" && (
              <Card title="Sam's Weaponry (forge weapons, decompose)">
                <div style={{ display: "grid", gap: 12 }}>
                  {SAM_RECIPES.map((r) => {
                    const ok = hasRequirements(state, r);
                    return (
                      <div
                        key={r.id}
                        style={{
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: 16,
                          padding: 12,
                          background: "rgba(255,255,255,0.04)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                          <div>
                            <div style={{ fontWeight: 900 }}>{r.name}</div>
                            <div style={{ marginTop: 8 }}>
                              <ReqLine requires={r.requires} coinCost={r.coinCost} />
                            </div>
                            <div style={{ marginTop: 8, opacity: 0.9 }}>
                              Produces: <b>{r.produces}</b>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <Button disabled={!ok} onClick={() => dispatch({ type: "CRAFT", recipeId: r.id })}>
                              Craft
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ height: 12 }} />

                <div
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.10)",
                    paddingTop: 12,
                  }}
                >
                  <div style={{ fontWeight: 900, marginBottom: 8 }}>Decomposition</div>
                  <div style={{ opacity: 0.85, marginBottom: 10 }}>
                    Undo a forged item into its ingredients. <b>Coins are not returned.</b>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <select
                      value={selectedDecomposeItem}
                      onChange={(e) => setSelectedDecomposeItem(e.target.value as any)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.15)",
                        background: "rgba(0,0,0,0.35)",
                        color: "rgba(255,255,255,0.9)",
                        minWidth: 260,
                      }}
                    >
                      <option value="">Select an item...</option>
                      {decomposableList.map(({ item, qty, recipe }) => (
                        <option key={item} value={item}>
                          {item} (x{qty}) → {Object.entries(recipe.requires)
                            .map(([i, q]) => `${i}×${q}`)
                            .join(" + ")}
                        </option>
                      ))}
                    </select>
                    <Button
                      disabled={!selectedDecomposeItem}
                      onClick={() => {
                        if (!selectedDecomposeItem) return;
                        dispatch({ type: "DECOMPOSE", item: selectedDecomposeItem });
                        setSelectedDecomposeItem("");
                      }}
                    >
                      Decompose
                    </Button>
                  </div>
                </div>

                <div style={{ marginTop: 12, opacity: 0.85, lineHeight: 1.35 }}>
                  <b>Narrative hook:</b> Sam turns leftovers into intent—then asks whether you really meant it.
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: "grid", gap: 14 }}>
            <Card title="Inventory">
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Pill>
                    Coins: <b style={{ marginLeft: 6 }}>{state.coins}</b>
                  </Pill>
                  {Object.values(state.relationships).map((r) => (
                    <Pill key={r.npc}>
                      {r.npc} Relationship: <b style={{ marginLeft: 6 }}>{r.level}</b>/{r.max}
                    </Pill>
                  ))}
                </div>

                <div style={{ opacity: 0.8, marginTop: 4 }}>
                  <b>Rank Item (prototype):</b> {ITEMS.woodenPole} (2nd win vs Disease, or crafted in Sarah's Lab)
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.10)", paddingTop: 10 }}>
                  {inventoryList.length === 0 ? (
                    <div style={{ opacity: 0.8 }}>No items yet. Fight Wound or buy tokens in Sarah's Lab.</div>
                  ) : (
                    <div style={{ display: "grid", gap: 8 }}>
                      {inventoryList.map(([item, qty]) => (
                        <div key={item} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                          <div style={{ fontWeight: 750 }}>{item}</div>
                          <Pill>x{qty}</Pill>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card title="Story State">
              <div style={{ display: "grid", gap: 10 }}>
                {BOSSES.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      border: "1px solid rgba(255,255,255,0.10)",
                      borderRadius: 14,
                      padding: 10,
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ fontWeight: 900 }}>{b.name}</div>
                      <Pill>{formatBossProgress(state.bossKills[b.id] ?? 0)}</Pill>
                    </div>
                    <div style={{ marginTop: 8, opacity: 0.85, lineHeight: 1.35 }}>
                      Token(s): <b>{Object.keys(b.drops).join(" + ")}</b>
                      {b.id === "disease" && (
                        <>
                          <br />
                          Second win grants: <b>{ITEMS.woodenPole}</b>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Recent Log">
              <div style={{ display: "grid", gap: 8 }}>
                {state.log.map((e) => (
                  <div key={e.t} style={{ opacity: 0.92, lineHeight: 1.35 }}>
                    <span style={{ opacity: 0.6, marginRight: 10, fontSize: 12 }}>{new Date(e.t).toLocaleTimeString()}</span>
                    {e.msg}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <div style={{ height: 16 }} />

        <div style={{ opacity: 0.7, fontSize: 12, lineHeight: 1.35 }}>
          Prototype assumptions: boss coin rewards are placeholders; decomposition returns only ingredient items (not coins). Only one
          NPC-rank item is modeled: Wooden Pole.
        </div>
      </div>
    </div>
  );
}
