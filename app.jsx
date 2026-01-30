const { useMemo, useReducer, useState } = React;

/**
 * Creepy Cuties — Weapon Crafting + Narrative Prototype
 * + Crafting Trees Presentation
 *
 * Plain JS + React via CDN (no npm, no build).
 */

// -----------------------------
// Shared UI helpers
// -----------------------------

function Pill({ children }) {
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

function Button({ onClick, disabled, children, variant = "primary" }) {
  const base = {
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
    fontWeight: 750,
    letterSpacing: 0.2,
  };
  return (
    <button onClick={disabled ? undefined : onClick} style={base}>
      {children}
    </button>
  );
}

function Card({ title, children, right }) {
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
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontWeight: 900, letterSpacing: 0.2 }}>{title}</div>
        {right}
      </div>
      <div style={{ padding: 14 }}>{children}</div>
    </div>
  );
}

function ReqLine({ requires, coinCost }) {
  const items = Object.entries(requires);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      {items.length === 0 ? <Pill>—</Pill> : items.map(([i, q]) => <Pill key={i}>{i} ×{q}</Pill>)}
      <Pill>Coins ×{coinCost}</Pill>
    </div>
  );
}

// -----------------------------
// Weapon Crafting Prototype
// -----------------------------

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
};

const BOSSES = [
  { id: "wound", name: "Wound", coinReward: 180, drops: { [ITEMS.woundFeet]: 1 } },
  { id: "toxic", name: "Toxic", unlockAfter: "wound", coinReward: 240, drops: { [ITEMS.toxicTongue]: 1 } },
  {
    id: "shiver_fever",
    name: "Shiver & Fever",
    unlockAfter: "toxic",
    coinReward: 320,
    drops: { [ITEMS.shiverWing]: 1, [ITEMS.feverFang]: 1 },
  },
  { id: "disease", name: "Disease", unlockAfter: "shiver_fever", coinReward: 420, drops: { [ITEMS.diseaseHorn]: 1 } },
];

const SARAH_RECIPES = [
  { id: "sarah_buy_wound_feet", name: "Buy Wound's Feet", produces: ITEMS.woundFeet, coinCost: 100, requires: {}, station: "sarah", decomposable: false },
  {
    id: "sarah_craft_wooden_pole",
    name: "Craft Wooden Pole",
    produces: ITEMS.woodenPole,
    coinCost: 300,
    requires: { [ITEMS.woundFeet]: 1, [ITEMS.shiverWing]: 1, [ITEMS.diseaseHorn]: 1 },
    station: "sarah",
    decomposable: true,
  },
  { id: "sarah_craft_toxic_tongue", name: "Craft Toxic's Tongue", produces: ITEMS.toxicTongue, coinCost: 200, requires: { [ITEMS.woundFeet]: 1 }, station: "sarah", decomposable: true },
  { id: "sarah_craft_shiver_wing", name: "Craft Shiver's Wing", produces: ITEMS.shiverWing, coinCost: 300, requires: { [ITEMS.woundFeet]: 1, [ITEMS.toxicTongue]: 1 }, station: "sarah", decomposable: true },
  { id: "sarah_craft_fever_fang", name: "Craft Fever's Fang", produces: ITEMS.feverFang, coinCost: 300, requires: { [ITEMS.woundFeet]: 1, [ITEMS.toxicTongue]: 1 }, station: "sarah", decomposable: true },
  {
    id: "sarah_craft_disease_horn",
    name: "Craft Disease's Horn",
    produces: ITEMS.diseaseHorn,
    coinCost: 500,
    requires: { [ITEMS.shiverWing]: 1, [ITEMS.feverFang]: 1, [ITEMS.woundFeet]: 1, [ITEMS.toxicTongue]: 1 },
    station: "sarah",
    decomposable: true,
  },
];

const SAM_RECIPES = [
  { id: "sam_craft_spear", name: "Craft Spear", produces: ITEMS.spear, coinCost: 400, requires: { [ITEMS.woundFeet]: 1, [ITEMS.woodenPole]: 1 }, station: "sam", decomposable: true },
  { id: "sam_craft_axe", name: "Craft Axe", produces: ITEMS.axe, coinCost: 500, requires: { [ITEMS.diseaseHorn]: 1, [ITEMS.woodenPole]: 1 }, station: "sam", decomposable: true },
  { id: "sam_craft_helbard", name: "Craft Helbard", produces: ITEMS.helbard, coinCost: 1200, requires: { [ITEMS.spear]: 1, [ITEMS.axe]: 1, [ITEMS.shiverWing]: 1 }, station: "sam", decomposable: true },
];

const ALL_RECIPES = [...SARAH_RECIPES, ...SAM_RECIPES];
const DECOMPOSE_MAP = Object.fromEntries(ALL_RECIPES.filter((r) => r.decomposable).map((r) => [r.produces, r]));

const initialState = {
  location: "arena",
  coins: 250,
  inventory: {},
  bossKills: { wound: 0, toxic: 0, shiver_fever: 0, disease: 0 },
  storyFlags: { gotWoodenPoleFromDiseaseSecondKill: false },
  relationships: { Sarah: { npc: "Sarah", level: 0, max: 7 }, Sam: { npc: "Sam", level: 0, max: 7 } },
  log: [{ t: Date.now(), msg: "Run started. Wound is available in the Boss Arena." }],
};

function addLog(state, msg) {
  const entry = { t: Date.now(), msg };
  return { ...state, log: [entry, ...state.log].slice(0, 30) };
}

function incItem(inv, item, qty) {
  const next = { ...inv };
  next[item] = (next[item] ?? 0) + qty;
  if (next[item] <= 0) delete next[item];
  return next;
}

function hasRequirements(state, recipe) {
  if (state.coins < recipe.coinCost) return false;
  for (const [item, qty] of Object.entries(recipe.requires)) {
    if ((state.inventory[item] ?? 0) < qty) return false;
  }
  return true;
}

function unlockStatus(state, boss) {
  if (!boss.unlockAfter) return { unlocked: true };
  const prereqKills = state.bossKills[boss.unlockAfter] ?? 0;
  return prereqKills > 0
    ? { unlocked: true }
    : { unlocked: false, reason: `Defeat ${BOSSES.find((b) => b.id === boss.unlockAfter)?.name ?? boss.unlockAfter} first.` };
}

function formatBossProgress(kills) {
  if (kills <= 0) return "Not fought";
  if (kills === 1) return "Defeated (1×)";
  return `Defeated (${kills}×)`;
}

function reducer(state, action) {
  switch (action.type) {
    case "NAV":
      return addLog({ ...state, location: action.location }, `Moved to ${action.location === "arena" ? "Boss Arena" : action.location === "sarah" ? "Sarah's Lab" : "Sam's Weaponry"}.`);
    case "FIGHT_BOSS": {
      const boss = BOSSES.find((b) => b.id === action.bossId);
      if (!boss) return state;

      const { unlocked, reason } = unlockStatus(state, boss);
      if (!unlocked) return addLog(state, `Can't fight ${boss.name}. ${reason}`);

      let next = { ...state };
      next.coins += boss.coinReward;

      for (const [item, qty] of Object.entries(boss.drops)) next.inventory = incItem(next.inventory, item, qty);

      const prevKills = next.bossKills[boss.id] ?? 0;
      next.bossKills = { ...next.bossKills, [boss.id]: prevKills + 1 };

      // NPC Rank Item on 2nd Disease win (prototype scope)
      if (boss.id === "disease" && prevKills + 1 >= 2 && !next.storyFlags.gotWoodenPoleFromDiseaseSecondKill) {
        next.inventory = incItem(next.inventory, ITEMS.woodenPole, 1);
        next.storyFlags = { ...next.storyFlags, gotWoodenPoleFromDiseaseSecondKill: true };

        // relationship bump (prototype: Sarah)
        const r = next.relationships["Sarah"];
        next.relationships = { ...next.relationships, Sarah: { ...r, level: Math.min(r.max, r.level + 1) } };

        next = addLog(next, `Defeated ${boss.name} again → gained NPC Rank Item: ${ITEMS.woodenPole}. Sarah relationship +1.`);
      }

      const dropList = Object.entries(boss.drops).map(([i, q]) => `${i} x${q}`).join(", ");
      next = addLog(next, `Won vs ${boss.name}. +${boss.coinReward} coins. Drops: ${dropList}.`);
      return next;
    }
    case "CRAFT": {
      const recipe = ALL_RECIPES.find((r) => r.id === action.recipeId);
      if (!recipe) return state;

      if (state.location !== recipe.station) return addLog(state, `Can't craft here. Go to ${recipe.station === "sarah" ? "Sarah's Lab" : "Sam's Weaponry"}.`);
      if (!hasRequirements(state, recipe)) return addLog(state, `Missing requirements for ${recipe.name}.`);

      let next = { ...state };
      next.coins -= recipe.coinCost;
      for (const [item, qty] of Object.entries(recipe.requires)) next.inventory = incItem(next.inventory, item, -qty);

      const hadBefore = next.inventory[recipe.produces] ?? 0;
      next.inventory = incItem(next.inventory, recipe.produces, 1);

      if (recipe.produces === ITEMS.woodenPole && hadBefore === 0) {
        const r = next.relationships["Sarah"];
        next.relationships = { ...next.relationships, Sarah: { ...r, level: Math.min(r.max, r.level + 1) } };
        next = addLog(next, `Crafted NPC Rank Item: ${ITEMS.woodenPole}. Sarah relationship +1.`);
      }

      return addLog(next, `Crafted ${recipe.produces} (cost: ${recipe.coinCost} coins).`);
    }
    case "DECOMPOSE": {
      const recipe = DECOMPOSE_MAP[action.item];
      if (!recipe) return addLog(state, `Can't decompose ${action.item}. No decomposition recipe defined.`);
      if (state.location !== "sarah" && state.location !== "sam") return addLog(state, `Decomposition is only available in Sarah's Lab or Sam's Weaponry.`);
      if ((state.inventory[action.item] ?? 0) < 1) return addLog(state, `You don't have ${action.item} to decompose.`);

      let next = { ...state };
      next.inventory = incItem(next.inventory, action.item, -1);
      for (const [reqItem, qty] of Object.entries(recipe.requires)) next.inventory = incItem(next.inventory, reqItem, qty);

      const returned = Object.entries(recipe.requires).map(([i, q]) => `${i} x${q}`).join(", ") || "(nothing)";
      return addLog(next, `Decomposed ${action.item} → returned: ${returned}. (Coins not returned)`);
    }
    case "RESET":
      return { ...initialState, log: [{ t: Date.now(), msg: "State reset." }] };
    default:
      return state;
  }
}

function WeaponCraftingNarrativePrototype() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const unlockedBosses = useMemo(() => BOSSES.map((b) => ({ b, ...unlockStatus(state, b) })), [state]);
  const inventoryList = useMemo(() => Object.entries(state.inventory).filter(([, q]) => q > 0).sort(([a], [b]) => a.localeCompare(b)), [state.inventory]);
  const decomposableList = useMemo(() => inventoryList.filter(([item]) => Boolean(DECOMPOSE_MAP[item])).map(([item, qty]) => ({ item, qty, recipe: DECOMPOSE_MAP[item] })), [inventoryList]);
  const [selectedDecomposeItem, setSelectedDecomposeItem] = useState("");

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
            <Pill>Coins: <b style={{ marginLeft: 6 }}>{state.coins}</b></Pill>
            <Button variant="danger" onClick={() => dispatch({ type: "RESET" })}>Reset</Button>
          </div>
        </div>

        <div style={{ height: 14 }} />

        <div style={{ display: "grid", gridTemplateColumns: "1.35fr 0.9fr", gap: 14 }}>
          {/* Main */}
          <div style={{ display: "grid", gap: 14 }}>
            <Card title="Locations" right={<Pill>{narrativeStage}</Pill>}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Button variant={state.location === "arena" ? "primary" : "ghost"} onClick={() => dispatch({ type: "NAV", location: "arena" })}>
                  Boss Arena
                </Button>
                <Button variant={state.location === "sarah" ? "primary" : "ghost"} onClick={() => dispatch({ type: "NAV", location: "sarah" })}>
                  Sarah's Lab
                </Button>
                <Button variant={state.location === "sam" ? "primary" : "ghost"} onClick={() => dispatch({ type: "NAV", location: "sam" })}>
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
                      <div key={b.id} style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: 12, background: "rgba(255,255,255,0.04)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                          <div>
                            <div style={{ fontWeight: 900, fontSize: 16 }}>{b.name}</div>
                            <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <Pill>Status: <b style={{ marginLeft: 6 }}>{status}</b></Pill>
                              <Pill>Reward: <b style={{ marginLeft: 6 }}>+{b.coinReward} coins</b></Pill>
                              <Pill>
                                Drops:
                                <b style={{ marginLeft: 6 }}>
                                  {Object.entries(b.drops).map(([i, q]) => `${i}×${q}`).join(" + ")}
                                </b>
                              </Pill>
                              {b.id === "disease" && (
                                <Pill>2nd win bonus: <b style={{ marginLeft: 6 }}>{ITEMS.woodenPole}</b></Pill>
                              )}
                            </div>
                            {!unlocked && reason && <div style={{ marginTop: 8, opacity: 0.8 }}>{reason}</div>}
                          </div>
                          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <Button disabled={!unlocked} onClick={() => dispatch({ type: "FIGHT_BOSS", bossId: b.id })}>Fight</Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: 12, opacity: 0.85, lineHeight: 1.35 }}>
                  <b>Narrative hook:</b> each rematch is a deliberate return to the same memory. Tokens are remnants; rank items are trust.
                </div>
              </Card>
            )}

            {state.location === "sarah" && (
              <Card title="Sarah's Lab (transform tokens, craft rank items, decompose)">
                <div style={{ display: "grid", gap: 12 }}>
                  {SARAH_RECIPES.map((r) => {
                    const ok = hasRequirements(state, r);
                    return (
                      <div key={r.id} style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: 12, background: "rgba(255,255,255,0.04)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                          <div>
                            <div style={{ fontWeight: 900 }}>{r.name}</div>
                            <div style={{ marginTop: 8 }}><ReqLine requires={r.requires} coinCost={r.coinCost} /></div>
                            <div style={{ marginTop: 8, opacity: 0.9 }}>Produces: <b>{r.produces}</b></div>
                          </div>
                          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <Button disabled={!ok} onClick={() => dispatch({ type: "CRAFT", recipeId: r.id })}>Craft</Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ height: 12 }} />

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.10)", paddingTop: 12 }}>
                  <div style={{ fontWeight: 900, marginBottom: 8 }}>Decomposition</div>
                  <div style={{ opacity: 0.85, marginBottom: 10 }}>Break an item into its recipe ingredients. <b>Coins are not returned.</b></div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <select
                      value={selectedDecomposeItem}
                      onChange={(e) => setSelectedDecomposeItem(e.target.value)}
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
                          {item} (x{qty}) → {Object.entries(recipe.requires).map(([i, q]) => `${i}×${q}`).join(" + ")}
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
                  <b>Narrative hook:</b> Sarah doesn't \"sell\" you progress—she teaches you how to reassemble it.
                </div>
              </Card>
            )}

            {state.location === "sam" && (
              <Card title="Sam's Weaponry (forge weapons, decompose)">
                <div style={{ display: "grid", gap: 12 }}>
                  {SAM_RECIPES.map((r) => {
                    const ok = hasRequirements(state, r);
                    return (
                      <div key={r.id} style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: 12, background: "rgba(255,255,255,0.04)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                          <div>
                            <div style={{ fontWeight: 900 }}>{r.name}</div>
                            <div style={{ marginTop: 8 }}><ReqLine requires={r.requires} coinCost={r.coinCost} /></div>
                            <div style={{ marginTop: 8, opacity: 0.9 }}>Produces: <b>{r.produces}</b></div>
                          </div>
                          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <Button disabled={!ok} onClick={() => dispatch({ type: "CRAFT", recipeId: r.id })}>Craft</Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ height: 12 }} />

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.10)", paddingTop: 12 }}>
                  <div style={{ fontWeight: 900, marginBottom: 8 }}>Decomposition</div>
                  <div style={{ opacity: 0.85, marginBottom: 10 }}>Undo a forged item into its ingredients. <b>Coins are not returned.</b></div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <select
                      value={selectedDecomposeItem}
                      onChange={(e) => setSelectedDecomposeItem(e.target.value)}
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
                          {item} (x{qty}) → {Object.entries(recipe.requires).map(([i, q]) => `${i}×${q}`).join(" + ")}
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
                  <Pill>Coins: <b style={{ marginLeft: 6 }}>{state.coins}</b></Pill>
                  {Object.values(state.relationships).map((r) => (
                    <Pill key={r.npc}>{r.npc} Relationship: <b style={{ marginLeft: 6 }}>{r.level}</b>/{r.max}</Pill>
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
                  <div key={b.id} style={{ border: "1px solid rgba(255,255,255,0.10)", borderRadius: 14, padding: 10, background: "rgba(255,255,255,0.03)" }}>
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
          Prototype assumptions: boss coin rewards are placeholders; decomposition returns only ingredient items (not coins). Only one NPC-rank item is modeled: Wooden Pole.
        </div>
      </div>
    </div>
  );
}

// -----------------------------
// Crafting Trees Presentation
// -----------------------------

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function Chevron({ open }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 18,
        textAlign: "center",
        transform: open ? "rotate(90deg)" : "rotate(0deg)",
        transition: "transform 120ms ease",
        opacity: 0.85,
      }}
    >
      ▶
    </span>
  );
}

function Tree({ root, defaultOpenDepth = 2 }) {
  const [open, setOpen] = useState({});

  const isOpen = (id, depth) => {
    const v = open[id];
    if (typeof v === "boolean") return v;
    return depth < defaultOpenDepth;
  };

  const toggle = (id) => setOpen((p) => ({ ...p, [id]: !p[id] }));

  const renderNode = (node, depth, isLast, ancestorsLast) => {
    const hasChildren = (node.children?.length ?? 0) > 0;
    const nodeOpen = hasChildren ? isOpen(node.id, depth) : false;

    const gutter = (
      <div style={{ display: "flex", alignItems: "stretch" }}>
        {ancestorsLast.map((aLast, idx) => (
          <div
            key={idx}
            style={{
              width: 20,
              borderLeft: aLast ? "none" : "2px solid rgba(255,255,255,0.12)",
            }}
          />
        ))}
        <div style={{ width: 20, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              borderLeft: isLast ? "none" : "2px solid rgba(255,255,255,0.12)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 14,
              width: 18,
              borderTop: "2px solid rgba(255,255,255,0.12)",
            }}
          />
        </div>
      </div>
    );

    return (
      <div key={node.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 10 }}>
        {depth === 0 ? <div /> : gutter}

        <div>
          <div
            onClick={hasChildren ? () => toggle(node.id) : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 10px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              cursor: hasChildren ? "pointer" : "default",
            }}
          >
            {hasChildren ? <Chevron open={nodeOpen} /> : <span style={{ width: 18 }} />}

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontWeight: 900 }}>{node.title}</div>
              {node.badge && <Pill>{node.badge}</Pill>}
              {node.subtitle && <span style={{ opacity: 0.78 }}>{node.subtitle}</span>}
            </div>
          </div>

          {hasChildren && nodeOpen && (
            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              {node.children.map((c, idx) => renderNode(c, depth + 1, idx === node.children.length - 1, [...ancestorsLast, isLast]))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return <div style={{ display: "grid", gap: 10 }}>{renderNode(root, 0, true, [])}</div>;
}

const goalTree = {
  id: "goal_helbard",
  title: "Goal: Helbard",
  badge: "Sam’s Weaponry",
  subtitle: "The top-level crafting dependency chain",
  children: [
    { id: "goal_req_spear", title: "Spear", badge: "Craft", children: [
      { id: "spear_req_woundfeet", title: "Wound’s Feet", badge: "Token" },
      { id: "spear_req_pole", title: "Wooden Pole", badge: "NPC Rank Item" },
      { id: "spear_req_coins", title: "400 Coins", badge: "Cost" },
    ]},
    { id: "goal_req_axe", title: "Axe", badge: "Craft", children: [
      { id: "axe_req_horn", title: "Disease’s Horn", badge: "Token" },
      { id: "axe_req_pole", title: "Wooden Pole", badge: "NPC Rank Item" },
      { id: "axe_req_coins", title: "500 Coins", badge: "Cost" },
    ]},
    { id: "goal_req_shiverwing", title: "Shiver’s Wing", badge: "Token" },
    { id: "goal_req_helbard_coins", title: "1200 Coins", badge: "Cost" },
  ],
};

const resourceSourcingTree = {
  id: "source_root",
  title: "Resource Sourcing",
  subtitle: "Where each dependency can come from (drops vs Sarah crafts)",
  children: [
    { id: "src_woundfeet", title: "Wound’s Feet", badge: "Token", children: [
      { id: "src_woundfeet_drop", title: "Boss Drop: defeat Wound" },
      { id: "src_woundfeet_buy", title: "Sarah: buy for 100 coins" },
    ]},
    { id: "src_toxictongue", title: "Toxic’s Tongue", badge: "Token", children: [
      { id: "src_toxictongue_drop", title: "Boss Drop: defeat Toxic" },
      { id: "src_toxictongue_craft", title: "Sarah: craft (Wound’s Feet + 200 coins)" },
    ]},
    { id: "src_shiverwing", title: "Shiver’s Wing", badge: "Token", children: [
      { id: "src_shiverwing_drop", title: "Boss Drop: defeat Shiver & Fever" },
      { id: "src_shiverwing_craft", title: "Sarah: craft (Wound’s Feet + Toxic’s Tongue + 300 coins)" },
    ]},
    { id: "src_feverfang", title: "Fever’s Fang", badge: "Token", children: [
      { id: "src_feverfang_drop", title: "Boss Drop: defeat Shiver & Fever" },
      { id: "src_feverfang_craft", title: "Sarah: craft (Wound’s Feet + Toxic’s Tongue + 300 coins)" },
    ]},
    { id: "src_diseasehorn", title: "Disease’s Horn", badge: "Token", children: [
      { id: "src_diseasehorn_drop", title: "Boss Drop: defeat Disease" },
      { id: "src_diseasehorn_craft", title: "Sarah: craft", subtitle: "(Shiver’s Wing + Fever’s Fang + Wound’s Feet + Toxic’s Tongue + 500 coins)" },
    ]},
    { id: "src_woodenpole", title: "Wooden Pole", badge: "NPC Rank Item", children: [
      { id: "src_pole_drop", title: "Drop Rule: defeat Disease for the 2nd time" },
      { id: "src_pole_craft", title: "Sarah: craft", subtitle: "(Wound’s Feet + Shiver’s Wing + Disease’s Horn + 300 coins)" },
    ]},
    { id: "src_weapons", title: "Weapons (Sam)", badge: "Forge", children: [
      { id: "src_spear", title: "Spear = Wound’s Feet + Wooden Pole + 400 coins" },
      { id: "src_axe", title: "Axe = Disease’s Horn + Wooden Pole + 500 coins" },
      { id: "src_helbard", title: "Helbard = Spear + Axe + Shiver’s Wing + 1200 coins" },
    ]},
  ],
};

const decompositionTree = {
  id: "decomp_root",
  title: "Decomposition (Reverse Dependencies)",
  subtitle: "Break an item into its ingredient items; coins are not returned",
  children: [
    { id: "decomp_helbard", title: "Decompose Helbard", badge: "Return", children: [
      { id: "decomp_helbard_spear", title: "Spear" },
      { id: "decomp_helbard_axe", title: "Axe" },
      { id: "decomp_helbard_shiver", title: "Shiver’s Wing" },
    ]},
    { id: "decomp_spear", title: "Decompose Spear", badge: "Return", children: [
      { id: "decomp_spear_wound", title: "Wound’s Feet" },
      { id: "decomp_spear_pole", title: "Wooden Pole" },
    ]},
    { id: "decomp_axe", title: "Decompose Axe", badge: "Return", children: [
      { id: "decomp_axe_horn", title: "Disease’s Horn" },
      { id: "decomp_axe_pole", title: "Wooden Pole" },
    ]},
    { id: "decomp_horn", title: "Decompose Disease’s Horn", badge: "Return", children: [
      { id: "decomp_horn_shiver", title: "Shiver’s Wing" },
      { id: "decomp_horn_fever", title: "Fever’s Fang" },
      { id: "decomp_horn_wound", title: "Wound’s Feet" },
      { id: "decomp_horn_toxic", title: "Toxic’s Tongue" },
    ]},
    { id: "decomp_shiver", title: "Decompose Shiver’s Wing", badge: "Return", children: [
      { id: "decomp_shiver_wound", title: "Wound’s Feet" },
      { id: "decomp_shiver_toxic", title: "Toxic’s Tongue" },
    ]},
    { id: "decomp_fever", title: "Decompose Fever’s Fang", badge: "Return", children: [
      { id: "decomp_fever_wound", title: "Wound’s Feet" },
      { id: "decomp_fever_toxic", title: "Toxic’s Tongue" },
    ]},
    { id: "decomp_toxic", title: "Decompose Toxic’s Tongue", badge: "Return", children: [
      { id: "decomp_toxic_wound", title: "Wound’s Feet" },
    ]},
    { id: "decomp_pole", title: "Decompose Wooden Pole", badge: "Return", children: [
      { id: "decomp_pole_wound", title: "Wound’s Feet" },
      { id: "decomp_pole_shiver", title: "Shiver’s Wing" },
      { id: "decomp_pole_horn", title: "Disease’s Horn" },
    ]},
  ],
};

function CraftingTreesPresentation() {
  const slides = useMemo(() => ([
    { id: "slide_goal", title: "Helbard Goal Tree", kicker: "What you must have to craft Helbard (Sam’s Weaponry)", tree: goalTree, defaultOpenDepth: 3,
      notes: "Use this slide for explaining player intent: Helbard is a composition of past victories (Spear + Axe + Shiver’s Wing)." },
    { id: "slide_sourcing", title: "Resource Sourcing Tree", kicker: "Drops vs Sarah craft/buy paths", tree: resourceSourcingTree, defaultOpenDepth: 2,
      notes: "Clarifies optionality: players can grind bosses or convert coins into progress through Sarah’s transformations." },
    { id: "slide_decompose", title: "Decomposition Tree", kicker: "Reverse dependencies (items return; coins sink)", tree: decompositionTree, defaultOpenDepth: 2,
      notes: "Decomposition is a control valve: it lets players undo decisions without refunding coins, preserving the economy sink." },
  ]), []);

  const [idx, setIdx] = useState(0);
  const slide = slides[idx];

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
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") setIdx((p) => clamp(p + 1, 0, slides.length - 1));
        if (e.key === "ArrowLeft") setIdx((p) => clamp(p - 1, 0, slides.length - 1));
      }}
      tabIndex={0}
    >
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 950, letterSpacing: 0.3 }}>Crafting Trees — Presentation</div>
            <div style={{ marginTop: 6, opacity: 0.82, lineHeight: 1.35, maxWidth: 900 }}>
              Use <b>←</b>/<b>→</b> to navigate. Click nodes to expand/collapse.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Pill>Slide <b style={{ marginLeft: 6 }}>{idx + 1}</b> / {slides.length}</Pill>
            <Button variant="ghost" disabled={idx === 0} onClick={() => setIdx((p) => clamp(p - 1, 0, slides.length - 1))}>← Prev</Button>
            <Button disabled={idx === slides.length - 1} onClick={() => setIdx((p) => clamp(p + 1, 0, slides.length - 1))}>Next →</Button>
          </div>
        </div>

        <div style={{ height: 14 }} />

        <div style={{ display: "grid", gap: 14 }}>
          <Card
            title={slide.title}
            right={
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setIdx(i)}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.15)",
                      background: i === idx ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.92)",
                      cursor: "pointer",
                      fontWeight: 900,
                    }}
                    aria-label={`Go to slide ${i + 1}`}
                    title={s.title}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            }
          >
            {slide.kicker && <div style={{ marginBottom: 12, opacity: 0.86, lineHeight: 1.35 }}>{slide.kicker}</div>}
            <Tree root={slide.tree} defaultOpenDepth={slide.defaultOpenDepth ?? 2} />
            {slide.notes && (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.10)", opacity: 0.85, lineHeight: 1.35 }}>
                <b>Presenter note:</b> {slide.notes}
              </div>
            )}
          </Card>

          <Card title="Narrative Tie-in (one-liner framing)">
            <div style={{ display: "grid", gap: 10, lineHeight: 1.4 }}>
              <div><Pill>Boss Tokens</Pill> <span style={{ opacity: 0.86 }}>are proof you returned to a memory.</span></div>
              <div><Pill>Sarah Crafts</Pill> <span style={{ opacity: 0.86 }}>translate pain into structure.</span></div>
              <div><Pill>Sam Forges</Pill> <span style={{ opacity: 0.86 }}>turn structure into intent.</span></div>
              <div><Pill>Decomposition</Pill> <span style={{ opacity: 0.86 }}>lets you reconsider—without undoing the cost.</span></div>
              <div style={{ opacity: 0.72, fontSize: 12 }}>
                Tip: start with “Helbard Goal Tree” then show “Sourcing” to explain player agency, then “Decomposition” to explain risk control.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// -----------------------------
// Shell App (switch between Prototype and Trees)
// -----------------------------

function AppShell() {
  const [view, setView] = useState("prototype"); // prototype | trees

  return (
    <div>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backdropFilter: "blur(10px)",
          background: "rgba(5,5,7,0.72)",
          borderBottom: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "12px 18px", display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ fontWeight: 950, letterSpacing: 0.3, color: "rgba(255,255,255,0.92)" }}>
              Creepy Cuties — Demo
            </div>
            <Pill>No build • CDN React</Pill>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <Button variant={view === "prototype" ? "primary" : "ghost"} onClick={() => setView("prototype")}>
              Prototype
            </Button>
            <Button variant={view === "trees" ? "primary" : "ghost"} onClick={() => setView("trees")}>
              Trees
            </Button>
          </div>
        </div>
      </div>

      {view === "prototype" ? <WeaponCraftingNarrativePrototype /> : <CraftingTreesPresentation />}
    </div>
  );
}

// -----------------------------
// Mount
// -----------------------------

const rootEl = document.getElementById("root");
if (ReactDOM.createRoot) {
  ReactDOM.createRoot(rootEl).render(<AppShell />);
} else {
  // React 17 fallback (shouldn't happen with React 18 UMD, but harmless)
  ReactDOM.render(<AppShell />, rootEl);
}
