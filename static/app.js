/**
 * Resilience — Infrastructure Resilience Simulator
 * Full frontend application logic: Leaflet GIS Map, SVG Overlay with Wave-like Shockwaves,
 * Step-by-Step Simulation Engine, Criticality Matrix, and Network Management.
 */

// Global State Store
const state = {
  currentNetworkId: "chennai_demo",
  networkData: null,
  selectedNodeId: "thiruvanmiyur_bridge",
  map: null,
  mapMode: "satellite", // "satellite" or "vector"
  tileLayers: {},
  svgLayer: null,
  simulationResult: null,
  currentStepIndex: 0,
  isPlaying: false,
  playTimer: null,
  playbackSpeed: 1.0,
  filters: {
    types: new Set(["road", "bridge", "hospital", "power", "water", "telecom", "demand"]),
    statuses: new Set(["operational", "degraded", "failed"]),
    edges: new Set(["physical", "dependency", "flow", "geographic"])
  },
  physics: {
    damping: 0.95,
    thresholdMult: 1.0
  }
};

// Global Status Conventions (🟢 Operational, 🟡 Degraded, 🔴 Failed)
const STATUS_COLORS = {
  operational: "#34d399",
  degraded: "#fbbf24",
  failed: "#f43f5e"
};

function getStatusColor(status) {
  return STATUS_COLORS[status] || STATUS_COLORS.operational;
}

/**
 * Single source of truth for node status.
 * Reads from the current simulation step and returns 'operational' | 'degraded' | 'failed'.
 */
function getNodeStatus(nodeId) {
  if (!state.simulationResult || !state.simulationResult.timeline) {
    return "operational";
  }
  const currentStepData = state.simulationResult.timeline[state.currentStepIndex];
  if (!currentStepData) {
    return "operational";
  }

  // 1. Check cumulative failed nodes list
  if (currentStepData.cumulative_failed_nodes && currentStepData.cumulative_failed_nodes.includes(nodeId)) {
    return "failed";
  }

  // 2. Check detailed node states for degraded or failed flags
  if (currentStepData.node_states && currentStepData.node_states[nodeId]) {
    const s = currentStepData.node_states[nodeId].status;
    if (s === "failed") return "failed";
    if (s === "degraded") return "degraded";
    return "operational";
  }

  return "operational";
}

// Sector Config & Metadata (Icons, Units, Labels)
const SECTOR_CONFIG = {
  power: { name: "Power Substation", icon: "zap", unit: "MW", telemetry: "Grid Freq: 49.98 Hz • Temp: 46°C" },
  water: { name: "Water Pump Station", icon: "droplet", unit: "MLD", telemetry: "Pressure: 5.4 bar • Flow: 2.8 m/s" },
  road: { name: "Road Corridor", icon: "route", unit: "veh/hr", telemetry: "Density: 82% • Avg Speed: 24 km/h" },
  bridge: { name: "Bridge", icon: "git-merge", unit: "veh/hr", telemetry: "Structural Stress: Normal • Flow: 88%" },
  hospital: { name: "Hospital", icon: "plus-square", unit: "beds", telemetry: "Backup UPS: Standby • ICU: Active" },
  telecom: { name: "Telecom Tower", icon: "radio", unit: "Gbps", telemetry: "RF Power: 42 dBm • BER: 1e-9" },
  demand: { name: "Demand Hub", icon: "users", unit: "MVA", telemetry: "Peak Load Factor: 0.88" }
};

// ==========================================================================
// Initialization
// ==========================================================================
document.addEventListener("DOMContentLoaded", async () => {
  initMap();
  bindEventListeners();
  await loadNetwork(state.currentNetworkId);
  initKeyboardShortcuts();
});

// ==========================================================================
// Map & GIS Setup (Bounded, No API Key Watermarks, No Infinite Wrap)
// ==========================================================================
function initMap() {
  const mapContainer = document.getElementById("gisMap");
  if (!mapContainer) return;

  // Initialize Leaflet with tight zoom bounds and viscosity
  state.map = L.map("gisMap", {
    center: [12.9820, 80.2420],
    zoom: 13,
    minZoom: 11,
    maxZoom: 18,
    maxBoundsViscosity: 1.0,
    worldCopyJump: false,
    zoomControl: false,
    attributionControl: false
  });

  // Base Tile Layers (100% Free, Public, Zero Auth / Watermark Required)
  state.tileLayers.satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 18,
    minZoom: 10,
    noWrap: true,
    subdomains: ["server", "services"]
  });

  state.tileLayers.vector = L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png", {
    maxZoom: 19,
    minZoom: 10,
    noWrap: true,
    subdomains: "abcd"
  });

  // Default to satellite layer
  state.tileLayers.satellite.addTo(state.map);

  // Add Custom SVG Overlay Pane
  L.svg().addTo(state.map);
  const overlayPane = state.map.getPanes().overlayPane;
  state.svgLayer = overlayPane.querySelector("svg");
  if (!state.svgLayer) {
    state.svgLayer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    state.svgLayer.setAttribute("class", "map-svg-overlay");
    overlayPane.appendChild(state.svgLayer);
  }

  // Update SVG on map move / zoom
  state.map.on("zoom", updateSvgPositions);
  state.map.on("move", updateSvgPositions);
  state.map.on("viewreset", updateSvgPositions);
}

function setMapMode(mode) {
  state.mapMode = mode;
  document.getElementById("mapModeVector")?.classList.toggle("active", mode === "vector");
  document.getElementById("mapModeSatellite")?.classList.toggle("active", mode === "satellite");

  if (mode === "satellite") {
    state.map.removeLayer(state.tileLayers.vector);
    state.tileLayers.satellite.addTo(state.map);
  } else {
    state.map.removeLayer(state.tileLayers.satellite);
    state.tileLayers.vector.addTo(state.map);
  }
}

// ==========================================================================
// Network Data Loading
// ==========================================================================
async function loadNetwork(networkId) {
  try {
    const res = await fetch(`/api/network/${networkId}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to load network");

    state.currentNetworkId = networkId;
    state.networkData = data.network;

    // Set Map Bounds to prevent infinite panning or world wrapping
    if (state.networkData.nodes && state.networkData.nodes.length > 0 && state.map) {
      const lats = state.networkData.nodes.map(n => n.lat || 12.98);
      const lngs = state.networkData.nodes.map(n => n.lng || 80.24);
      const minLat = Math.min(...lats) - 0.12;
      const maxLat = Math.max(...lats) + 0.12;
      const minLng = Math.min(...lngs) - 0.15;
      const maxLng = Math.max(...lngs) + 0.15;

      const networkBounds = L.latLngBounds([minLat, minLng], [maxLat, maxLng]);
      state.map.setMaxBounds(networkBounds);
      state.map.fitBounds(networkBounds, { padding: [30, 30], maxZoom: 14 });
    } else if (state.networkData.center && state.map) {
      state.map.setView(state.networkData.center, state.networkData.zoom || 13);
    }

    // Set default selected node
    const defaultNode = state.networkData.nodes.find(n => n.id === "thiruvanmiyur_bridge") || state.networkData.nodes[0];
    if (defaultNode) {
      state.selectedNodeId = defaultNode.id;
    }

    // Run initial simulation or baseline snapshot
    await runSimulation([state.selectedNodeId]);

    // Update UI components
    updateSidebarStats();
    renderMapElements();
    updateAssetDetailsPanel();
    renderCriticalityTable();
    renderManagementTable();

    showToast(`Loaded ${state.networkData.name}`);
  } catch (err) {
    console.error("Load Network Error:", err);
    showToast("Error loading network data", "error");
  }
}

// ==========================================================================
// Simulation API & Workflow
// ==========================================================================
async function runSimulation(triggerNodeIds) {
  try {
    const payload = {
      network_id: state.currentNetworkId,
      node_ids: triggerNodeIds || (state.selectedNodeId ? [state.selectedNodeId] : []),
      damping: state.physics.damping,
      overload_threshold_multiplier: state.physics.thresholdMult
    };

    const res = await fetch("/api/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    state.simulationResult = data.result;
    
    // Default to step 2 if available, or step 0
    const targetStep = Math.min(2, state.simulationResult.timeline.length - 1);
    setSimulationStep(targetStep);
    renderTimelineTrack();
  } catch (err) {
    console.error("Simulation error:", err);
  }
}

function setSimulationStep(stepIndex) {
  if (!state.simulationResult || !state.simulationResult.timeline) return;
  const maxStep = state.simulationResult.timeline.length - 1;
  state.currentStepIndex = Math.max(0, Math.min(stepIndex, maxStep));

  const currentStepData = state.simulationResult.timeline[state.currentStepIndex];
  const totalSteps = state.simulationResult.timeline.length;

  // Update step text counter (e.g. Step 2 / 6)
  const stepEl = document.getElementById("stepCounterText");
  if (stepEl) stepEl.textContent = `Step ${state.currentStepIndex} / ${totalSteps}`;

  // Update timeline fill progress
  const fillPct = maxStep > 0 ? (state.currentStepIndex / maxStep) * 100 : 0;
  const fillEl = document.getElementById("timelineProgressFill");
  if (fillEl) fillEl.style.width = `${fillPct}%`;

  // Update active step nodes in track
  document.querySelectorAll(".timeline-step-node").forEach(nodeEl => {
    const s = parseInt(nodeEl.dataset.step, 10);
    nodeEl.classList.toggle("active", s === state.currentStepIndex);
    nodeEl.classList.toggle("completed", s < state.currentStepIndex);
  });

  // Update metrics cards
  updateMetricsDisplay(currentStepData);

  // Update Step Details card in right sidebar
  updateStepDetailsPanel(currentStepData);

  // Update map visual states with wave-like propagation
  updateSvgVisualStates();

  // Update asset panel
  updateAssetDetailsPanel();

  // Update sidebar counter counts
  updateSidebarStats();
}

// ==========================================================================
// Map Rendering & SVG Layer (With Multi-Ring Concentric Wave Shockwaves)
// ==========================================================================
function renderMapElements() {
  if (!state.svgLayer || !state.networkData) return;
  state.svgLayer.innerHTML = "";

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  defs.innerHTML = `
    <filter id="failedGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  `;
  state.svgLayer.appendChild(defs);

  // Edges group
  const edgesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  edgesGroup.setAttribute("id", "edgesGroup");
  state.svgLayer.appendChild(edgesGroup);

  // Nodes group
  const nodesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  nodesGroup.setAttribute("id", "nodesGroup");
  state.svgLayer.appendChild(nodesGroup);

  // Render Edges
  state.networkData.edges.forEach(edge => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("class", `gis-edge ${edge.type || 'physical'}`);
    line.setAttribute("id", `edge-${edge.id}`);
    line.dataset.source = edge.source;
    line.dataset.target = edge.target;
    line.dataset.type = edge.type || "physical";
    edgesGroup.appendChild(line);
  });

  // Render Nodes with Unified Status Colors & Shockwaves
  state.networkData.nodes.forEach(node => {
    const status = getNodeStatus(node.id);
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", `gis-node ${status}${node.id === state.selectedNodeId ? ' selected' : ''}`);
    g.setAttribute("id", `node-${node.id}`);
    g.dataset.id = node.id;
    g.dataset.type = node.type || "road";

    // Shockwave Ripple Ring 2 (Outer expanding wave for failed nodes)
    const ripple2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    ripple2.setAttribute("class", "gis-node-ripple-2");
    ripple2.setAttribute("r", "18");
    g.appendChild(ripple2);

    // Shockwave Ripple Ring 1 (Mid expanding wave for failed nodes)
    const ripple1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    ripple1.setAttribute("class", "gis-node-ripple-1");
    ripple1.setAttribute("r", "18");
    g.appendChild(ripple1);

    // Primary Pulsing Halo (Green for Operational, Yellow for Degraded, Red for Failed)
    const halo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    halo.setAttribute("class", "gis-node-halo");
    halo.setAttribute("r", "24");
    g.appendChild(halo);

    // Node Body (Filled with Status Color: 🟢 Green, 🟡 Yellow, 🔴 Red)
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("class", "gis-node-circle");
    circle.setAttribute("r", "18");
    circle.setAttribute("fill", getStatusColor(status));
    g.appendChild(circle);

    // Category Icon Glyph
    const iconText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    iconText.setAttribute("class", "gis-node-icon");
    iconText.setAttribute("text-anchor", "middle");
    iconText.setAttribute("dominant-baseline", "central");
    iconText.setAttribute("fill", "#ffffff");
    iconText.setAttribute("font-size", "11px");
    iconText.textContent = getNodeSymbol(node.type);
    g.appendChild(iconText);

    // Label Text
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("class", "gis-node-label");
    label.setAttribute("dy", "32");
    label.textContent = node.label;
    g.appendChild(label);

    // Click handler
    g.addEventListener("click", (e) => {
      e.stopPropagation();
      selectNode(node.id);
    });

    nodesGroup.appendChild(g);
  });

  updateSvgPositions();
}

function updateSvgPositions() {
  if (!state.map || !state.networkData) return;

  const nodePosMap = {};

  // Calculate Node Screen Positions
  state.networkData.nodes.forEach(node => {
    let lat = node.lat, lng = node.lng;
    if (!lat || !lng) {
      lat = 12.98 + (node.y || 300) * 0.0002;
      lng = 80.24 + (node.x || 400) * 0.0002;
    }
    const point = state.map.latLngToLayerPoint([lat, lng]);
    nodePosMap[node.id] = point;

    const nodeEl = document.getElementById(`node-${node.id}`);
    if (nodeEl) {
      nodeEl.setAttribute("transform", `translate(${point.x}, ${point.y})`);
    }
  });

  // Update Edges
  state.networkData.edges.forEach(edge => {
    const p1 = nodePosMap[edge.source];
    const p2 = nodePosMap[edge.target];
    const lineEl = document.getElementById(`edge-${edge.id}`);
    if (lineEl && p1 && p2) {
      lineEl.setAttribute("x1", p1.x);
      lineEl.setAttribute("y1", p1.y);
      lineEl.setAttribute("x2", p2.x);
      lineEl.setAttribute("y2", p2.y);
    }
  });
}

function updateSvgVisualStates() {
  if (!state.networkData) return;
  const currentStepData = state.simulationResult?.timeline?.[state.currentStepIndex];

  const failedNodes = new Set(currentStepData?.cumulative_failed_nodes || []);
  const failedEdges = new Set(currentStepData?.cumulative_failed_edges || []);

  state.networkData.nodes.forEach((node) => {
    const nodeEl = document.getElementById(`node-${node.id}`);
    if (!nodeEl) return;

    // Determine status from single source of truth
    const status = getNodeStatus(node.id);

    // Apply Filter Visibility (both Type and Status filters)
    const typeVisible = state.filters.types.has(node.type);
    const statusVisible = state.filters.statuses.has(status);
    nodeEl.style.display = (typeVisible && statusVisible) ? "block" : "none";

    // Update classes: status class determines halo/label styles; selected adds separate cyan outline
    nodeEl.className.baseVal = `gis-node ${status}${node.id === state.selectedNodeId ? ' selected' : ''}`;
    
    // Update node body fill color strictly according to status (🟢 Green, 🟡 Yellow, 🔴 Red)
    const circle = nodeEl.querySelector(".gis-node-circle");
    if (circle) {
      circle.setAttribute("fill", getStatusColor(status));
    }
  });

  // Update Edge visual state with dynamic energy pulse
  state.networkData.edges.forEach(edge => {
    const lineEl = document.getElementById(`edge-${edge.id}`);
    if (!lineEl) return;

    const edgeVisible = state.filters.edges.has(edge.type);
    lineEl.style.display = edgeVisible ? "block" : "none";

    const isFailed = failedEdges.has(edge.id) || (failedNodes.has(edge.source) && failedNodes.has(edge.target));
    lineEl.classList.toggle("active-failure", isFailed);
  });
}

function getNodeColor(type) {
  // Retained for backward compatibility if referenced, but all markers use getStatusColor
  return "#34d399";
}

function getNodeSymbol(type) {
  switch(type) {
    case "power": return "⚡";
    case "water": return "💧";
    case "bridge": return "🌉";
    case "hospital": return "➕";
    case "telecom": return "📡";
    case "road": return "🛣";
    default: return "🏛";
  }
}

function selectNode(nodeId) {
  state.selectedNodeId = nodeId;
  updateSvgVisualStates();
  updateAssetDetailsPanel();
}

// ==========================================================================
// UI Updates: Timeline, Metrics, Asset Details, Step Details
// ==========================================================================
function renderTimelineTrack() {
  const container = document.getElementById("timelineNodesTrack");
  if (!container || !state.simulationResult) return;
  container.innerHTML = "";

  const steps = state.simulationResult.timeline;
  const count = steps.length;

  steps.forEach((stepData, idx) => {
    const nodeEl = document.createElement("div");
    nodeEl.className = `timeline-step-node ${idx === state.currentStepIndex ? 'active' : ''} ${idx < state.currentStepIndex ? 'completed' : ''}`;
    nodeEl.dataset.step = idx;

    const leftPct = count > 1 ? (idx / (count - 1)) * 100 : 0;
    nodeEl.style.left = `${leftPct}%`;

    nodeEl.innerHTML = `
      <div class="timeline-node-pin"></div>
      <span class="timeline-node-num">${idx}</span>
      <span class="timeline-node-desc">${stepData.label}</span>
    `;

    nodeEl.addEventListener("click", () => {
      setSimulationStep(idx);
    });

    container.appendChild(nodeEl);
  });
}

function updateMetricsDisplay(stepData) {
  if (!stepData) return;

  // Service Loss
  const serviceLoss = stepData.service_loss_pct || 0;
  document.getElementById("serviceLossVal").textContent = `${serviceLoss.toFixed(1)}%`;
  document.getElementById("serviceLossRingFill").setAttribute("stroke-dasharray", `${serviceLoss}, 100`);

  // Affected Demand
  const affectedDemand = stepData.affected_demand || 0;
  document.getElementById("affectedDemandVal").textContent = affectedDemand.toLocaleString();

  // Failed Assets (Nodes + Edges)
  const failedNodesCount = (stepData.cumulative_failed_nodes || []).length;
  const failedEdgesCount = (stepData.cumulative_failed_edges || []).length;
  const totalFailed = failedNodesCount + failedEdgesCount;
  document.getElementById("failedAssetsTotalVal").textContent = totalFailed;
  document.getElementById("failedAssetsBreakdownVal").textContent = `(${failedNodesCount} nodes, ${failedEdgesCount} edges)`;

  // Network Service Ratio
  const serviceRatio = stepData.network_service_ratio_pct || (100.0 - serviceLoss);
  document.getElementById("serviceRatioVal").textContent = `${serviceRatio.toFixed(1)}%`;
  document.getElementById("serviceRatioRingFill").setAttribute("stroke-dasharray", `${serviceRatio}, 100`);

  // Cascade Duration
  document.getElementById("cascadeDurationVal").textContent = `${state.simulationResult.total_steps - 1} steps`;
}

function updateAssetDetailsPanel() {
  const panel = document.getElementById("assetDetailsContent");
  const emptyState = document.getElementById("noAssetSelectedState");
  if (!panel || !state.networkData) return;

  const node = state.networkData.nodes.find(n => n.id === state.selectedNodeId);
  if (!node) {
    panel.classList.add("hidden");
    emptyState?.classList.remove("hidden");
    return;
  }

  panel.classList.remove("hidden");
  emptyState?.classList.add("hidden");

  // Determine active status from single source of truth
  const status = getNodeStatus(node.id);
  let curLoad = node.load;
  let util = Math.round((node.load / node.capacity) * 100);

  if (state.simulationResult && state.simulationResult.timeline) {
    const curStepData = state.simulationResult.timeline[state.currentStepIndex];
    if (curStepData && curStepData.node_states && curStepData.node_states[node.id]) {
      curLoad = curStepData.node_states[node.id].load;
      util = Math.round(curStepData.node_states[node.id].utilization);
    }
  }

  // Update Header & Chip
  document.getElementById("assetName").textContent = node.label;
  document.getElementById("assetSubcategory").textContent = `${node.sub || SECTOR_CONFIG[node.type]?.name || "Infrastructure"} • ID: ${node.external_id || node.id}`;
  document.getElementById("assetTypeChip").textContent = node.sub || SECTOR_CONFIG[node.type]?.name || "Infrastructure";
  document.getElementById("assetExternalId").textContent = node.external_id || `AST-${node.id.toUpperCase()}`;
  document.getElementById("assetCapacity").textContent = `${node.capacity.toLocaleString()} ${node.unit || ''}`;
  document.getElementById("assetCurrentLoad").textContent = `${Math.round(curLoad).toLocaleString()} ${node.unit || ''}`;
  
  const utilEl = document.getElementById("assetUtilization");
  const utilBar = document.getElementById("assetUtilBar");
  utilEl.textContent = `${util}%`;
  utilBar.style.width = `${Math.min(100, util)}%`;

  // Utilization colors - strictly match status
  const statusColorClass = status === 'failed' ? 'red' : (status === 'degraded' ? 'yellow' : 'green');
  utilEl.className = `prop-val ${statusColorClass}`;
  utilBar.className = `util-bar-fill ${statusColorClass}`;

  // Status Badge - strictly match status (🟢 Operational, 🟡 Degraded, 🔴 Failed)
  const statusBadge = document.getElementById("assetStatusBadge");
  const statusLabels = {
    operational: "Operational",
    degraded: "Degraded",
    failed: "Failed"
  };
  statusBadge.textContent = statusLabels[status] || "Operational";
  statusBadge.className = `asset-status-badge ${statusColorClass}`;

  // Location
  document.getElementById("assetLocation").textContent = `${(node.lat || 12.98).toFixed(4)}° N, ${(node.lng || 80.24).toFixed(4)}° E`;

  // Image Banner
  const bannerImg = document.getElementById("assetBannerImg");
  if (node.image_url) {
    bannerImg.src = node.image_url;
  }

  // Live Telemetry Updates - strictly match status
  const telState = document.getElementById("telSensorState");
  const telRedundancy = document.getElementById("telRedundancy");
  const telHealth = document.getElementById("telHealthIndex");
  const telRisk = document.getElementById("telCascadeRisk");

  if (status === "failed") {
    telState.textContent = "Telemetry Offline (0 Hz)";
    telState.className = "t-val red";
    telHealth.textContent = "0 / 100 (Tripped)";
    telHealth.className = "t-val red";
    telRisk.textContent = "Catastrophic Breach";
    telRisk.className = "t-val red";
  } else if (status === "degraded") {
    telState.textContent = "Auxiliary Backup Active";
    telState.className = "t-val yellow";
    telHealth.textContent = `${Math.max(20, 100 - util)} / 100`;
    telHealth.className = "t-val yellow";
    telRisk.textContent = "High Stress Level";
    telRisk.className = "t-val yellow";
  } else {
    telState.textContent = "Nominal (100ms Ping)";
    telState.className = "t-val green";
    telHealth.textContent = "96 / 100 (Optimal)";
    telHealth.className = "t-val green";
    telRisk.textContent = "Protected (N-1)";
    telRisk.className = "t-val green";
  }

  // Connected Assets List - show accurate status dot for each neighbor
  const connectedList = document.getElementById("connectedAssetsList");
  connectedList.innerHTML = "";
  const neighbors = state.networkData.edges.filter(e => e.source === node.id || e.target === node.id);
  document.getElementById("connectedCount").textContent = neighbors.length;

  neighbors.forEach(edge => {
    const targetId = edge.source === node.id ? edge.target : edge.source;
    const targetNode = state.networkData.nodes.find(n => n.id === targetId);
    if (!targetNode) return;

    const targetStatus = getNodeStatus(targetId);
    const targetStatusClass = targetStatus === 'failed' ? 'red' : (targetStatus === 'degraded' ? 'yellow' : 'green');

    const item = document.createElement("div");
    item.className = "connected-item";
    item.innerHTML = `
      <div class="connected-left">
        <span class="status-dot ${targetStatusClass}"></span>
        <span>${targetNode.label}</span>
      </div>
      <span class="edge-type-tag">${edge.type || 'Physical'}</span>
    `;
    item.addEventListener("click", () => {
      selectNode(targetId);
      if (targetNode.lat && targetNode.lng && state.map) {
        state.map.panTo([targetNode.lat, targetNode.lng]);
      }
    });
    connectedList.appendChild(item);
  });

  // Action Button Text
  const simBtnText = document.getElementById("simulateBtnText");
  simBtnText.textContent = status === "failed" ? "Re-simulate Failure" : "Simulate Failure";
}

function updateStepDetailsPanel(stepData) {
  if (!stepData) return;

  document.getElementById("stepDetailsTitle").textContent = `Step ${stepData.step} Details`;
  document.getElementById("stepFailuresBadge").textContent = `${stepData.newly_failed_count} new failure${stepData.newly_failed_count === 1 ? '' : 's'}`;

  const newlyFailedList = document.getElementById("newlyFailedList");
  newlyFailedList.innerHTML = "";

  if (!stepData.newly_failed || stepData.newly_failed.length === 0) {
    newlyFailedList.innerHTML = `<div class="empty-step-msg">No newly failed assets in this step.</div>`;
  } else {
    stepData.newly_failed.forEach(item => {
      const el = document.createElement("div");
      el.className = "failed-step-item";
      el.innerHTML = `
        <div>
          <div class="failed-step-name">
            <span>🔴</span>
            <span>${item.label}</span>
          </div>
          <div class="failed-step-sub">${item.reason || item.sub}</div>
        </div>
        <span class="badge red-soft">${item.sub || item.type}</span>
      `;
      newlyFailedList.appendChild(el);
    });
  }

  // Cumulative
  document.getElementById("stepCumFailedAssets").textContent = (stepData.cumulative_failed_nodes || []).length;
  document.getElementById("stepCumDemand").textContent = (stepData.affected_demand || 0).toLocaleString();
  document.getElementById("stepCumServiceLoss").textContent = `${(stepData.service_loss_pct || 0).toFixed(1)}%`;
}

function updateSidebarStats() {
  if (!state.networkData) return;
  document.getElementById("totalAssetsCount").textContent = state.networkData.nodes.length;
  document.getElementById("totalConnectionsCount").textContent = state.networkData.edges.length;

  let failedCount = 0;
  let degradedCount = 0;
  let operationalCount = 0;

  state.networkData.nodes.forEach(node => {
    const status = getNodeStatus(node.id);
    if (status === "failed") failedCount++;
    else if (status === "degraded") degradedCount++;
    else operationalCount++;
  });

  document.getElementById("failedCount").textContent = failedCount;
  document.getElementById("degradedCount").textContent = degradedCount;
  document.getElementById("operationalCount").textContent = operationalCount;
}

// ==========================================================================
// Playback Controls
// ==========================================================================
function togglePlay() {
  if (state.isPlaying) {
    pausePlayback();
  } else {
    startPlayback();
  }
}

function startPlayback() {
  if (!state.simulationResult) return;
  state.isPlaying = true;
  document.getElementById("playIcon")?.setAttribute("data-lucide", "pause");
  lucide.createIcons();

  // If at end, loop back to start
  if (state.currentStepIndex >= state.simulationResult.timeline.length - 1) {
    setSimulationStep(0);
  }

  const intervalMs = Math.round(1200 / state.playbackSpeed);
  state.playTimer = setInterval(() => {
    if (state.currentStepIndex < state.simulationResult.timeline.length - 1) {
      setSimulationStep(state.currentStepIndex + 1);
    } else {
      pausePlayback();
    }
  }, intervalMs);
}

function pausePlayback() {
  state.isPlaying = false;
  if (state.playTimer) clearInterval(state.playTimer);
  document.getElementById("playIcon")?.setAttribute("data-lucide", "play");
  lucide.createIcons();
}

function stepForward() {
  pausePlayback();
  if (state.simulationResult && state.currentStepIndex < state.simulationResult.timeline.length - 1) {
    setSimulationStep(state.currentStepIndex + 1);
  }
}

function stepBack() {
  pausePlayback();
  if (state.currentStepIndex > 0) {
    setSimulationStep(state.currentStepIndex - 1);
  }
}

function resetSimulation() {
  pausePlayback();
  setSimulationStep(0);
  showToast("Simulation reset to initial state");
}

// ==========================================================================
// Criticality Ranking Tab
// ==========================================================================
async function renderCriticalityTable() {
  try {
    const res = await fetch(`/api/criticality/${state.currentNetworkId}`);
    const data = await res.json();
    if (!data.success) return;

    const rankings = data.criticality_ranking;
    const tbody = document.getElementById("criticalityTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    document.getElementById("criticalCountBadge").textContent = `${rankings.length} Assets Analyzed`;

    rankings.forEach((item, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><span class="rank-pill ${idx < 3 ? 'top-3' : ''}">${idx + 1}</span></td>
        <td><code>${item.external_id}</code></td>
        <td><strong>${item.label}</strong></td>
        <td><span class="badge" style="background: rgba(59,130,246,0.15); color: #93c5fd">${item.sub}</span></td>
        <td>${item.capacity_lost.toLocaleString()}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div class="bar-track"><div class="bar-fill" style="width: ${item.severity_pct}%"></div></div>
            <span style="font-size: 11.5px; font-weight: 600; color: #f87171">${item.service_loss_pct.toFixed(1)}%</span>
          </div>
        </td>
        <td><strong>${item.cascade_size}</strong> nodes (${item.cascade_depth} hops)</td>
        <td>${item.affected_demand.toLocaleString()}</td>
        <td>
          <button class="primary-btn" style="padding: 4px 10px; font-size: 11px;" onclick="simulateFromCriticality('${item.id}')">
            Simulate
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Criticality error:", err);
  }
}

window.simulateFromCriticality = function(nodeId) {
  selectNode(nodeId);
  switchTab("network-analysis");
  runSimulation([nodeId]);
};

// ==========================================================================
// Network Management Tab
// ==========================================================================
function renderManagementTable() {
  const tbody = document.getElementById("managementNodesBody");
  if (!tbody || !state.networkData) return;
  tbody.innerHTML = "";

  state.networkData.nodes.forEach(node => {
    const status = getNodeStatus(node.id);
    const statusBadgeClass = status === 'failed' ? 'red' : (status === 'degraded' ? 'yellow' : 'green');
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><code>${node.id}</code></td>
      <td><strong>${node.label}</strong></td>
      <td><span class="asset-status-badge ${statusBadgeClass}" style="display: inline-block;">${status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
      <td><span class="badge" style="background: rgba(59,130,246,0.15); color: #93c5fd">${node.type}</span></td>
      <td>${node.capacity.toLocaleString()} ${node.unit || ''}</td>
      <td>${node.load.toLocaleString()} ${node.unit || ''}</td>
      <td>${(node.lat || 0).toFixed(4)}, ${(node.lng || 0).toFixed(4)}</td>
      <td>
        <button class="secondary-btn" style="padding: 3px 8px; font-size: 11px;" onclick="deleteNodeFromManagement('${node.id}')">
          Delete
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.deleteNodeFromManagement = async function(nodeId) {
  if (!confirm(`Are you sure you want to delete asset "${nodeId}"?`)) return;
  try {
    const res = await fetch(`/api/network/${state.currentNetworkId}/node/${nodeId}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      showToast(`Asset deleted`);
      await loadNetwork(state.currentNetworkId);
    }
  } catch (err) {
    console.error("Delete node error:", err);
  }
};

// ==========================================================================
// Event Listeners & Interactive Handlers
// ==========================================================================
function bindEventListeners() {
  // Navigation Tabs
  document.querySelectorAll(".nav-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      const tabId = tab.dataset.tab;
      switchTab(tabId);
    });
  });

  // Network Selectors
  const networkSelectors = [document.getElementById("globalNetworkSelect"), document.getElementById("sidebarNetworkSelect")];
  networkSelectors.forEach(sel => {
    if (!sel) return;
    sel.addEventListener("change", (e) => {
      const netId = e.target.value;
      networkSelectors.forEach(s => s.value = netId);
      loadNetwork(netId);
    });
  });

  // Map Controls
  document.getElementById("mapModeVector")?.addEventListener("click", () => setMapMode("vector"));
  document.getElementById("mapModeSatellite")?.addEventListener("click", () => setMapMode("satellite"));

  document.getElementById("zoomInBtn")?.addEventListener("click", () => state.map?.zoomIn());
  document.getElementById("zoomOutBtn")?.addEventListener("click", () => state.map?.zoomOut());
  document.getElementById("recenterMapBtn")?.addEventListener("click", () => {
    if (state.networkData?.nodes && state.map) {
      const lats = state.networkData.nodes.map(n => n.lat || 12.98);
      const lngs = state.networkData.nodes.map(n => n.lng || 80.24);
      const bounds = L.latLngBounds([Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]);
      state.map.fitBounds(bounds, { padding: [40, 40] });
    }
  });

  // Timeline Controls
  document.getElementById("playPauseBtn")?.addEventListener("click", togglePlay);
  document.getElementById("stepForwardBtn")?.addEventListener("click", stepForward);
  document.getElementById("stepBackBtn")?.addEventListener("click", stepBack);
  document.getElementById("resetSimBtn")?.addEventListener("click", resetSimulation);

  document.getElementById("playbackSpeedSelect")?.addEventListener("change", (e) => {
    state.playbackSpeed = parseFloat(e.target.value);
    if (state.isPlaying) {
      pausePlayback();
      startPlayback();
    }
  });

  // Primary Action Button (Simulate Failure)
  document.getElementById("simulateFailureBtn")?.addEventListener("click", () => {
    if (state.selectedNodeId) {
      runSimulation([state.selectedNodeId]);
      showToast(`Simulated failure of ${state.selectedNodeId}`);
    }
  });

  // Secondary Action: Inject 50% Load Surge
  document.getElementById("injectStressBtn")?.addEventListener("click", () => {
    if (!state.selectedNodeId || !state.networkData) return;
    const node = state.networkData.nodes.find(n => n.id === state.selectedNodeId);
    if (node) {
      node.load = Math.min(node.capacity * 1.4, node.load * 1.5);
      runSimulation([state.selectedNodeId]);
      showToast(`Injected +50% Load Surge into ${node.label}`);
    }
  });

  // Secondary Action: Restore Asset to Nominal
  document.getElementById("restoreAssetBtn")?.addEventListener("click", () => {
    if (!state.selectedNodeId || !state.networkData) return;
    const node = state.networkData.nodes.find(n => n.id === state.selectedNodeId);
    if (node) {
      node.load = node.capacity * 0.7;
      runSimulation([]);
      showToast(`Restored ${node.label} to nominal state`);
    }
  });

  // Secondary Action: Focus View Connections
  document.getElementById("viewAllConnectionsBtn")?.addEventListener("click", () => {
    if (!state.selectedNodeId || !state.networkData || !state.map) return;
    const node = state.networkData.nodes.find(n => n.id === state.selectedNodeId);
    if (!node) return;
    const neighbors = state.networkData.edges.filter(e => e.source === node.id || e.target === node.id);
    const relatedIds = [node.id, ...neighbors.map(e => e.source === node.id ? e.target : e.source)];
    const relatedNodes = state.networkData.nodes.filter(n => relatedIds.includes(n.id));
    if (relatedNodes.length > 0) {
      const bounds = L.latLngBounds(relatedNodes.map(n => [n.lat || 12.98, n.lng || 80.24]));
      state.map.fitBounds(bounds, { padding: [50, 50] });
      showToast(`Focused on ${node.label} and ${neighbors.length} connected links`);
    }
  });

  // View in Maps Button
  document.getElementById("viewInMapsBtn")?.addEventListener("click", () => {
    const node = state.networkData?.nodes.find(n => n.id === state.selectedNodeId);
    if (node && node.lat && node.lng) {
      window.open(`https://www.google.com/maps?q=${node.lat},${node.lng}`, "_blank");
    }
  });

  // Filter Checkboxes
  document.querySelectorAll("[data-filter-type]").forEach(chk => {
    chk.addEventListener("change", () => {
      const val = chk.value;
      if (chk.checked) state.filters.types.add(val);
      else state.filters.types.delete(val);
      updateSvgVisualStates();
    });
  });

  document.querySelectorAll("[data-filter-status]").forEach(chk => {
    chk.addEventListener("change", () => {
      const val = chk.getAttribute("data-filter-status");
      if (chk.checked) state.filters.statuses.add(val);
      else state.filters.statuses.delete(val);
      updateSvgVisualStates();
    });
  });

  document.querySelectorAll("[data-filter-edge]").forEach(chk => {
    chk.addEventListener("change", () => {
      const val = chk.getAttribute("data-filter-edge");
      if (chk.checked) state.filters.edges.add(val);
      else state.filters.edges.delete(val);
      updateSvgVisualStates();
    });
  });

  // Settings Modal
  document.getElementById("settingsBtn")?.addEventListener("click", () => {
    document.getElementById("settingsModal").classList.add("open");
  });
  document.getElementById("closeSettingsModalBtn")?.addEventListener("click", () => {
    document.getElementById("settingsModal").classList.remove("open");
  });
  document.getElementById("settingDamping")?.addEventListener("input", (e) => {
    document.getElementById("dampingValDisplay").textContent = e.target.value;
  });
  document.getElementById("settingThreshold")?.addEventListener("input", (e) => {
    document.getElementById("thresholdValDisplay").textContent = `${e.target.value}x`;
  });
  document.getElementById("saveSettingsBtn")?.addEventListener("click", () => {
    state.physics.damping = parseFloat(document.getElementById("settingDamping").value);
    state.physics.thresholdMult = parseFloat(document.getElementById("settingThreshold").value);
    document.getElementById("settingsModal").classList.remove("open");
    runSimulation([state.selectedNodeId]);
    showToast("Applied updated physics parameters");
  });

  // Help Modal
  document.getElementById("helpBtn")?.addEventListener("click", () => {
    showToast("Press Space to Play/Pause, ←/→ to step through failure hops, Ctrl+K to search assets.");
  });

  // Add Asset Modal
  document.getElementById("addNewAssetModalBtn")?.addEventListener("click", () => {
    document.getElementById("assetModal").classList.add("open");
  });
  document.getElementById("closeAssetModalBtn")?.addEventListener("click", () => {
    document.getElementById("assetModal").classList.remove("open");
  });
  document.getElementById("cancelAssetModalBtn")?.addEventListener("click", () => {
    document.getElementById("assetModal").classList.remove("open");
  });
  document.getElementById("assetForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newAsset = {
      id: document.getElementById("formAssetId").value.trim().toLowerCase().replace(/\s+/g, '_'),
      label: document.getElementById("formAssetName").value.trim(),
      type: document.getElementById("formAssetType").value,
      external_id: document.getElementById("formAssetExternalId").value.trim(),
      capacity: parseFloat(document.getElementById("formAssetCapacity").value),
      load: parseFloat(document.getElementById("formAssetLoad").value),
      lat: parseFloat(document.getElementById("formAssetLat").value),
      lng: parseFloat(document.getElementById("formAssetLng").value),
      x: 500, y: 300
    };

    try {
      const res = await fetch(`/api/network/${state.currentNetworkId}/node`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAsset)
      });
      const data = await res.json();
      if (data.success) {
        document.getElementById("assetModal").classList.remove("open");
        showToast(`Added ${newAsset.label}`);
        await loadNetwork(state.currentNetworkId);
      }
    } catch (err) {
      console.error(err);
    }
  });

  // Export JSON
  document.getElementById("exportNetworkJsonBtn")?.addEventListener("click", () => {
    window.location.href = `/api/export/${state.currentNetworkId}`;
  });

  // Search
  document.getElementById("assetSearchInput")?.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) return;
    const match = state.networkData?.nodes.find(n => n.label.toLowerCase().includes(q) || n.id.toLowerCase().includes(q));
    if (match) {
      selectNode(match.id);
      if (match.lat && match.lng && state.map) {
        state.map.panTo([match.lat, match.lng]);
      }
    }
  });
}

function switchTab(tabId) {
  document.querySelectorAll(".nav-tab").forEach(t => t.classList.toggle("active", t.dataset.tab === tabId));
  document.querySelectorAll(".tab-view").forEach(v => v.classList.toggle("active", v.id === `view-${tabId}`));

  if (tabId === "network-analysis") {
    setTimeout(() => {
      state.map?.invalidateSize();
      updateSvgPositions();
    }, 100);
  } else if (tabId === "criticality") {
    renderCriticalityTable();
  } else if (tabId === "network-management") {
    renderManagementTable();
  }
}

// ==========================================================================
// Quick Search (Ctrl+K) & Shortcuts
// ==========================================================================
function initKeyboardShortcuts() {
  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openQuickSearch();
    }
    if (e.key === "Escape") {
      closeAllModals();
    }
    if (e.key === " " && !isInputActive()) {
      e.preventDefault();
      togglePlay();
    }
    if (e.key === "ArrowRight" && !isInputActive()) {
      stepForward();
    }
    if (e.key === "ArrowLeft" && !isInputActive()) {
      stepBack();
    }
  });

  document.getElementById("quickSearchInput")?.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    renderQuickSearchResults(q);
  });
}

function isInputActive() {
  const el = document.activeElement;
  return el && (el.tagName === "INPUT" || el.tagName === "SELECT" || el.tagName === "TEXTAREA");
}

function openQuickSearch() {
  const modal = document.getElementById("searchModal");
  modal.classList.add("open");
  const input = document.getElementById("quickSearchInput");
  input.value = "";
  input.focus();
  renderQuickSearchResults("");
}

function renderQuickSearchResults(query) {
  const list = document.getElementById("quickSearchResultsList");
  if (!list || !state.networkData) return;
  list.innerHTML = "";

  const matches = state.networkData.nodes.filter(n => {
    if (!query) return true;
    return n.label.toLowerCase().includes(query) || (n.external_id && n.external_id.toLowerCase().includes(query)) || n.type.toLowerCase().includes(query);
  });

  if (matches.length === 0) {
    list.innerHTML = `<div style="padding: 16px; color: #64748b; text-align: center;">No assets found matching "${query}"</div>`;
    return;
  }

  matches.forEach(node => {
    const status = getNodeStatus(node.id);
    const statusDotClass = status === 'failed' ? 'red' : (status === 'degraded' ? 'yellow' : 'green');
    const item = document.createElement("div");
    item.className = "search-result-item";
    item.innerHTML = `
      <div class="search-res-info">
        <span class="search-res-title"><span class="status-dot ${statusDotClass}" style="margin-right: 6px;"></span>${node.label}</span>
        <span class="search-res-sub">${node.sub || node.type} • ${node.capacity} ${node.unit || ''}</span>
      </div>
      <span class="badge" style="background: rgba(59,130,246,0.15); color: #93c5fd">${node.external_id || node.id}</span>
    `;
    item.addEventListener("click", () => {
      selectNode(node.id);
      closeAllModals();
      switchTab("network-analysis");
      if (node.lat && node.lng && state.map) {
        state.map.panTo([node.lat, node.lng]);
      }
    });
    list.appendChild(item);
  });
}

function closeAllModals() {
  document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("open"));
}

// ==========================================================================
// Toast Notifications
// ==========================================================================
function showToast(message, type = "info") {
  const hub = document.getElementById("toastHub");
  if (!hub) return;

  const toast = document.createElement("div");
  toast.className = "toast-item";
  toast.innerHTML = `
    <i data-lucide="${type === 'error' ? 'alert-circle' : 'check-circle'}" style="color: ${type === 'error' ? '#ef4444' : '#22c55e'}; width: 16px; height: 16px;"></i>
    <span>${message}</span>
  `;
  hub.appendChild(toast);
  lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
