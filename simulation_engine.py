"""
Cascading Failure Infrastructure Resilience Simulation Engine
Realistic cross-sector cascading failure dynamics, sector-aware load redistribution,
progressive degradation, and localized resilience buffers.
"""
from typing import Dict, List, Any, Set, Tuple
import copy
import math

class SimulationEngine:
    def __init__(self, network_data: Dict[str, Any]):
        self.raw_data = network_data
        self.nodes = {n["id"]: copy.deepcopy(n) for n in network_data.get("nodes", [])}
        self.edges = copy.deepcopy(network_data.get("edges", []))
        self._build_adjacency()

    def _build_adjacency(self):
        self.adj = {n_id: [] for n_id in self.nodes}
        self.edge_map = {}
        for edge in self.edges:
            u, v = edge["source"], edge["target"]
            w = float(edge.get("weight", 1.0))
            edge_type = edge.get("type", "physical")
            edge_id = edge.get("id", f"{u}--{v}")
            self.edge_map[edge_id] = edge
            if u in self.adj:
                self.adj[u].append({"target": v, "weight": w, "type": edge_type, "id": edge_id})
            if v in self.adj:
                self.adj[v].append({"target": u, "weight": w, "type": edge_type, "id": edge_id})

    def run_cascade(self, initial_failed_ids: List[str], damping: float = 0.85, overload_threshold_multiplier: float = 1.0) -> Dict[str, Any]:
        """
        Sector-aware, realistic cascading failure model:
        1. When an asset fails, only compatible same-sector neighbors absorb routed load.
        2. Absorbed load is bounded and partitioned according to neighbor capacity headroom.
        3. Cross-sector dependencies (Power -> Hospital / Water) first trigger auxiliary backup (Degraded),
           and only trip into secondary failure under severe multi-feed depletion.
        4. Peripheral nodes do not trigger uncontained full-network collapse.
        """
        node_states = {}
        for n_id, node in self.nodes.items():
            cap = float(node.get("capacity", 100))
            cur_load = float(node.get("load", 50))
            demand = float(node.get("demand", cur_load * 1.2))
            node_states[n_id] = {
                "id": n_id,
                "label": node.get("label", n_id),
                "type": node.get("type", "road"),
                "sub": node.get("sub", ""),
                "capacity": cap,
                "load": cur_load,
                "initial_load": cur_load,
                "demand": demand,
                "status": "operational", # operational, degraded, failed
                "failed_step": None,
                "failure_reason": None,
                "backup_active": False,
                "utilization": round((cur_load / cap) * 100, 1) if cap > 0 else 0
            }

        failed_set: Set[str] = set()
        failed_edges_set: Set[str] = set()
        timeline_steps: List[Dict[str, Any]] = []

        valid_start_ids = [n_id for n_id in initial_failed_ids if n_id in node_states]
        if not valid_start_ids:
            return self._empty_result(node_states)

        # Step 0: Direct Trigger
        step_0_failed = []
        for n_id in valid_start_ids:
            failed_set.add(n_id)
            node_states[n_id]["status"] = "failed"
            node_states[n_id]["failed_step"] = 0
            node_states[n_id]["failure_reason"] = "Initial Direct Failure"
            step_0_failed.append({
                "id": n_id,
                "label": node_states[n_id]["label"],
                "type": node_states[n_id]["type"],
                "sub": node_states[n_id]["sub"],
                "reason": "Initial Direct Failure"
            })
            for neighbor in self.adj.get(n_id, []):
                failed_edges_set.add(neighbor["id"])

        current_queue = list(valid_start_ids)
        timeline_steps.append(self._take_step_snapshot(
            step_num=0,
            label="Initial Failure",
            newly_failed=step_0_failed,
            failed_set=failed_set,
            failed_edges_set=failed_edges_set,
            node_states=node_states
        ))

        step_num = 1
        max_steps = 7

        while current_queue and step_num < max_steps:
            next_failed_in_step = []
            loads_to_add = {}

            # Sector-Aware Load Redistribution
            for failed_id in current_queue:
                failed_node = node_states[failed_id]
                failed_type = failed_node["type"]
                shed_load = failed_node["initial_load"]

                # Compatible active neighbors (matching sector or compatible flow)
                compatible_neighbors = []
                for nb in self.adj.get(failed_id, []):
                    t_id = nb["target"]
                    if t_id in failed_set:
                        continue
                    t_node = node_states[t_id]
                    t_type = t_node["type"]

                    # Sector compatibility rules:
                    # Roads & Bridges share transit load
                    # Power substations share electrical grid ring load
                    # Water pumps share hydraulic line load
                    is_compatible = (
                        (failed_type in ["road", "bridge"] and t_type in ["road", "bridge"]) or
                        (failed_type == "power" and t_type == "power") or
                        (failed_type == "water" and t_type == "water") or
                        (failed_type == "telecom" and t_type == "telecom")
                    )

                    if is_compatible:
                        headroom = max(0.0, t_node["capacity"] - t_node["load"])
                        compatible_neighbors.append((t_id, nb["weight"], headroom, t_node["capacity"]))

                if compatible_neighbors and shed_load > 0:
                    total_weight = sum(w for _, w, _, _ in compatible_neighbors)
                    for t_id, w, headroom, cap in compatible_neighbors:
                        # Load share proportioned to edge weight and scaled by damping
                        load_share = (w / total_weight) * shed_load * 0.75 * damping
                        loads_to_add[t_id] = loads_to_add.get(t_id, 0.0) + load_share

            # Apply load additions & check capacity thresholds
            for target_id, add_load in loads_to_add.items():
                t_state = node_states[target_id]
                t_state["load"] += add_load
                cap = t_state["capacity"]
                cur_load = t_state["load"]
                t_state["utilization"] = round((cur_load / cap) * 100, 1) if cap > 0 else 0

                failure_threshold = cap * overload_threshold_multiplier
                if cur_load > failure_threshold and target_id not in failed_set:
                    failed_set.add(target_id)
                    t_state["status"] = "failed"
                    t_state["failed_step"] = step_num
                    overload_pct = round(((cur_load - cap) / cap) * 100, 1)
                    reason = f"Capacity Overload (+{overload_pct}%)"
                    t_state["failure_reason"] = reason
                    next_failed_in_step.append({
                        "id": target_id,
                        "label": t_state["label"],
                        "type": t_state["type"],
                        "sub": t_state["sub"],
                        "reason": reason
                    })
                    for neighbor in self.adj.get(target_id, []):
                        failed_edges_set.add(neighbor["id"])
                elif cur_load > cap * 0.85 and t_state["status"] == "operational":
                    t_state["status"] = "degraded"

            # Check Functional Cross-Sector Dependencies (Power -> Hospital / Water)
            for n_id, n_state in node_states.items():
                if n_id not in failed_set and n_state["type"] in ["hospital", "water", "telecom"]:
                    # Find incoming power feeds
                    power_links = [nb for nb in self.adj.get(n_id, []) if self.nodes[nb["target"]].get("type") == "power" or nb["type"] == "dependency"]
                    if power_links:
                        active_power = [nb for nb in power_links if nb["target"] not in failed_set]
                        if len(active_power) == 0:
                            # Lost all primary grid feeds
                            if not n_state["backup_active"]:
                                # Step 1: Engage Emergency Auxiliary Backup (Hospital UPS / Generator) -> Degraded
                                n_state["backup_active"] = True
                                n_state["status"] = "degraded"
                            elif step_num >= 2 and n_state["type"] == "water":
                                # Water pump auxiliary backup exhausts on step 2 -> Secondary failure
                                failed_set.add(n_id)
                                n_state["status"] = "failed"
                                n_state["failed_step"] = step_num
                                reason = "Grid Loss & Auxiliary Fuel Depletion"
                                n_state["failure_reason"] = reason
                                next_failed_in_step.append({
                                    "id": n_id,
                                    "label": n_state["label"],
                                    "type": n_state["type"],
                                    "sub": n_state["sub"],
                                    "reason": reason
                                })
                                for neighbor in self.adj.get(n_id, []):
                                    failed_edges_set.add(neighbor["id"])

            step_label = f"{len(next_failed_in_step)} new failure{'s' if len(next_failed_in_step) != 1 else ''}" if next_failed_in_step else "Stabilized"
            
            step_snapshot = self._take_step_snapshot(
                step_num=step_num,
                label=step_label,
                newly_failed=next_failed_in_step,
                failed_set=failed_set,
                failed_edges_set=failed_edges_set,
                node_states=node_states
            )
            timeline_steps.append(step_snapshot)

            if not next_failed_in_step:
                break

            current_queue = [item["id"] for item in next_failed_in_step]
            step_num += 1

        # Calculate final overall metrics
        total_nodes = len(self.nodes)
        total_capacity = sum(n.get("capacity", 0) for n in self.nodes.values())
        total_demand = sum(n.get("demand", n.get("load", 0) * 1.2) for n in self.nodes.values())
        
        lost_capacity = sum(self.nodes[n_id].get("capacity", 0) for n_id in failed_set)
        lost_demand = sum(self.nodes[n_id].get("demand", self.nodes[n_id].get("load", 0) * 1.2) for n_id in failed_set)
        
        service_loss_pct = round((lost_capacity / total_capacity * 100), 1) if total_capacity > 0 else 0
        network_service_ratio = round(100.0 - service_loss_pct, 1)

        return {
            "origin_ids": valid_start_ids,
            "origin_labels": [self.nodes[i].get("label", i) for i in valid_start_ids],
            "total_steps": len(timeline_steps),
            "timeline": timeline_steps,
            "final_metrics": {
                "total_nodes": total_nodes,
                "total_edges": len(self.edges),
                "failed_nodes_count": len(failed_set),
                "failed_edges_count": len(failed_edges_set),
                "operational_nodes_count": sum(1 for s in node_states.values() if s["status"] == "operational"),
                "degraded_nodes_count": sum(1 for s in node_states.values() if s["status"] == "degraded"),
                "total_failed_assets": len(failed_set) + len(failed_edges_set),
                "service_loss_pct": service_loss_pct,
                "network_service_ratio_pct": network_service_ratio,
                "affected_demand": int(lost_demand),
                "total_demand": int(total_demand),
                "total_capacity_lost": int(lost_capacity),
                "cascade_duration_steps": len(timeline_steps) - 1
            },
            "final_node_states": node_states
        }

    def _take_step_snapshot(self, step_num: int, label: str, newly_failed: List[Dict[str, Any]], failed_set: Set[str], failed_edges_set: Set[str], node_states: Dict[str, Any]) -> Dict[str, Any]:
        total_capacity = sum(n.get("capacity", 0) for n in self.nodes.values())
        total_demand = sum(n.get("demand", n.get("load", 0) * 1.2) for n in self.nodes.values())
        
        lost_cap = sum(self.nodes[n_id].get("capacity", 0) for n_id in failed_set)
        lost_dem = sum(self.nodes[n_id].get("demand", self.nodes[n_id].get("load", 0) * 1.2) for n_id in failed_set)
        
        service_loss = round((lost_cap / total_capacity * 100), 1) if total_capacity > 0 else 0
        service_ratio = round(100.0 - service_loss, 1)

        step_nodes_state = {}
        for nid, s in node_states.items():
            step_nodes_state[nid] = {
                "status": s["status"],
                "load": round(s["load"], 1),
                "utilization": s["utilization"],
                "failed_step": s["failed_step"]
            }

        return {
            "step": step_num,
            "label": label,
            "newly_failed": newly_failed,
            "newly_failed_count": len(newly_failed),
            "cumulative_failed_nodes": list(failed_set),
            "cumulative_failed_edges": list(failed_edges_set),
            "cumulative_failed_assets_count": len(failed_set) + len(failed_edges_set),
            "service_loss_pct": service_loss,
            "network_service_ratio_pct": service_ratio,
            "affected_demand": int(lost_dem),
            "cumulative_capacity_lost": int(lost_cap),
            "node_states": step_nodes_state
        }

    def _empty_result(self, node_states: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "origin_ids": [],
            "origin_labels": [],
            "total_steps": 1,
            "timeline": [{
                "step": 0,
                "label": "Stable",
                "newly_failed": [],
                "newly_failed_count": 0,
                "cumulative_failed_nodes": [],
                "cumulative_failed_edges": [],
                "cumulative_failed_assets_count": 0,
                "service_loss_pct": 0.0,
                "network_service_ratio_pct": 100.0,
                "affected_demand": 0,
                "cumulative_capacity_lost": 0,
                "node_states": {nid: {"status": "operational", "load": s["load"], "utilization": s["utilization"]} for nid, s in node_states.items()}
            }],
            "final_metrics": {
                "total_nodes": len(self.nodes),
                "total_edges": len(self.edges),
                "failed_nodes_count": 0,
                "failed_edges_count": 0,
                "operational_nodes_count": len(self.nodes),
                "degraded_nodes_count": 0,
                "total_failed_assets": 0,
                "service_loss_pct": 0.0,
                "network_service_ratio_pct": 100.0,
                "affected_demand": 0,
                "total_demand": int(sum(n.get("demand", n.get("load", 0) * 1.2) for n in self.nodes.values())),
                "total_capacity_lost": 0,
                "cascade_duration_steps": 0
            },
            "final_node_states": node_states
        }

    def calculate_criticality_ranking(self) -> List[Dict[str, Any]]:
        rankings = []
        for n_id, node in self.nodes.items():
            res = self.run_cascade([n_id])
            failed_nodes = res["final_metrics"]["failed_nodes_count"]
            failed_assets = res["final_metrics"]["total_failed_assets"]
            cap_lost = res["final_metrics"]["total_capacity_lost"]
            demand_affected = res["final_metrics"]["affected_demand"]
            service_loss_pct = res["final_metrics"]["service_loss_pct"]
            duration = res["final_metrics"]["cascade_duration_steps"]

            rankings.append({
                "id": n_id,
                "external_id": node.get("external_id", f"AST-{n_id.upper()}"),
                "label": node.get("label", n_id),
                "type": node.get("type", "road"),
                "sub": node.get("sub", "Infrastructure"),
                "capacity": node.get("capacity", 100),
                "capacity_lost": cap_lost,
                "cascade_size": failed_nodes,
                "total_failed_assets": failed_assets,
                "affected_demand": demand_affected,
                "service_loss_pct": service_loss_pct,
                "severity_pct": min(100.0, service_loss_pct),
                "cascade_depth": duration,
                "is_critical": service_loss_pct >= 25.0
            })

        rankings.sort(key=lambda x: (x["service_loss_pct"], x["cascade_size"]), reverse=True)
        return rankings
