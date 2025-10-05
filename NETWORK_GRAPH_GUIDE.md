# Village Social Network Graph — Implementation Guide (Next.js + Postgres)

This document explains how to model, compute, and visualize **village relationships** as a **network graph** using your existing stack (Next.js 15, TypeScript, Postgres/Prisma, Recharts). It’s scoped to the relationships you already track today: **households** and **factions**. It also defines a simple, static **opinion score** per person, useful as a GM aid at the table.

> TL;DR: Build a multiplex graph with two layers (**HOUSEHOLD**, **FACTION**), compute a few social network metrics on the server, cache results, and render an interactive graph plus side KPIs.


---

## 1) Conceptual Model

- **Nodes**: `Person`
- **Edge layers**:
  - **HOUSEHOLD**: people who live together (undirected).  
  - **FACTION**: people who share at least one faction (undirected; weight = #shared factions).
- **Weights**: quantify tie strength (e.g., shared_factions count).
- **Static metrics** per person:
  - **degree** (how many ties), **betweenness** (bridge-ness), **community** (Louvain), and a derived **opinion_score**.

Why this works:
- **Households** reveal tightly knit units.  
- **Factions** reveal political/ideological cohesion.  
- Combining them yields a practical map of influence and fault lines.

---

## 2) Data Model (SQL Views)

We derive edges from normalized tables using **views** (non-destructive). You can materialize later for speed.

```sql
-- Household co-resident edges (undirected; one edge per pair per household)
CREATE OR REPLACE VIEW v_person_edges_household AS
SELECT DISTINCT
  'HOUSEHOLD'::text AS layer,
  LEAST(ph1.person_id, ph2.person_id) AS src_person_id,
  GREATEST(ph1.person_id, ph2.person_id) AS dst_person_id,
  1.0::double precision AS weight
FROM PersonHousehold ph1
JOIN PersonHousehold ph2
  ON ph1.household_id = ph2.household_id
 AND ph1.person_id <> ph2.person_id;

-- Shared faction edges (undirected; weight = count of shared factions)
CREATE OR REPLACE VIEW v_person_edges_faction AS
SELECT
  'FACTION'::text AS layer,
  LEAST(pf1.person_id, pf2.person_id) AS src_person_id,
  GREATEST(pf1.person_id, pf2.person_id) AS dst_person_id,
  COUNT(*)::double precision AS weight
FROM PersonFaction pf1
JOIN PersonFaction pf2
  ON pf1.faction_id = pf2.faction_id
 AND pf1.person_id <> pf2.person_id
GROUP BY 2,3;

CREATE OR REPLACE VIEW v_person_edges AS
SELECT * FROM v_person_edges_household
UNION ALL
SELECT * FROM v_person_edges_faction;
```

> Optional later: `CREATE MATERIALIZED VIEW mv_person_edges AS SELECT * FROM v_person_edges;` and refresh nightly.

---

## 3) Server-Side Graph Build & Scoring

Use **graphology** for graph structure + metrics; compute once on the server and cache results.

### Install
```bash
npm i graphology graphology-communities-louvain graphology-metrics graphology-layout-forceatlas2
```

### Types
```ts
export type GraphLayer = 'HOUSEHOLD' | 'FACTION';

export interface GraphNode {
  id: string;
  label: string;
  species?: string;
  community?: number;
  degree?: number;
  betweenness?: number;
  opinion?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  layer: GraphLayer;
  weight: number;
}
```

### Build & Score
```ts
// src/lib/graph/buildAndScore.ts
import { MultiGraph } from 'graphology';
import louvain from 'graphology-communities-louvain';
import { betweennessCentrality } from 'graphology-metrics/centrality/betweenness';
import { degree } from 'graphology-metrics/centrality/degree';

export function buildGraph(nodes: {id:string,label:string,species?:string}[],
                           edges: {source:string,target:string,layer:'HOUSEHOLD'|'FACTION',weight:number}[]) {
  const G = new MultiGraph({ multi: true });
  for (const n of nodes) {
    if (!G.hasNode(n.id)) G.addNode(n.id, { label: n.label, species: n.species });
  }
  for (const e of edges) {
    const key = `${e.layer}:${e.source}->${e.target}`;
    if (!G.hasEdge(key)) G.addEdgeWithKey(key, e.source, e.target, { layer: e.layer, weight: e.weight });
  }
  return G;
}

export function scoreGraph(G: any) {
  const partition = louvain.communities(G, { getEdgeWeight: 'weight' });
  const bet = betweennessCentrality(G);
  const deg = degree.centrality(G);

  let maxDeg = 0, maxBet = 0;
  for (const n of G.nodes()) {
    maxDeg = Math.max(maxDeg, deg[n] ?? 0);
    maxBet = Math.max(maxBet, bet[n] ?? 0);
  }

  G.forEachNode((n: string) => {
    const d = deg[n] ?? 0;
    const b = bet[n] ?? 0;
    const c = partition[n] ?? 0;
    // simple, explainable opinion score
    const opinion = 0.6 * (maxDeg ? d / maxDeg : 0) + 0.3 * (maxBet ? b / maxBet : 0) + 0.1 * 0; // reserve 0.1 for future household z-score
    G.setNodeAttribute(n, 'degree', d);
    G.setNodeAttribute(n, 'betweenness', b);
    G.setNodeAttribute(n, 'community', c);
    G.setNodeAttribute(n, 'opinion', opinion);
  });
}
```

> Persist results in a small table `PersonOpinion(person_id, degree, betweenness, community, opinion_score, calculated_at)` or cache in memory/Redis and return via API.

---

## 4) API Contracts (Next.js App Router)

### `GET /api/graph/elements?layers=HOUSEHOLD,FACTION`
Returns graph payload for the client:
```jsonc
{
  "nodes": [{ "id":"p1", "label":"Brigid Stormaxe", "species":"Dwarf", "community":1, "degree":12, "betweenness":0.18, "opinion":0.67 }],
  "edges": [{ "id":"HOUSEHOLD:p1->p2", "source":"p1", "target":"p2", "layer":"HOUSEHOLD", "weight":1 }]
}
```

### `GET /api/graph/summary`
Returns KPIs and top lists:
```jsonc
{
  "counts": { "nodes": 506, "edges": 2144, "communities": 8 },
  "topDegree": [{ "id":"p3", "label":"Innkeeper", "score": 19 }],
  "topBetweenness": [{ "id":"p17", "label":"Quartermaster", "score": 0.31 }],
  "communitySizes": [{ "community":0, "size": 92 }, { "community":1, "size": 77 }]
}
```

> Protect `/api/graph/recompute` (POST) if you expose manual recomputation.

---

## 5) Client Visualization

Pick one renderer (both have React adapters).

### Option A: Cytoscape.js
```bash
npm i cytoscape react-cytoscapejs
```
```tsx
"use client";
import dynamic from "next/dynamic";
const CytoscapeComponent = dynamic(() => import("react-cytoscapejs"), { ssr: false });

export function VillageGraph({ elements }: { elements: any[] }) {
  return (
    <CytoscapeComponent
      elements={elements}
      layout={{ name: "cose" }}
      stylesheet={[
        { selector: "node", style: { label: "data(label)", "background-color": "#999" } },
        { selector: "edge[layer = 'FACTION']", style: { "line-color": "#4c78a8" } },
        { selector: "edge[layer = 'HOUSEHOLD']", style: { "line-color": "#f58518" } }
      ]}
      style={{ width: "100%", height: "700px" }}
    />
  );
}
```

### Option B: Sigma.js (WebGL, great for larger graphs)
```bash
npm i @react-sigma/core
```
```tsx
"use client";
import { SigmaContainer, ControlsContainer, ZoomControl, FullScreenControl } from "@react-sigma/core";

export function VillageGraphSigma({ graph }: { graph: any }) {
  return (
    <SigmaContainer style={{ height: "700px" }} graph={graph}>
      <ControlsContainer position={"top-right"}>
        <ZoomControl />
        <FullScreenControl />
      </ControlsContainer>
    </SigmaContainer>
  );
}
```

### Side KPIs with Recharts (you already use it)
```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
export function TopListChart({ data }: { data: {label:string; score:number}[] }) {
  return (
    <div style={{ height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="label" hide />
          <YAxis />
          <Tooltip />
          <Bar dataKey="score" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

## 6) Page Composition

- **Left**: Layer toggles + filters (species, faction).
- **Center**: Graph canvas (Cytoscape or Sigma).
- **Right**: KPIs (top degree/betweenness, community sizes) with Recharts.
- **Export**: PNG (graph) + CSV (scores).

```tsx
// app/graph/page.tsx (sketch)
/*
- Fetch /api/graph/elements and /api/graph/summary
- Manage layer toggles in query string (?layers=HOUSEHOLD,FACTION)
- Pass elements to VillageGraph; pass top lists to charts
*/
```

---

## 7) Performance Strategy

- **Precompute** metrics server-side; do not compute on the client.
- **Cache** results (memory/Redis) and **paginate** or **filter** edges by layer.
- For >1k nodes: prefer **Sigma.js**; provide initial node positions from server (ForceAtlas2 coordinates) to reduce layout jank.
- Use **SWC/TS strict mode** and keep data contracts stable (Zod validators optional).

---

## 8) CI / Amplify Notes

- Pin Node version (`"engines": {"node":"22.x"}`) and in `amplify.yml` (`nvm install 22 && nvm use 22`).
- Use `npm ci` and run `npm run typecheck && npm run lint && npm run build`.
- Keep prod and dev DBs separate; never recompute on production without a snapshot.

---

## 9) Roadmap (future layers)

- **OPINION** (directed sentiment A→B)  
- **WORK** (coworker ties, weight by overlap)  
- **EVENTS/RESOURCES** (temporal layers; animate/change over time)  
- **Assortativity** by species/faction; **k-cores**, **structural holes**, **triadic balance**

---

## 10) MCP Rules (Cursor)

```yaml
- Present a PLAN for edits >5 lines.
- Allowed shell: npm ci, npm run typecheck, npm run lint, npm run build, prisma generate.
- Never connect to production DB for recompute.
- For new API routes, include TypeScript types and runtime validation (zod optional).
- After patch: run typecheck → lint → build and attach logs.
```

---

### Appendix: Minimal API Shape (pseudo-code)

```ts
// /api/graph/elements/route.ts
export async function GET(request: NextRequest) {
  const layers = new Set((request.nextUrl.searchParams.get("layers") || "HOUSEHOLD,FACTION").split(","));
  // 1) Query nodes + v_person_edges filtered by layers
  // 2) Build graphology graph, compute metrics, cache
  // 3) Return {nodes, edges}
}
```

Use this guide as your starting point; drop it into your repo (e.g., `docs/NETWORK_GRAPH_GUIDE.md`) and iterate.
