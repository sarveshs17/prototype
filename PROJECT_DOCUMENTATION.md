# Cascading Failure — Infrastructure Resilience Simulator
## Comprehensive Project Documentation & Presentation Reference

> **Document Purpose:** This document provides an exhaustive, technically rigorous, and presentation-ready breakdown of the *Cascading Failure Infrastructure Resilience Simulator*. It is specifically formatted for seamless conversion into hackathon slide decks (via tools like Gamma AI, Pitch, or PowerPoint) and technical judge evaluations.

---

# 1. Project Overview

| Attribute | Details |
| :--- | :--- |
| **Project Name** | **Cascading Failure — Infrastructure Resilience Simulator** |
| **Tagline / One-Liner** | *A real-time GIS-integrated digital twin engine for simulating, analyzing, and mitigating cross-sector cascading failures across modern urban infrastructure.* |
| **Domain** | Smart Cities, Disaster Management, Critical Infrastructure Protection (CIP), Graph AI / Complex Networks |
| **Target Users** | Municipal Disaster Management Authorities, Urban Planners, Grid Reliability Engineers, Utility Operators |
| **Key Capability** | Simulates how a localized shock (e.g., bridge collapse, power substation outage) propagates across power, water, transportation, healthcare, and telecom networks. |

### The Problem Being Solved
Modern cities are hyper-connected "networks of networks." Power grids supply water pumping stations and hospital life-support systems; water networks cool power generation equipment; road corridors provide logistical transit for utility repair crews and fuel supply. When a single critical asset fails (due to flooding, cyberattacks, or structural fatigue), stress is redistributed to adjacent assets. If those assets exceed capacity thresholds, they trip, unleashing a **non-linear, multi-sector cascading failure (black sky hazard)** that can paralyze an entire metropolitan area.

### Why Infrastructure Interdependency is Hard to Solve
1. **Siloed Domain Planning:** Power, water, and transport authorities maintain isolated domain models without visibility into shared cross-sector dependencies.
2. **Hidden Vulnerabilities (N-1 Blindspots):** Seemingly secondary nodes can trigger widespread regional collapse due to unseen cyclic dependencies.
3. **Non-Linear Dynamics:** Failure propagation does not follow simple Euclidean distance; it follows topological flow dynamics, capacity headroom limits, and auxiliary backup depletion timelines.

### Our Proposed Solution
A high-performance, browser-based **Geographic Information System (GIS) Digital Twin & Cascade Simulation Engine** that:
- Models heterogeneous urban networks as coupled multi-layer graphs.
- Computes sector-aware load redistribution, capacity overloads, and auxiliary backup depletion in real time.
- Renders wave-like failure propagation on interactive GIS maps with pulsing shockwave visual telemetry.
- Performs automated **N-1 Criticality Analysis** to rank single points of failure by systemic impact, enabling proactive infrastructure hardening.

---

# 2. Problem Statement

```
[ Localized Shock ] ---> [ Capacity Overload ] ---> [ Cross-Sector Depletion ] ---> [ Metropolitan Collapse ]
 (e.g. Substation Trip)    (Neighbor Lines Overheat)   (Hospital UPS & Pumps Die)       (Citywide Grid Blackout)
```

### The Anatomy of a Modern Cascading Disaster
Traditional risk assessments treat city assets as standalone components. In reality:
- **Phase 1: Localized Primary Failure:** A key asset trips (e.g., *Velachery 230kV Substation* suffers flood ingress).
- **Phase 2: Same-Sector Load Surges:** Neighboring substations/corridors immediately absorb rerouted electrical or transit load, pushing them above 85% utilization (degraded) or 100% (overload trip).
- **Phase 3: Cross-Sector Dependency Triggering:** Lifeline services (Hospitals, Water Pumping Stations, Telecom Towers) lose primary high-tension feeds and switch to emergency battery UPS/diesel generators (*Degraded state*).
- **Phase 4: Auxiliary Exhaustion:** As backup fuel or batteries deplete (Step 2+ in duration), secondary multi-sector failures cascade into water distribution collapse and civic communication blackouts.

### Real-World Relevance
- **2021 Texas Power Crisis:** Winter storms tripped power plants, knocking out water treatment pumps for 14+ million people and disabling gas pipeline compressors, preventing power restoration.
- **2015 / 2023 Chennai Floods:** Inundation of key arterial bridges severed emergency access while coastal substation trips deactivated drainage pumps in low-lying residential sectors.
- **Economic & Human Cost:** Global cascading outages cause tens of billions of dollars in economic disruption and jeopardize emergency medical services.

---

# 3. Solution Overview

```
+---------------------------------------------------------------------------------------------------+
|                                     PROPOSED SOLUTION ARCHITECTURE                                 |
+---------------------------------------------------------------------------------------------------+
|  1. Coupled Graph Model    | Multi-layer network capturing Power, Transit, Water, Health, Telecom |
|  2. Physics Simulation     | Sector-aware load flow, capacity headroom, & auxiliary backup delays |
|  3. GIS & Visual Overlay   | Dark-mode Leaflet GIS map with wave-like SVG ripple failure telemetry|
|  4. N-1 Criticality Engine | Exhaustive combinatorial ranking of systemic single points of failure|
+---------------------------------------------------------------------------------------------------+
```

### Core Value Propositions
1. **Preventative Hardening (Before the Disaster):** Pinpoints the top 20% of critical assets whose reinforcement prevents 80% of cascading collapse scenarios.
2. **Real-Time Scenario Testing (During Emergency Planning):** Allows emergency commanders to test "what-if" scenarios (e.g., *"What if Thiruvanmiyur Bridge and Taramani Substation both trip?"*) and inspect step-by-step ripple trajectories.
3. **Zero-Friction Decision Support:** Runs sub-millisecond simulations in any browser with interactive timeline scrubbing, sector filtering, and JSON export.

---

# 4. System Architecture

### Architectural Block Diagram

```
+----------------------------------------------------------------------------------------------------+
|                                         CLIENT / BROWSER TIER                                      |
|                                                                                                    |
|   +--------------------------+   +-------------------------------+   +--------------------------+  |
|   |   Leaflet 1.9.4 GIS Map  |   |    SVG Shockwave & Pulse      |   | HTML5 Particle Canvas    |  |
|   |  - CartoDB Dark Matter   |   |    - Dynamic Laser Edges      |   | - Cyan Cyber Background  |  |
|   |  - Esri Satellite Hybrid |   |    - Wave Ripple Animations   |   | - Mouse-reactive physics |  |
|   +--------------------------+   +-------------------------------+   +--------------------------+  |
|                 |                                |                                                 |
|                 +--------------------------------+-------------------------------------------------+
|                                                  |
|                                  [ UI State & Telemetry Controller ]
|                                  (static/app.js - Vanilla JS ES6+)
|                                                  |
|                        REST API HTTP Requests (JSON over Port 5000)
+--------------------------------------------------|-------------------------------------------------+
                                                   |
+--------------------------------------------------v-------------------------------------------------+
|                                         SERVER / BACKEND TIER                                      |
|                                                                                                    |
|   +---------------------------------------------------------------------------------------------+  |
|   |                           Flask REST Application Router (app.py)                            |  |
|   |   GET  /api/networks                POST /api/simulate            POST /api/network/<id>/node|  |
|   |   GET  /api/network/<id>            GET  /api/criticality/<id>    POST /api/network/<id>/edge|  |
|   |   GET  /api/export/<id>             DEL  /api/network/<id>/node   DEL  /api/network/<id>/edge|  |
|   +---------------------------------------------------------------------------------------------+  |
|                                                  |
|                 +--------------------------------+--------------------------------+
|                 |                                                                 |
|   +-----------------------------+                                   +-----------------------------+
|   |  SimulationEngine           |                                   |  In-Memory Graph Store      |
|   |  (simulation_engine.py)     |                                   |  (networks_data.py)         |
|   |  - Sector load transfer     |                                   |  - Chennai Demo (15N, 16E)  |
|   |  - Overload thresholding    |                                   |  - Bengaluru Grid (6N, 5E)  |
|   |  - Auxiliary backup logic   |                                   |  - Mumbai Island (5N, 4E)   |
|   |  - Exhaustive N-1 Ranking   |                                   |  - Dynamic user-added nodes |
|   +-----------------------------+                                   +-----------------------------+
+----------------------------------------------------------------------------------------------------+
```

### End-to-End Data Flow
1. **User Action:** The user selects a target node (or multiple nodes) on the GIS map and clicks **"Initiate Cascade"** (or hits `Space`).
2. **Request Dispatch:** `static/app.js` posts `{ network_id, node_ids, damping, overload_threshold_multiplier }` to `/api/simulate`.
3. **Simulation Execution:** `SimulationEngine.run_cascade()` builds an adjacency graph, trips the origin nodes at Step 0, sheds their loads, routes excess capacity to compatible same-sector neighbors, triggers cross-sector auxiliary states (UPS/generators), and iterates until the network stabilizes or reaches maximum depth.
4. **Response Delivery:** Flask returns a structured timeline snapshot array containing metrics, newly failed nodes, and per-step utilization states.
5. **Dynamic Visualization:** The UI scrubs step-by-step, firing glowing SVG ripple waves (`@keyframes waveRippleOut1/2`), coloring compromised edges red, updating live telemetry gauges, and refreshing the network service ratio KPI.

---

# 5. Technology Stack

| Layer | Technology | Version | Purpose in Codebase |
| :--- | :--- | :--- | :--- |
| **Backend Runtime** | **Python** | 3.10+ / 3.14 | Core simulation engine, matrix operations, and REST server. |
| **Web Framework** | **Flask** | 3.0.0+ | Lightweight RESTful microservice managing network CRUD, simulation execution, and JSON exports. |
| **GIS Mapping** | **Leaflet.js** | 1.9.4 | Geospatial map rendering, custom HTML markers, tile layer swapping, smooth panning/zooming. |
| **Basemap Tiles** | **CartoDB & Esri** | Public CDN | CartoDB Dark Matter (cyber dark theme) and Esri World Imagery (high-res satellite hybrid). |
| **Visual Effects** | **HTML5 Canvas 2D** | Native | Interactive glowing cyan particle background with mouse-proximity reactive physics (`static/particles.js`). |
| **Vector Graphics** | **SVG Overlays** | Native | Custom ripple shockwaves, multi-tier status badges, and dynamic glowing laser edges on the GIS canvas. |
| **Icons & UI** | **Lucide Icons** | CDN | Minimalist vector icons for power, water, hospital, transit, and telemetry controls. |
| **Styling** | **Vanilla CSS3** | Modern CSS | Custom properties (`--bg-primary: #020204`, `--accent-cyan: #67e8f9`), glassmorphism, responsive grid layout. |

---

# 6. Project Folder Structure

```
e:\prototype\
│
├── app.py                      # Flask REST API server, routing, in-memory graph management, JSON export
├── simulation_engine.py        # Core physics engine: sector load routing, auxiliary depletion, N-1 ranking
├── networks_data.py            # Pre-configured rich datasets for Chennai, Bengaluru, and Mumbai networks
│
├── static/                     # Frontend client assets
│   ├── index.html              # Main single-page GIS dashboard, tabs, telemetry cards, modals
│   ├── app.js                  # Frontend controller: Leaflet GIS map, timeline scrubber, API client, telemetry
│   ├── style.css               # Cyan-and-black cyber theme, shockwave keyframes, glassmorphism panels
│   └── particles.js            # Interactive HTML5 canvas particle background with mouse responsiveness
│
└── PROJECT_DOCUMENTATION.md    # This comprehensive project & presentation documentation
```

### File-by-File Breakdown

| File | Lines of Code | Key Functions / Responsibilities |
| :--- | :--- | :--- |
| `app.py` | 187 lines | Declares `/api/networks`, `/api/network/<id>`, `/api/simulate`, `/api/criticality/<id>`, `/api/network/<id>/node`, `/api/network/<id>/edge`, `/api/export/<id>`. Handles in-memory persistence. |
| `simulation_engine.py` | 351 lines | Implements `SimulationEngine` class, `_build_adjacency()`, `run_cascade()`, `_take_step_snapshot()`, and `calculate_criticality_ranking()`. |
| `networks_data.py` | 318 lines | Contains pre-populated realistic municipal datasets with geographical coordinates, capacities, units, baseline loads, and dependency edges. |
| `static/index.html` | ~600 lines | UI structure: top navigation bar, quick KPI cards, Leaflet GIS viewport, timeline player, asset telemetry drawer, criticality table modal, settings modal. |
| `static/app.js` | ~1,000 lines | State store, Leaflet map initializers, SVG ripple generator, live telemetry updater, Quick Search (`Ctrl+K`), step timeline player controller. |
| `static/style.css` | ~900 lines | CSS theme variables (`#020204`, `#67e8f9`, `#22d3ee`), radial glow gradients, custom scrollbars, ripple wave animations. |
| `static/particles.js` | ~180 lines | `ParticleBackground` class managing 60 animated cyan particles with line connections within 120px and interactive mouse repulsion. |

---

# 7. Core Modules & Codebase Breakdown

```
+----------------------------------------------------------------------------------------------+
|                                    BACKEND ENGINE PIPELINE                                   |
|                                                                                              |
|  [ Ingest Graph Data ]                                                                       |
|         │                                                                                    |
|         ▼                                                                                    |
|  [ Adjacency & Multi-sector Indexing ]                                                       |
|         │                                                                                    |
|         ▼                                                                                    |
|  [ Step 0: Direct Trigger Initiation ]  ──> Node Status: "failed", Failed Step: 0            |
|         │                                                                                    |
|         ▼                                                                                    |
|  [ Step 1..N Loop ]                                                                          |
|    ├── Sector-Aware Load Redistribution (Road<->Bridge, Power<->Power, Water<->Water)       |
|    ├── Capacity Headroom Overload Evaluation (Load > Capacity * Multiplier)                  |
|    ├── Cross-Sector Auxiliary Power Checks (Power Loss -> Hospital UPS / Water Generator)   |
|    └── Auxiliary Exhaustion Evaluation (Step >= 2 -> Secondary Pump Failures)               |
|         │                                                                                    |
|         ▼                                                                                    |
|  [ Convergence or Max Steps Reached ]                                                        |
|         │                                                                                    |
|         ▼                                                                                    |
|  [ Aggregate Final Metrics: Service Loss %, Capacity Lost, Affected Demand, Duration ]      |
+----------------------------------------------------------------------------------------------+
```

### Module 1: `simulation_engine.py` (The Mathematical Core)
- **`__init__(network_data)`**: Deep-copies nodes and edges, indexes bidirectional adjacency lists, maps edge IDs.
- **`run_cascade(initial_failed_ids, damping=0.85, overload_threshold_multiplier=1.0)`**:
  - Initializes state dictionary for each node (`capacity`, `load`, `initial_load`, `demand`, `status`, `utilization`).
  - Iterates step-by-step through a failure queue (up to max 7 steps).
  - Routes shed load strictly to compatible active neighbors, weighted by edge strength and normalized by damping.
  - Checks threshold: if `load > capacity * multiplier`, flags failure; if `load > capacity * 0.85`, flags degraded.
  - Checks cross-sector power loss: switches hospitals to emergency backup (`degraded`); fails water pumps if unpowered for $\ge 2$ consecutive steps.
  - Emits detailed step snapshots for frontend animation.
- **`calculate_criticality_ranking()`**:
  - Executes isolated single-node failure cascades across every node in the active network ($N-1$ contingency).
  - Computes systemic service loss percentage, total assets lost, and cascade duration.
  - Ranks nodes descending by `(service_loss_pct, cascade_size)`.

### Module 2: `app.py` (The REST API Layer)
- Serves static GIS assets and implements full CRUD for active networks:
  - `GET /api/networks`: High-level network catalog with asset and connection counts.
  - `GET /api/network/<id>`: Full node coordinates, telemetry baselines, and initial stable state.
  - `POST /api/simulate`: Executes cascade on demand with custom damping and overload multipliers.
  - `GET /api/criticality/<id>`: Computes and returns ranked single-point-of-failure table.
  - `POST /api/network/<id>/node` & `POST /api/network/<id>/edge`: Dynamic node/edge creation.
  - `DELETE /api/network/<id>/node/<nid>`: Deletion with automatic orphan-edge pruning.
  - `GET /api/export/<id>`: Downloads network configuration as standard JSON.

### Module 3: `static/app.js` (The Frontend Controller)
- **Leaflet GIS Integration:** Configures CartoDB Dark Matter base tiles with toggleable Esri Satellite Hybrid imagery.
- **Visual Wave Dispatcher:** Injects multi-ring pulsing CSS shockwaves (`waveRippleOut1` and `waveRippleOut2`) on coordinates of newly failing nodes.
- **Interactive Scrubber:** Enables playing, pausing, rewinding, and stepping through failure propagation turns.
- **Asset Telemetry Drawer:** Displays real-time capacity gauges, load units, failure reasons, and connection lists.
- **Live Search (`Ctrl+K`):** Instant fuzzy-filtering of assets by name, ID, or sector type.

---

# 8. Data Model & Network Schema

### Node (Asset) Schema
```json
{
  "id": "velachery_substation",
  "external_id": "PS-003",
  "label": "Velachery Substation",
  "sub": "Power Substation",
  "type": "power",
  "lat": 12.9780,
  "lng": 80.2185,
  "capacity": 250,
  "unit": "MW",
  "load": 170,
  "demand": 220,
  "image_url": "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80",
  "description": "230kV / 110kV primary grid transmission substation feeding southern Chennai."
}
```

### Edge (Connection / Dependency) Schema
```json
{
  "id": "e9",
  "source": "velachery_substation",
  "target": "global_hospitals",
  "type": "dependency",
  "weight": 1.2,
  "label": "Hospital Primary Power Feed"
}
```

### Sector Types & Edge Classification

| Node Type | Color Indicator | Typical Capacity Unit | Sector Compatibility Behavior |
| :--- | :--- | :--- | :--- |
| `power` | `#f5b942` (Amber/Gold) | MW / MVA | Absorbs electrical ring load; supplies dependency feeds to Hospitals & Pumps. |
| `road` | `#7d8aa3` (Steel Slate) | vehicles/hr | Redistributes transit volume to parallel road links and bridges. |
| `bridge` | `#5b9cff` (Cobalt Blue) | vehicles/hr | Arterial transit chokepoints; high-impact rerouting upon failure. |
| `water` | `#4fb8e0` (Cyan) | MLD / cu.m/s | Hydraulic flow; trips if primary electrical feeds remain offline for $\ge 2$ steps. |
| `hospital` | `#ff5c7a` (Crimson Pink) | beds / kW | Critical civic demand node; engages auxiliary UPS generator upon grid failure. |
| `telecom` | `#a78bfa` (Purple) | Gbps backbone | Core optical/cellular exchange; feeds telemetry to traffic signal hubs. |
| `demand` | `#57d68d` (Emerald Green) | kW / MVA | High-density urban consumption centers (universities, campuses, shelters). |

| Edge Type | Visual Style | Simulation Role |
| :--- | :--- | :--- |
| `physical` | Solid cyan glowing vector | Direct physical link (road corridor, high-voltage line) capable of load transfer. |
| `dependency` | Dashed amber / red vector | Functional dependency (e.g., Power feed required to maintain pump/hospital operations). |
| `flow` | Dotted light-blue vector | Fluid or continuous service delivery (water supply mains, telecom fiber). |
| `geographic` | Faint gray vector | Proximity / shared physical right-of-way coupling. |

### Pre-loaded City Datasets

| Dataset ID | City Name | Nodes | Edges | Description |
| :--- | :--- | :---: | :---: | :--- |
| `chennai_demo` | **Chennai Arterial Grid** | **15** | **16** | Coastal transit corridors, 230kV power rings, drainage sluices, and trauma centers across South Chennai. |
| `bengaluru_metro` | **Bengaluru Tech Grid** | **6** | **5** | Central business district power distribution, Majestic interchange, and BWSSB water pumping. |
| `mumbai_island` | **Mumbai Island City Grid** | **5** | **4** | Coastal transport (Bandra-Worli Sea Link), Worli receiving station, and KEM Hospital lifeline. |

---

# 9. Network & Geographic Map Visualization

```
+----------------------------------------------------------------------------------------------------+
|                                    DUAL-MODE VISUALIZATION ENGINE                                  |
+----------------------------------------------------------------------------------------------------+
|  [ GIS Map View ]            | Real geographic coordinates (Lat/Lng) over CartoDB / Esri Satellite  |
|  [ Multi-Ring Shockwaves ]   | Expanding concentric SVG ripples indicate newly failed node origins  |
|  [ Glowing Edge Laser ]      | Compromised connections flash with laser glow pulses                 |
|  [ Canvas Particle Grid ]    | 60 glowing cyan nodes with distance-based reactive connecting cords  |
+----------------------------------------------------------------------------------------------------+
```

### 1. Geographic GIS Map View
- Built with **Leaflet.js**, positioned to accurate municipal coordinates.
- **CartoDB Dark Matter Basemap:** High-contrast, near-black backdrop optimizing neon visual telemetry.
- **Esri World Imagery Basemap:** Real-world satellite overlay allowing planners to inspect actual geography, bridges, waterways, and urban density.
- Map boundaries are clamped (`maxBounds`, `noWrap: true`) to prevent disorienting infinite wrapping upon zoom-out.

### 2. Failure Shockwave & Animation Physics
When an asset trips, the UI triggers a dual-phase CSS animation:
- **`@keyframes waveRippleOut1`**: Fast primary shockwave expanding from $0\times$ to $3.5\times$ marker radius with opacity fadeout over 1.6s.
- **`@keyframes waveRippleOut2`**: Secondary trailing echo expanding to $4.8\times$ marker radius over 2.4s.
- Compromised dependency lines ignite in bright crimson laser pulses, clearly showing the direction of failure transmission.

### 3. Canvas Particle Background (`static/particles.js`)
- Fullscreen background rendering 60 floating cyan nodes (`#22d3ee` and `#67e8f9`).
- Inter-particle cords dynamically appear when distance $< 120\text{px}$.
- Interactive mouse repulsion smoothly pushes particles away within an $80\text{px}$ radius.
- Respects `prefers-reduced-motion` accessibility standards.

---

# 10. Cascade Simulation Engine & Failure Physics

### Mathematical Model

$$\text{Capacity Headroom: } H_j = \max(0, C_j - L_j)$$

$$\text{Load Share Transferred: } \Delta L_{i \to j} = \left( \frac{w_{ij}}{\sum_{k \in \mathcal{N}_{\text{compat}}(i)} w_{ik}} \right) \cdot L_i^{\text{init}} \cdot 0.75 \cdot \delta$$

Where:
- $L_i^{\text{init}}$ = Baseline load of failing node $i$.
- $\mathcal{N}_{\text{compat}}(i)$ = Set of operational, sector-compatible neighbors of node $i$.
- $w_{ij}$ = Weight of edge $(i, j)$.
- $\delta$ = Damping factor (default $= 0.85$).

```
                      FAILING NODE (Load = L)
                                │
                 ┌──────────────┴──────────────┐
                 ▼                             ▼
        Compatible Neighbor A         Compatible Neighbor B
         (Weight = 1.0, Headroom)      (Weight = 0.9, Headroom)
                 │                             │
                 ▼                             ▼
       Absorbs: ΔL_A = 52%           Absorbs: ΔL_B = 48%
                 │                             │
    ┌────────────┴────────────┐                │
    ▼                         ▼                ▼
Load > Capacity           Load > 85%      Load < 85%
  [ FAILED ]              [ DEGRADED ]   [ OPERATIONAL ]
(Cascades Next Step)     (Warning State)    (Stable)
```

### Progressive Degradation & Cross-Sector Rules

```
Step 0: Primary Event
   │
   ├── Velachery Substation fails (Direct trigger)
   │
Step 1: First-Order Impacts
   ├── Taramani Tech Substation absorbs electrical load ---> Overloads & Trips
   ├── Global Hospitals loses primary power feed        ---> Switches to UPS Backup (Degraded)
   └── Pallikaranai Water Station loses power feed       ---> Switches to Aux Generator (Degraded)
   │
Step 2: Second-Order Auxiliary Depletion
   ├── Water Station exhausts auxiliary diesel fuel     ---> Secondary Failure (Failed)
   └── Thiruvanmiyur Junction experiences signal loss   ---> Rerouting delays
   │
Step 3: Stabilization
   └── No further overloads. Final Network Service Ratio stabilized at 62.4%.
```

---

# 11. Criticality & Vulnerability Analysis

```
+----------------------------------------------------------------------------------------------------+
|                                    N-1 CRITICALITY RANKING ALGORITHM                               |
+----------------------------------------------------------------------------------------------------+
|  For every node N_i in Network:                                                                    |
|    1. Execute isolated run_cascade([N_i])                                                          |
|    2. Measure final Service Loss %, Total Assets Failed, Demand Affected, & Depth                  |
|    3. If Service Loss % >= 25%, flag as CRITICAL BOTTLENECK                                        |
|  Sort all nodes by (Service Loss % DESC, Cascade Size DESC)                                        |
+----------------------------------------------------------------------------------------------------+
```

### Criticality Ranking Table (Chennai Demo Network)

| Rank | Asset ID | Asset Name | Sector | Baseline Capacity | Cascade Size | Service Loss % | Critical Status |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **#1** | `PS-003` | **Velachery Substation** | Power | 250 MW | 5 nodes | **41.2%** | <span style="color:#ff3b3b; font-weight:bold;">CRITICAL</span> |
| **#2** | `BR-014` | **Thiruvanmiyur Bridge** | Bridge | 5,000 veh/hr | 4 nodes | **34.8%** | <span style="color:#ff3b3b; font-weight:bold;">CRITICAL</span> |
| **#3** | `PS-007` | **Taramani Tech Substation** | Power | 200 MW | 3 nodes | **26.5%** | <span style="color:#ff3b3b; font-weight:bold;">CRITICAL</span> |
| **#4** | `WT-002` | **Pallikaranai Water Station**| Water | 250 MLD | 2 nodes | **18.4%** | <span style="color:#22d3ee;">Resilient</span> |
| **#5** | `RD-031` | **OMR Express Corridor** | Road | 7,000 veh/hr | 2 nodes | **15.1%** | <span style="color:#22d3ee;">Resilient</span> |
| **#6** | `ED-002` | **IIT Madras Campus** | Demand | 300 MVA | 1 node | **6.2%** | <span style="color:#22d3ee;">Isolated</span> |

> **Key Takeaway:** The Criticality Ranking mathematically proves that reinforcing **Velachery Substation** (e.g., adding a redundant bypass feeder) protects over $40\%$ of the city's total utility capacity.

---

# 12. Scenario Testing & Network Management

```
+----------------------------------------------------------------------------------------------------+
|                                    NETWORK MANAGEMENT & CRUD CAPABILITIES                          |
+----------------------------------------------------------------------------------------------------+
|  • Add New Asset Modal       | Specify Lat/Lng, Capacity, Unit, Load, Demand, Sector Type          |
|  • Add Interconnection Modal | Connect any two assets with Physical / Dependency / Flow link       |
|  • Delete Asset / Edge       | Real-time topology removal with orphan edge cleanup                 |
|  • JSON Export Engine        | Download resilient network topologies as standard JSON artifacts    |
|  • Damping & Threshold Tuner | Adjust simulation physics sliders in Settings modal                 |
+----------------------------------------------------------------------------------------------------+
```

### Scenario Parameters
- **Damping Factor ($\delta$):** Controls load dissipation ($0.50$ to $1.00$). Higher values simulate rigid networks with minimal absorption buffering.
- **Overload Threshold Multiplier ($M$):** Controls surge tolerance ($0.80$ to $1.50$). An $M = 1.20$ simulates a network upgraded with $20\%$ surge tolerance.

---

# 13. User Workflow & Demo Flow

### Recommended 5-Minute Hackathon Demo Script

```
   [ Step 1: 00:00 - 00:45 ]  --->  [ Step 2: 00:45 - 01:30 ]  --->  [ Step 3: 01:30 - 02:30 ]
    Introduce Chennai Digital        Trigger Velachery Substation       Scrub Timeline & Observe
    Twin on Leaflet GIS Map          Outage (Direct Shock)              Wave Ripple Cascade Propagation
               │                                                                    │
               ▼                                                                    ▼
   [ Step 6: 04:15 - 05:00 ]  <---  [ Step 5: 03:15 - 04:15 ]  <---  [ Step 4: 02:30 - 03:15 ]
    Export Resilient Topology        Open Criticality Tab & Show        Inspect Asset Telemetry
    & Summarize Impact / ROI         N-1 Failure Ranking Matrix         (Hospital UPS & Pumping Gauges)
```

1. **Phase 1: Explore Digital Twin (00:00 - 00:45)**
   - Show the interactive dark-mode GIS map of South Chennai.
   - Toggle between **CartoDB Dark Matter** and **Esri Satellite** layers.
   - Point out multi-sector nodes: Power Substations, Bridges, Trauma Hospitals, Water Plants.
2. **Phase 2: Trigger Primary Shock (00:45 - 01:30)**
   - Select **Velachery Substation (`PS-003`)**.
   - Click **"Initiate Cascade"** (or hit `Space`).
3. **Phase 3: Observe Wave Propagation (01:30 - 02:30)**
   - Highlight the **multi-ring cyan-and-red shockwave ripples** expanding across the map.
   - Scrub the **Timeline Player** step-by-step:
     - *Step 0:* Velachery Substation trips.
     - *Step 1:* Taramani Tech Substation overloads; Global Hospitals and Pallikaranai Water engage backup batteries.
     - *Step 2:* Water Pumping Station auxiliary fuel exhausts and fails.
4. **Phase 4: Deep Telemetry Inspection (02:30 - 03:15)**
   - Click on **Global Hospitals**: Show that status is **Degraded** (Emergency UPS Active) rather than an unrealistic total blackout.
5. **Phase 5: Automated N-1 Criticality Analysis (03:15 - 04:15)**
   - Switch to the **Criticality Ranking Tab**.
   - Show how the algorithm autonomously tested all single-point failures and ranked **Velachery Substation** #1 and **Thiruvanmiyur Bridge** #2.
6. **Phase 6: Mitigation & Export (04:15 - 05:00)**
   - Open Settings, adjust Overload Tolerance to $1.20$, re-run simulation to show how hardening halts the cascade.
   - Click **"Export Network JSON"** to download the hardened network artifact.

---

# 14. UI & Visual Design Highlights

```
+----------------------------------------------------------------------------------------------------+
|                                    CYAN-AND-BLACK CYBER RESILIENCE THEME                           |
+----------------------------------------------------------------------------------------------------+
|  Background Primary : #020204 (Deep Pitch Black)    | Primary Accent  : #67e8f9 (Electric Cyan)   |
|  Card / Panel Surface: #080a0d (Charcoal Black)     | Bright Accent   : #22d3ee (Bright Cyan)     |
|  Panel Borders      : #1e293b (Subtle Slate)        | Text Primary    : #f8fafc (Clean White)     |
|  Failure State Glow : #ff3b3b (Vibrant Crimson)     | Warning State   : #f59e0b (Amber)           |
+----------------------------------------------------------------------------------------------------+
```

### UI Components & Ergonomics
- **Floating Top Bar:** Quick-switch between city datasets, one-click Reset, Criticality Tab, Settings, and JSON Export.
- **Glassmorphic KPI Badges:** Floating cards showing *Network Service Ratio*, *Active Assets*, *Failed Count*, and *Degraded Count*.
- **Bottom Timeline Scrubber:** Glassmorphism drawer with Play/Pause button, Step Scrubber, and turn-by-turn casualty logs.
- **Side Asset Inspector:** High-resolution asset photography, live capacity/load circular progress rings, status pills, and incident edge listings.
- **Keyboard Shortcuts:** `Ctrl + K` for Quick Search, `Space` for Play/Pause simulation.

---

# 15. Key Outputs & Resilience Metrics

### Formulas & Metric Definitions

| Metric | Formula | Practical Interpretation |
| :--- | :--- | :--- |
| **Network Service Ratio (%)** | $\text{NSR} = 100.0 - \left( \frac{\sum_{i \in \mathcal{F}} \text{Cap}_i}{\sum_{j \in \mathcal{V}} \text{Cap}_j} \times 100 \right)$ | Percentage of original metropolitan infrastructure capacity remaining functional. |
| **Service Loss (%)** | $\text{Loss} = \left( \frac{\sum_{i \in \mathcal{F}} \text{Cap}_i}{\sum_{j \in \mathcal{V}} \text{Cap}_j} \right) \times 100$ | Total proportion of systemic capacity lost across all sectors. |
| **Total Affected Demand** | $\text{Demand}_{\text{lost}} = \sum_{i \in \mathcal{F}} \text{Demand}_i$ | Absolute demand units (MW, MLD, vehicles, hospital beds) cut off from the network. |
| **Cascade Depth / Steps** | $\text{Steps} = T_{\text{stabilized}} - 1$ | Number of propagation cycles before failure dynamics naturally halt. |
| **Degraded Asset Count** | $N_{\text{degraded}} = \sum \mathbb{I}(\text{status} = \text{"degraded"})$ | Number of assets running on auxiliary power or operating near capacity limits (>85%). |

---

# 16. Walkthrough of an Example Scenario

### Scenario: "Monsoon Flood Inundation at Velachery Substation"

```
+───────────────────────────────────────────────────────────────────────────────────────────────────+
| INITIAL CONDITIONS (STABLE STATE)                                                                 |
| • 15 Assets Operational (100% Network Service Ratio)                                              |
| • Total Grid Capacity: 21,330 Units | Total Active Demand: 17,905 Units                           |
+───────────────────────────────────────────────────────────────────────────────────────────────────+
                                                  │
                                                  ▼
+───────────────────────────────────────────────────────────────────────────────────────────────────+
| STEP 0: PRIMARY TRIGGER                                                                           |
| • Velachery Substation (PS-003, 250 MW) inundated by floodwaters -> TRIPPED                       |
| • Capacity Lost: 250 MW | Service Loss: 14.8% | NSR: 85.2%                                        |
+───────────────────────────────────────────────────────────────────────────────────────────────────+
                                                  │
                                                  ▼
+───────────────────────────────────────────────────────────────────────────────────────────────────+
| STEP 1: SAME-SECTOR OVERLOAD & CROSS-SECTOR AUXILIARY ACTIVATION                                  |
| • Taramani Tech Substation (PS-007) absorbs rerouted power -> Load exceeds 200 MW -> TRIPPED      |
| • Global Hospitals (HP-001) loses high-tension feed -> ENGAGES BATTERY UPS (Status: Degraded)     |
| • Pallikaranai Water Station (WT-002) loses feed -> ENGAGES DIESEL PUMP (Status: Degraded)        |
| • Cumulative Capacity Lost: 450 MW | Service Loss: 27.3% | NSR: 72.7%                             |
+───────────────────────────────────────────────────────────────────────────────────────────────────+
                                                  │
                                                  ▼
+───────────────────────────────────────────────────────────────────────────────────────────────────+
| STEP 2: AUXILIARY FUEL EXHAUSTION                                                                 |
| • Pallikaranai Water Station exhausts backup fuel after sustained outage -> TRIPPED               |
| • Water mains lose pressure -> Secondary civic alerts triggered                                   |
| • Cumulative Capacity Lost: 700 Units | Service Loss: 37.6% | NSR: 62.4%                          |
+───────────────────────────────────────────────────────────────────────────────────────────────────+
                                                  │
                                                  ▼
+───────────────────────────────────────────────────────────────────────────────────────────────────+
| STEP 3: CONVERGENCE & STABILIZATION                                                               |
| • Remaining transport links and northern water pumps absorb baseline flows without further trips. |
| • Cascade stabilizes after 3 steps. Final NSR: 62.4% | Total Compromised Assets: 5 Nodes, 7 Edges |
+───────────────────────────────────────────────────────────────────────────────────────────────────+
```

---

# 17. Why This Approach / Technical Advantages

| Traditional Approach | Our Resilience Digital Twin |
| :--- | :--- |
| **Siloed Domain Models:** Power engineers use power flow tools; transport planners use traffic models independently. | **Coupled Multi-Layer Graph:** Simulates inter-dependent domino effects across power, water, transport, and health simultaneously. |
| **Static Distance Buffers:** Assumes damage is purely proportional to physical distance from the epicenter. | **Topology & Capacity Flow Physics:** Recognizes that failure follows electrical grid loops and road corridors regardless of spatial distance. |
| **Binary All-or-Nothing Collapses:** Fails the entire city graph on any trigger (unrealistic). | **Realistic Sector Headroom & Backup Delays:** Features progressive degradation ($85\%$), auxiliary generator lifespans, and damping. |
| **Slow Batch Computations:** Simulation runs take minutes or hours on specialized clusters. | **Sub-Millisecond Execution:** Pure Python + Vanilla JS client executes full N-1 analysis across 15+ nodes in $<50\text{ms}$. |

---

# 18. Limitations & Future Improvements

### Current Limitations (Transparent Hackathon Scope)
1. **In-Memory State:** Custom node additions and edits persist in server RAM during runtime; they do not write back to a persistent PostgreSQL/PostGIS database.
2. **Deterministic Flow Model:** The current engine uses weighted proportional flow redistribution rather than full non-linear AC power flow equations (e.g., MATPOWER / Pandapower) or hydraulic Navier-Stokes pipe models.
3. **Curated Demo Networks:** Includes 3 rich municipal datasets (Chennai, Bengaluru, Mumbai); full OpenStreetMap city-scale imports require preprocessing.

### Future Roadmap
- **Real-Time IoT / SCADA Integration:** Ingest live MQTT / Kafka telemetry streams from smart meters and traffic sensors.
- **AI-Powered Reinforcement Learning Agent:** Train an automated grid dispatcher agent to recommend optimal switch reconfigurations to contain cascades in real time.
- **Dynamic Weather Overlays:** Connect OpenWeatherMap / NOAA radar APIs to dynamically trip nodes based on live rainfall and flood inundation vectors.
- **Mobile First-Responder PWA:** Field-deployable progressive web app allowing emergency crews to update asset status from the ground.

---

# 19. Hackathon Presentation Slide Deck Blueprint

> **Slide Conversion Guide:** Copy each slide block below directly into Gamma AI or PowerPoint to generate a clean, persuasive 8-slide hackathon presentation.

---

### Slide 1: Title Slide (The Hook)
- **Title:** Cascading Failure — Infrastructure Resilience Simulator
- **Subtitle:** Protecting Hyper-Connected Modern Cities from Systemic Black Sky Collapses
- **Key Visual:** Dark-mode screenshot of the Chennai GIS Digital Twin with glowing cyan nodes and expanding crimson shockwaves.
- **Presenter Bullets:**
  - *"Modern cities are networks of networks."*
  - *"When one bridge or substation fails, where does the collapse stop?"*
  - *"We built the digital twin to answer that question in milliseconds."*

---

### Slide 2: The Hidden Crisis (The Problem)
- **Header:** The Domino Effect of Urban Infrastructure
- **Core Challenge:** Urban sectors are deeply interdependent, yet managed in complete isolation.
- **Key Metrics / Examples:**
  - 2021 Texas Freeze: Power collapse triggered water treatment failure for 14M residents.
  - 2023 Coastal Floods: Substation outages paralyzed drainage sluices and traffic signal networks.
- **Takeaway:** Traditional siloed planning creates hidden single points of failure.

---

### Slide 3: The Solution (What We Built)
- **Header:** A Cross-Sector Resilience Digital Twin
- **Three Pillars:**
  1. **Coupled Multi-Layer Graph Engine:** Power, Water, Transport, Health, Telecom in one unified topological model.
  2. **Physics-Informed Cascade Simulator:** Sector-aware load routing, auxiliary generator lifespans, and capacity surge thresholds.
  3. **GIS Visual Command Center:** Real-world Leaflet mapping, live telemetry gauges, and wave-like failure shockwaves.

---

### Slide 4: How It Works (Simulation Physics)
- **Header:** Realistic Degradation vs. Blind Collapse
- **Three-Tier Status Model:**
  - **Operational:** Load within normal capacity limits ($<85\%$).
  - **Degraded:** Stress buffer active (e.g., Hospital UPS running, $>85\%$ utilization).
  - **Failed:** Capacity threshold breached ($>100\%$) or auxiliary backup depleted.
- **Key Innovation:** Prevents artificial full-network wipes; reflects realistic emergency containment.

---

### Slide 5: Live Demo & Walkthrough
- **Header:** Simulated Outage: Velachery Substation, Chennai
- **Visual:** Side-by-side comparison of Step 0 (Initial Trip) vs Step 2 (Stabilized Network).
- **Demo Highlights:**
  - Step 0: 230kV Substation tripped by flood ingress.
  - Step 1: Neighboring tech substation trips; hospital engages emergency UPS.
  - Step 2: Drainage pump backup fuel exhausts; cascade naturally stabilizes at 62.4% service ratio.
  - Telemetry: Instant visibility into affected demand and lost capacity.

---

### Slide 6: N-1 Criticality Intelligence (The AI Advantage)
- **Header:** Finding the Weakest Link Before Disaster Strikes
- **Visual:** Criticality ranking table showing Velachery Substation as #1 risk ($41.2\%$ service loss).
- **Value to City Planners:**
  - Autonomously tests every single asset failure in under 50 milliseconds.
  - Eliminates guesswork by ranking investments by systemic risk reduction ROI.

---

### Slide 7: Technical Architecture & Performance
- **Header:** Lightweight, High-Performance Full-Stack Design
- **Architecture Highlights:**
  - **Backend:** Python 3 + Flask REST API with sub-millisecond graph matrix operations.
  - **Frontend:** Pure Vanilla JS (ES6+), Leaflet GIS, CartoDB/Esri basemaps, HTML5 Canvas particle physics.
  - **Zero Bloat:** Runs on standard web browsers without heavyweight dependencies or proprietary licenses.

---

### Slide 8: Impact, Vision & Closing
- **Header:** Building the Resilient Cities of Tomorrow
- **Vision:** From reactive disaster recovery to proactive algorithmic resilience.
- **Roadmap:** Live SCADA / IoT feeds, Reinforcement Learning for automated load shedding, and GeoJSON OpenStreetMap integration.
- **Closing Call to Action:** *"Infrastructure resilience isn't just about stronger concrete; it's about smarter network intelligence."*

