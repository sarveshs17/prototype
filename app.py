"""
Flask REST API & Web Server for Resilience Infrastructure Simulator.
Provides real simulation computation, criticality analysis, scenario lab,
and network management backend endpoints.
"""
from flask import Flask, jsonify, request, send_from_directory, Response
import os
import json
import copy
from networks_data import NETWORKS
from simulation_engine import SimulationEngine

app = Flask(__name__, static_folder="static", static_url_path="")

# In-memory network store (allows dynamic additions/edits)
ACTIVE_NETWORKS = copy.deepcopy(NETWORKS)

@app.route("/")
def index():
    return send_from_directory("static", "index.html")

@app.route("/api/networks", methods=["GET"])
def get_networks():
    """Returns list of available networks with high-level stats."""
    res = []
    for nid, net in ACTIVE_NETWORKS.items():
        res.append({
            "id": net["id"],
            "name": net["name"],
            "region": net.get("region", ""),
            "assets_count": len(net.get("nodes", [])),
            "connections_count": len(net.get("edges", [])),
            "description": net.get("description", "")
        })
    return jsonify({"success": True, "networks": res})

@app.route("/api/network/<network_id>", methods=["GET"])
def get_network(network_id):
    """Returns full graph data and initial topology for a network."""
    if network_id not in ACTIVE_NETWORKS:
        return jsonify({"success": False, "error": "Network not found"}), 404
    
    net = ACTIVE_NETWORKS[network_id]
    engine = SimulationEngine(net)
    initial_sim = engine.run_cascade([])
    
    return jsonify({
        "success": True,
        "network": net,
        "initial_state": initial_sim
    })

@app.route("/api/simulate", methods=["POST"])
def simulate_cascade():
    """
    Executes a cascading failure simulation.
    Payload: {
        "network_id": "chennai_demo",
        "node_ids": ["thiruvanmiyur_bridge"],
        "damping": 0.95,
        "overload_threshold_multiplier": 1.0
    }
    """
    data = request.get_json() or {}
    network_id = data.get("network_id", "chennai_demo")
    node_ids = data.get("node_ids", [])
    damping = float(data.get("damping", 0.95))
    threshold_mult = float(data.get("overload_threshold_multiplier", 1.0))

    if network_id not in ACTIVE_NETWORKS:
        return jsonify({"success": False, "error": "Network not found"}), 404

    net = ACTIVE_NETWORKS[network_id]
    engine = SimulationEngine(net)
    result = engine.run_cascade(
        initial_failed_ids=node_ids,
        damping=damping,
        overload_threshold_multiplier=threshold_mult
    )

    return jsonify({
        "success": True,
        "network_id": network_id,
        "result": result
    })

@app.route("/api/criticality/<network_id>", methods=["GET"])
def get_criticality(network_id):
    """Computes exhaustive single-point-of-failure criticality ranking."""
    if network_id not in ACTIVE_NETWORKS:
        return jsonify({"success": False, "error": "Network not found"}), 404

    net = ACTIVE_NETWORKS[network_id]
    engine = SimulationEngine(net)
    rankings = engine.calculate_criticality_ranking()

    return jsonify({
        "success": True,
        "network_id": network_id,
        "criticality_ranking": rankings
    })

@app.route("/api/network/<network_id>/node", methods=["POST"])
def save_node(network_id):
    """Adds or updates a node in the network."""
    if network_id not in ACTIVE_NETWORKS:
        return jsonify({"success": False, "error": "Network not found"}), 404

    data = request.get_json() or {}
    node_id = data.get("id")
    if not node_id:
        return jsonify({"success": False, "error": "Node ID required"}), 400

    net = ACTIVE_NETWORKS[network_id]
    existing = next((n for n in net["nodes"] if n["id"] == node_id), None)
    if existing:
        existing.update(data)
    else:
        net["nodes"].append(data)

    return jsonify({"success": True, "node": data, "total_nodes": len(net["nodes"])})

@app.route("/api/network/<network_id>/node/<node_id>", methods=["DELETE"])
def delete_node(network_id, node_id):
    """Deletes a node and its incident edges."""
    if network_id not in ACTIVE_NETWORKS:
        return jsonify({"success": False, "error": "Network not found"}), 404

    net = ACTIVE_NETWORKS[network_id]
    net["nodes"] = [n for n in net["nodes"] if n["id"] != node_id]
    net["edges"] = [e for e in net["edges"] if e["source"] != node_id and e["target"] != node_id]

    return jsonify({"success": True, "deleted_node_id": node_id})

@app.route("/api/network/<network_id>/edge", methods=["POST"])
def save_edge(network_id):
    """Adds or updates an edge in the network."""
    if network_id not in ACTIVE_NETWORKS:
        return jsonify({"success": False, "error": "Network not found"}), 404

    data = request.get_json() or {}
    source = data.get("source")
    target = data.get("target")
    if not source or not target:
        return jsonify({"success": False, "error": "Source and target required"}), 400

    edge_id = data.get("id", f"{source}--{target}")
    data["id"] = edge_id
    net = ACTIVE_NETWORKS[network_id]
    
    existing = next((e for e in net["edges"] if e["id"] == edge_id), None)
    if existing:
        existing.update(data)
    else:
        net["edges"].append(data)

    return jsonify({"success": True, "edge": data, "total_edges": len(net["edges"])})

@app.route("/api/network/<network_id>/edge/<edge_id>", methods=["DELETE"])
def delete_edge(network_id, edge_id):
    """Deletes an edge."""
    if network_id not in ACTIVE_NETWORKS:
        return jsonify({"success": False, "error": "Network not found"}), 404

    net = ACTIVE_NETWORKS[network_id]
    net["edges"] = [e for e in net["edges"] if e["id"] != edge_id]

    return jsonify({"success": True, "deleted_edge_id": edge_id})

@app.route("/api/export/<network_id>", methods=["GET"])
def export_network(network_id):
    """Exports network as JSON."""
    if network_id not in ACTIVE_NETWORKS:
        return jsonify({"success": False, "error": "Network not found"}), 404

    net = ACTIVE_NETWORKS[network_id]
    return Response(
        json.dumps(net, indent=2),
        mimetype="application/json",
        headers={"Content-Disposition": f"attachment;filename={network_id}_resilience_grid.json"}
    )

if __name__ == "__main__":
    print("Starting Resilience Simulator server on http://127.0.0.1:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)

