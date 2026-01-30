import React, { useMemo, useState } from "react";

/**
 * React Presentation: Weapon Crafting Trees
 * - Slide-style UI (Next/Prev)
 * - Collapsible tree nodes
 * - Covers: Goal Dependency Tree, Resource Sourcing Tree, Decomposition Tree
 */

type TreeNode = {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  children?: TreeNode[];
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

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
  variant?: "primary" | "ghost";
}) {
  const base: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.15)",
    background: variant === "ghost" ? "transparent" : "rgba(255,255,255,0.1)",
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

function Chevron({ open }: { open: boolean }) {
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

function Tree({ root, defaultOpenDepth = 2 }: { root: TreeNode; defaultOpenDepth?: number }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const isOpen = (id: string, depth: number) => {
    const v = open[id];
    if (typeof v === "boolean") return v;
    return depth < defaultOpenDepth;
  };

  const toggle = (id: string) => setOpen((p) => ({ ...p, [id]: !p[id] }));

  const renderNode = (node: TreeNode, depth: number, isLast: boolean, ancestorsLast: boolean[]) => {
    const hasChildren = (node.children?.length ?? 0) > 0;
    const nodeOpen = hasChildren ? isOpen(node.id, depth) : false;

    // connector scaffolding
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
        <div
          style={{
            width: 20,
            position: "relative",
          }}
        >
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
              {node.children!.map((c, idx) =>
                renderNode(c, depth + 1, idx === node.children!.length - 1, [...ancestorsLast, isLast])
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {renderNode(root, 0, true, [])}
    </div>
  );
}

// ---------------------------------
// Tree Data
// ---------------------------------

const goalTree: TreeNode = {
  id: "goal_helbard",
  title: "Goal: Helbard",
  badge: "Sam’s Weaponry",
  subtitle: "The top-level crafting dependency chain",
  children: [
    {
      id: "goal_req_spear",
      title: "Spear",
      badge: "Craft",
      children: [
        { id: "spear_req_woundfeet", title: "Wound’s Feet", badge: "Token" },
        { id: "spear_req_pole", title: "Wooden Pole", badge: "NPC Rank Item" },
        { id: "spear_req_coins", title: "400 Coins", badge: "Cost" },
      ],
    },
    {
      id: "goal_req_axe",
      title: "Axe",
      badge: "Craft",
      children: [
        { id: "axe_req_horn", title: "Disease’s Horn", badge: "Token" },
        { id: "axe_req_pole", title: "Wooden Pole", badge: "NPC Rank Item" },
        { id: "axe_req_coins", title: "500 Coins", badge: "Cost" },
      ],
    },
    { id: "goal_req_shiverwing", title: "Shiver’s Wing", badge: "Token" },
    { id: "goal_req_helbard_coins", title: "1200 Coins", badge: "Cost" },
  ],
};

const resourceSourcingTree: TreeNode = {
  id: "source_root",
  title: "Resource Sourcing",
  subtitle: "Where each dependency can come from (drops vs Sarah crafts)",
  children: [
    {
      id: "src_woundfeet",
      title: "Wound’s Feet",
      badge: "Token",
      children: [
        { id: "src_woundfeet_drop", title: "Boss Drop: defeat Wound" },
        { id: "src_woundfeet_buy", title: "Sarah: buy for 100 coins" },
      ],
    },
    {
      id: "src_toxictongue",
      title: "Toxic’s Tongue",
      badge: "Token",
      children: [
        { id: "src_toxictongue_drop", title: "Boss Drop: defeat Toxic" },
        { id: "src_toxictongue_craft", title: "Sarah: craft (Wound’s Feet + 200 coins)" },
      ],
    },
    {
      id: "src_shiverwing",
      title: "Shiver’s Wing",
      badge: "Token",
      children: [
        { id: "src_shiverwing_drop", title: "Boss Drop: defeat Shiver & Fever" },
        { id: "src_shiverwing_craft", title: "Sarah: craft (Wound’s Feet + Toxic’s Tongue + 300 coins)" },
      ],
    },
    {
      id: "src_feverfang",
      title: "Fever’s Fang",
      badge: "Token",
      children: [
        { id: "src_feverfang_drop", title: "Boss Drop: defeat Shiver & Fever" },
        { id: "src_feverfang_craft", title: "Sarah: craft (Wound’s Feet + Toxic’s Tongue + 300 coins)" },
      ],
    },
    {
      id: "src_diseasehorn",
      title: "Disease’s Horn",
      badge: "Token",
      children: [
        { id: "src_diseasehorn_drop", title: "Boss Drop: defeat Disease" },
        {
          id: "src_diseasehorn_craft",
          title: "Sarah: craft",
          subtitle: "(Shiver’s Wing + Fever’s Fang + Wound’s Feet + Toxic’s Tongue + 500 coins)",
        },
      ],
    },
    {
      id: "src_woodenpole",
      title: "Wooden Pole",
      badge: "NPC Rank Item",
      children: [
        { id: "src_pole_drop", title: "Drop Rule: defeat Disease for the 2nd time" },
        {
          id: "src_pole_craft",
          title: "Sarah: craft",
          subtitle: "(Wound’s Feet + Shiver’s Wing + Disease’s Horn + 300 coins)",
        },
      ],
    },
    {
      id: "src_weapons",
      title: "Weapons (Sam)",
      badge: "Forge",
      children: [
        { id: "src_spear", title: "Spear = Wound’s Feet + Wooden Pole + 400 coins" },
        { id: "src_axe", title: "Axe = Disease’s Horn + Wooden Pole + 500 coins" },
        { id: "src_helbard", title: "Helbard = Spear + Axe + Shiver’s Wing + 1200 coins" },
      ],
    },
  ],
};

const decompositionTree: TreeNode = {
  id: "decomp_root",
  title: "Decomposition (Reverse Dependencies)",
  subtitle: "Break an item into its ingredient items; coins are not returned",
  children: [
    {
      id: "decomp_helbard",
      title: "Decompose Helbard",
      badge: "Return",
      children: [
        { id: "decomp_helbard_spear", title: "Spear" },
        { id: "decomp_helbard_axe", title: "Axe" },
        { id: "decomp_helbard_shiver", title: "Shiver’s Wing" },
      ],
    },
    {
      id: "decomp_spear",
      title: "Decompose Spear",
      badge: "Return",
      children: [
        { id: "decomp_spear_wound", title: "Wound’s Feet" },
        { id: "decomp_spear_pole", title: "Wooden Pole" },
      ],
    },
    {
      id: "decomp_axe",
      title: "Decompose Axe",
      badge: "Return",
      children: [
        { id: "decomp_axe_horn", title: "Disease’s Horn" },
        { id: "decomp_axe_pole", title: "Wooden Pole" },
      ],
    },
    {
      id: "decomp_horn",
      title: "Decompose Disease’s Horn",
      badge: "Return",
      children: [
        { id: "decomp_horn_shiver", title: "Shiver’s Wing" },
        { id: "decomp_horn_fever", title: "Fever’s Fang" },
        { id: "decomp_horn_wound", title: "Wound’s Feet" },
        { id: "decomp_horn_toxic", title: "Toxic’s Tongue" },
      ],
    },
    {
      id: "decomp_shiver",
      title: "Decompose Shiver’s Wing",
      badge: "Return",
      children: [
        { id: "decomp_shiver_wound", title: "Wound’s Feet" },
        { id: "decomp_shiver_toxic", title: "Toxic’s Tongue" },
      ],
    },
    {
      id: "decomp_fever",
      title: "Decompose Fever’s Fang",
      badge: "Return",
      children: [
        { id: "decomp_fever_wound", title: "Wound’s Feet" },
        { id: "decomp_fever_toxic", title: "Toxic’s Tongue" },
      ],
    },
    {
      id: "decomp_toxic",
      title: "Decompose Toxic’s Tongue",
      badge: "Return",
      children: [{ id: "decomp_toxic_wound", title: "Wound’s Feet" }],
    },
    {
      id: "decomp_pole",
      title: "Decompose Wooden Pole",
      badge: "Return",
      children: [
        { id: "decomp_pole_wound", title: "Wound’s Feet" },
        { id: "decomp_pole_shiver", title: "Shiver’s Wing" },
        { id: "decomp_pole_horn", title: "Disease’s Horn" },
      ],
    },
  ],
};

// ---------------------------------
// Presentation
// ---------------------------------

type Slide = {
  id: string;
  title: string;
  kicker?: string;
  tree: TreeNode;
  defaultOpenDepth?: number;
  notes?: string;
};

export default function CraftingTreesPresentation() {
  const slides: Slide[] = useMemo(
    () => [
      {
        id: "slide_goal",
        title: "Helbard Goal Tree",
        kicker: "What you must have to craft Helbard (Sam’s Weaponry)",
        tree: goalTree,
        defaultOpenDepth: 3,
        notes:
          "Use this slide for explaining player intent: Helbard is not a token; it’s a composition of past victories (Spear + Axe + Shiver’s Wing).",
      },
      {
        id: "slide_sourcing",
        title: "Resource Sourcing Tree",
        kicker: "Drops vs Sarah crafts/buy paths",
        tree: resourceSourcingTree,
        defaultOpenDepth: 2,
        notes:
          "This slide clarifies optionality: players can grind bosses or convert coins into progress through Sarah’s transformations.",
      },
      {
        id: "slide_decompose",
        title: "Decomposition Tree",
        kicker: "Reverse dependencies (items return; coins sink)",
        tree: decompositionTree,
        defaultOpenDepth: 2,
        notes:
          "Decomposition is a control valve: it lets players undo decisions without refunding coins, preserving the economy sink.",
      },
    ],
    []
  );

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
            <Pill>
              Slide <b style={{ marginLeft: 6 }}>{idx + 1}</b> / {slides.length}
            </Pill>
            <Button
              variant="ghost"
              disabled={idx === 0}
              onClick={() => setIdx((p) => clamp(p - 1, 0, slides.length - 1))}
            >
              ← Prev
            </Button>
            <Button
              disabled={idx === slides.length - 1}
              onClick={() => setIdx((p) => clamp(p + 1, 0, slides.length - 1))}
            >
              Next →
            </Button>
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
            {slide.kicker && (
              <div style={{ marginBottom: 12, opacity: 0.86, lineHeight: 1.35 }}>{slide.kicker}</div>
            )}

            <Tree root={slide.tree} defaultOpenDepth={slide.defaultOpenDepth ?? 2} />

            {slide.notes && (
              <div
                style={{
                  marginTop: 14,
                  paddingTop: 12,
                  borderTop: "1px solid rgba(255,255,255,0.10)",
                  opacity: 0.85,
                  lineHeight: 1.35,
                }}
              >
                <b>Presenter note:</b> {slide.notes}
              </div>
            )}
          </Card>

          <Card title="Narrative Tie-in (one-liner framing)">
            <div style={{ display: "grid", gap: 10, lineHeight: 1.4 }}>
              <div>
                <Pill>Boss Tokens</Pill> <span style={{ opacity: 0.86 }}>are proof you returned to a memory.</span>
              </div>
              <div>
                <Pill>Sarah Crafts</Pill> <span style={{ opacity: 0.86 }}>translate pain into structure.</span>
              </div>
              <div>
                <Pill>Sam Forges</Pill> <span style={{ opacity: 0.86 }}>turn structure into intent.</span>
              </div>
              <div>
                <Pill>Decomposition</Pill> <span style={{ opacity: 0.86 }}>lets you reconsider—without undoing the cost.</span>
              </div>
              <div style={{ opacity: 0.72, fontSize: 12 }}>
                Tip: start with “Helbard Goal Tree” then show “Sourcing” to explain player agency, then “Decomposition” to explain
                risk control.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
