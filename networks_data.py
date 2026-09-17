"""
Rich pre-configured infrastructure network datasets for Resilience Simulator.
Clean, sensible connectivity with realistic capacity headroom and cross-sector coupling.
"""

NETWORKS = {
    "chennai_demo": {
        "id": "chennai_demo",
        "name": "Chennai Demo Network",
        "region": "Chennai, Tamil Nadu, India",
        "center": [12.9820, 80.2420],
        "zoom": 13,
        "description": "South Chennai arterial infrastructure: power rings, transport corridors, hospitals, and water networks.",
        "assets_count": 15,
        "connections_count": 16,
        "nodes": [
            {
                "id": "thiruvanmiyur_bridge",
                "external_id": "BR-014",
                "label": "Thiruvanmiyur Bridge",
                "sub": "Bridge",
                "type": "bridge",
                "x": 680, "y": 210,
                "lat": 12.9901, "lng": 80.2536,
                "capacity": 5000,
                "unit": "vehicles/hr",
                "load": 3200,
                "demand": 4200,
                "image_url": "https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=600&q=80",
                "description": "Arterial 4-lane bridge connecting coastal ECR traffic to the central radial corridor."
            },
            {
                "id": "velachery_substation",
                "external_id": "PS-003",
                "label": "Velachery Substation",
                "sub": "Power Substation",
                "type": "power",
                "x": 240, "y": 300,
                "lat": 12.9780, "lng": 80.2185,
                "capacity": 250,
                "unit": "MW",
                "load": 170,
                "demand": 220,
                "image_url": "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80",
                "description": "230kV / 110kV primary grid transmission substation feeding southern Chennai."
            },
            {
                "id": "global_hospitals",
                "external_id": "HP-001",
                "label": "Global Hospitals",
                "sub": "Super-specialty Hospital",
                "type": "hospital",
                "x": 350, "y": 380,
                "lat": 12.9650, "lng": 80.2280,
                "capacity": 1000,
                "unit": "beds / kW",
                "load": 650,
                "demand": 800,
                "image_url": "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80",
                "description": "Major regional trauma center equipped with dual-feed power and emergency backup."
            },
            {
                "id": "iit_madras",
                "external_id": "ED-002",
                "label": "Indian Institute of Technology Madras",
                "sub": "Research Hub",
                "type": "demand",
                "x": 480, "y": 180,
                "lat": 12.9915, "lng": 80.2337,
                "capacity": 300,
                "unit": "MVA",
                "load": 180,
                "demand": 210,
                "image_url": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80",
                "description": "High-density academic campus and national research facilities."
            },
            {
                "id": "ps_senior_school",
                "external_id": "ED-005",
                "label": "PS Senior Secondary School",
                "sub": "Emergency Shelter Zone",
                "type": "demand",
                "x": 720, "y": 300,
                "lat": 12.9820, "lng": 80.2580,
                "capacity": 150,
                "unit": "kW",
                "load": 75,
                "demand": 95,
                "image_url": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80",
                "description": "Designated civic evacuation and community assembly point."
            },
            {
                "id": "bsnl_tower",
                "external_id": "TC-009",
                "label": "BSNL Tower",
                "sub": "Telecom Core Exchange",
                "type": "telecom",
                "x": 490, "y": 500,
                "lat": 12.9490, "lng": 80.2350,
                "capacity": 150,
                "unit": "Gbps backbone",
                "load": 80,
                "demand": 100,
                "image_url": "https://images.unsplash.com/photo-1520869578617-557561d7b114?auto=format&fit=crop&w=600&q=80",
                "description": "Fiber-optic distribution hub and mobile emergency communications base."
            },
            {
                "id": "adyar_junction",
                "external_id": "RD-001",
                "label": "Adyar Signal Hub",
                "sub": "Road Junction",
                "type": "road",
                "x": 620, "y": 90,
                "lat": 13.0060, "lng": 80.2560,
                "capacity": 6000,
                "unit": "vehicles/hr",
                "load": 3800,
                "demand": 4500,
                "image_url": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80",
                "description": "Major intersection connecting central Adyar to coastal routes."
            },
            {
                "id": "pallikaranai_water",
                "external_id": "WT-002",
                "label": "Pallikaranai Water Station",
                "sub": "Water Pumping Station",
                "type": "water",
                "x": 370, "y": 530,
                "lat": 12.9520, "lng": 80.2160,
                "capacity": 250,
                "unit": "MLD",
                "load": 150,
                "demand": 180,
                "image_url": "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=600&q=80",
                "description": "High-capacity municipal potable water distribution facility."
            },
            {
                "id": "ecr_road_east",
                "external_id": "RD-018",
                "label": "ECR Road (East)",
                "sub": "Road Corridor",
                "type": "road",
                "x": 690, "y": 420,
                "lat": 12.9750, "lng": 80.2620,
                "capacity": 4500,
                "unit": "vehicles/hr",
                "load": 2600,
                "demand": 3000,
                "image_url": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
                "description": "East Coast Highway arterial branch."
            },
            {
                "id": "ecr_road_west",
                "external_id": "RD-019",
                "label": "ECR Road (West)",
                "sub": "Road Corridor",
                "type": "road",
                "x": 640, "y": 280,
                "lat": 12.9860, "lng": 80.2500,
                "capacity": 4500,
                "unit": "vehicles/hr",
                "load": 2700,
                "demand": 3100,
                "image_url": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
                "description": "Feeder corridor linking coastal transit to residential sectors."
            },
            {
                "id": "thiruvanmiyur_junc",
                "external_id": "RD-020",
                "label": "Thiruvanmiyur Junction",
                "sub": "Road Junction",
                "type": "road",
                "x": 625, "y": 380,
                "lat": 12.9850, "lng": 80.2540,
                "capacity": 5500,
                "unit": "vehicles/hr",
                "load": 3400,
                "demand": 3900,
                "image_url": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80",
                "description": "Crucial 6-way road intersection."
            },
            {
                "id": "taramani_node",
                "external_id": "PS-007",
                "label": "Taramani Tech Substation",
                "sub": "Power Substation",
                "type": "power",
                "x": 420, "y": 270,
                "lat": 12.9890, "lng": 80.2420,
                "capacity": 200,
                "unit": "MW",
                "load": 120,
                "demand": 140,
                "image_url": "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80",
                "description": "Secondary power transmission substation serving Taramani Tech Corridor."
            },
            {
                "id": "omr_corridor",
                "external_id": "RD-031",
                "label": "OMR Express Corridor",
                "sub": "Highway Trunk",
                "type": "road",
                "x": 520, "y": 420,
                "lat": 12.9680, "lng": 80.2460,
                "capacity": 7000,
                "unit": "vehicles/hr",
                "load": 4200,
                "demand": 4800,
                "image_url": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
                "description": "6-lane express IT corridor highway."
            },
            {
                "id": "kotturpuram_pump",
                "external_id": "WT-005",
                "label": "Kotturpuram Pump Station 2",
                "sub": "Water Pumping Station",
                "type": "water",
                "x": 580, "y": 140,
                "lat": 13.0150, "lng": 80.2400,
                "capacity": 180,
                "unit": "MLD",
                "load": 100,
                "demand": 120,
                "image_url": "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=600&q=80",
                "description": "Water pumping plant supplying the northern residential sector."
            },
            {
                "id": "velachery_lake_sluice",
                "external_id": "WT-008",
                "label": "Velachery Drainage Sluice",
                "sub": "Flood Control Pump",
                "type": "water",
                "x": 260, "y": 420,
                "lat": 12.9720, "lng": 80.2120,
                "capacity": 150,
                "unit": "cu.m/s",
                "load": 60,
                "demand": 80,
                "image_url": "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=600&q=80",
                "description": "Monsoon stormwater management regulator."
            }
        ],
        "edges": [
            # Road & Transit Network
            {"id": "e1", "source": "thiruvanmiyur_bridge", "target": "ecr_road_east", "type": "physical", "weight": 1.0, "label": "East Arterial Link"},
            {"id": "e2", "source": "thiruvanmiyur_bridge", "target": "ecr_road_west", "type": "physical", "weight": 1.0, "label": "West Feeder Link"},
            {"id": "e3", "source": "thiruvanmiyur_bridge", "target": "thiruvanmiyur_junc", "type": "physical", "weight": 0.9, "label": "Direct Junction Access"},
            {"id": "e4", "source": "ecr_road_west", "target": "ps_senior_school", "type": "flow", "weight": 0.5, "label": "Civic Access Road"},
            {"id": "e5", "source": "thiruvanmiyur_junc", "target": "omr_corridor", "type": "physical", "weight": 1.0, "label": "OMR Highway Merge"},
            {"id": "e6", "source": "omr_corridor", "target": "adyar_junction", "type": "physical", "weight": 0.8, "label": "Radial Connector"},
            {"id": "e7", "source": "adyar_junction", "target": "iit_madras", "type": "physical", "weight": 0.7, "label": "Sardar Patel Gate"},
            
            # Power Grid & Interconnections
            {"id": "e8", "source": "velachery_substation", "target": "taramani_node", "type": "physical", "weight": 1.0, "label": "110kV Transmission Ring"},
            {"id": "e9", "source": "velachery_substation", "target": "global_hospitals", "type": "dependency", "weight": 1.2, "label": "Hospital Primary Power Feed"},
            {"id": "e10", "source": "velachery_substation", "target": "pallikaranai_water", "type": "dependency", "weight": 1.0, "label": "Pump High-Tension Feed"},
            {"id": "e11", "source": "taramani_node", "target": "iit_madras", "type": "flow", "weight": 0.8, "label": "Campus Sub-grid Feed"},
            {"id": "e12", "source": "taramani_node", "target": "bsnl_tower", "type": "dependency", "weight": 0.7, "label": "Telecom Base Power"},
            
            # Water Pipelines
            {"id": "e13", "source": "pallikaranai_water", "target": "global_hospitals", "type": "flow", "weight": 0.8, "label": "Potable Water Main"},
            {"id": "e14", "source": "pallikaranai_water", "target": "velachery_lake_sluice", "type": "flow", "weight": 0.6, "label": "Drainage Overflow Line"},
            {"id": "e15", "source": "kotturpuram_pump", "target": "iit_madras", "type": "flow", "weight": 0.7, "label": "Northern Supply Line"},
            
            # Telecom Telemetry
            {"id": "e16", "source": "bsnl_tower", "target": "thiruvanmiyur_junc", "type": "dependency", "weight": 0.5, "label": "Traffic Signal Telemetry"}
        ]
    },
    "bengaluru_metro": {
        "id": "bengaluru_metro",
        "name": "Bengaluru Tech Grid",
        "region": "Bengaluru, Karnataka, India",
        "center": [12.9716, 77.5946],
        "zoom": 13,
        "description": "Central and East Bengaluru transit and utility grid.",
        "assets_count": 6,
        "connections_count": 5,
        "nodes": [
            {"id": "mg_road_sub", "external_id": "BLR-PS01", "label": "MG Road Master Substation", "sub": "Power Substation", "type": "power", "x": 300, "y": 200, "lat": 12.9750, "lng": 77.6090, "capacity": 300, "load": 180, "demand": 220, "unit": "MW"},
            {"id": "majestic_interchange", "external_id": "BLR-RD01", "label": "Majestic Transit Interchange", "sub": "Road & Rail Hub", "type": "road", "x": 200, "y": 250, "lat": 12.9767, "lng": 77.5713, "capacity": 10000, "load": 6500, "demand": 8000, "unit": "passengers/hr"},
            {"id": "victoria_hospital", "external_id": "BLR-HP01", "label": "Victoria Hospital Complex", "sub": "Hospital", "type": "hospital", "x": 220, "y": 380, "lat": 12.9630, "lng": 77.5750, "capacity": 1500, "load": 950, "demand": 1100, "unit": "beds"},
            {"id": "indiranagar_bridge", "external_id": "BLR-BR02", "label": "Indiranagar Flyover", "sub": "Bridge", "type": "bridge", "x": 550, "y": 240, "lat": 12.9780, "lng": 77.6400, "capacity": 6000, "load": 3800, "demand": 4500, "unit": "vehicles/hr"},
            {"id": "bwssb_pump", "external_id": "BLR-WT03", "label": "BWSSB Central Water Pump", "sub": "Water Pumping Station", "type": "water", "x": 420, "y": 350, "lat": 12.9600, "lng": 77.6100, "capacity": 300, "load": 170, "demand": 210, "unit": "MLD"},
            {"id": "ecospace_telecom", "external_id": "BLR-TC05", "label": "ORR Telecom Exchange", "sub": "Telecom Tower", "type": "telecom", "x": 620, "y": 420, "lat": 12.9260, "lng": 77.6800, "capacity": 200, "load": 110, "demand": 130, "unit": "Gbps"}
        ],
        "edges": [
            {"id": "be1", "source": "mg_road_sub", "target": "victoria_hospital", "type": "dependency", "weight": 1.0},
            {"id": "be2", "source": "mg_road_sub", "target": "bwssb_pump", "type": "dependency", "weight": 1.0},
            {"id": "be3", "source": "majestic_interchange", "target": "indiranagar_bridge", "type": "physical", "weight": 0.8},
            {"id": "be4", "source": "bwssb_pump", "target": "victoria_hospital", "type": "flow", "weight": 0.9},
            {"id": "be5", "source": "ecospace_telecom", "target": "mg_road_sub", "type": "flow", "weight": 0.5}
        ]
    },
    "mumbai_island": {
        "id": "mumbai_island",
        "name": "Mumbai Island City Grid",
        "region": "Mumbai, Maharashtra, India",
        "center": [18.9600, 72.8200],
        "zoom": 12,
        "description": "Coastal transport and receiving station network.",
        "assets_count": 5,
        "connections_count": 4,
        "nodes": [
            {"id": "bandra_worli_sealink", "external_id": "BWSL-01", "label": "Bandra-Worli Sea Link", "sub": "Bridge", "type": "bridge", "x": 350, "y": 180, "lat": 19.0200, "lng": 72.8150, "capacity": 8000, "load": 4800, "demand": 6000, "unit": "vehicles/hr"},
            {"id": "tata_receiving_stn", "external_id": "TATA-RS", "label": "Worli Receiving Station", "sub": "Power Substation", "type": "power", "x": 400, "y": 260, "lat": 19.0050, "lng": 72.8250, "capacity": 400, "load": 240, "demand": 280, "unit": "MVA"},
            {"id": "kem_hospital", "external_id": "KEM-HP", "label": "KEM Hospital", "sub": "Hospital", "type": "hospital", "x": 480, "y": 320, "lat": 19.0020, "lng": 72.8420, "capacity": 2000, "load": 1300, "demand": 1500, "unit": "beds"},
            {"id": "lovegrove_pumping", "external_id": "LG-PUMP", "label": "Love Grove Storm Pumping", "sub": "Water Pumping Station", "type": "water", "x": 380, "y": 380, "lat": 18.9920, "lng": 72.8160, "capacity": 300, "load": 160, "demand": 200, "unit": "cu.m/s"},
            {"id": "marine_lines_telecom", "external_id": "ML-TC", "label": "Videsh Sanchar Telecom Gate", "sub": "Telecom Tower", "type": "telecom", "x": 420, "y": 480, "lat": 18.9450, "lng": 72.8270, "capacity": 600, "load": 320, "demand": 400, "unit": "Gbps"}
        ],
        "edges": [
            {"id": "me1", "source": "tata_receiving_stn", "target": "kem_hospital", "type": "dependency", "weight": 1.2},
            {"id": "me2", "source": "tata_receiving_stn", "target": "lovegrove_pumping", "type": "dependency", "weight": 1.1},
            {"id": "me3", "source": "bandra_worli_sealink", "target": "lovegrove_pumping", "type": "geographic", "weight": 0.6},
            {"id": "me4", "source": "kem_hospital", "target": "marine_lines_telecom", "type": "flow", "weight": 0.7}
        ]
    }
}
