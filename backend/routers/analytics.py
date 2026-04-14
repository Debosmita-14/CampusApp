from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import random
import math

router = APIRouter()

# --- SIMULATED CAMPUS DATA ---

# Building/zone occupancy data (simulated real-time)
campus_zones = [
    {"id": "z1", "name": "Main Library", "capacity": 500, "type": "library"},
    {"id": "z2", "name": "Engineering Lab", "capacity": 120, "type": "lab"},
    {"id": "z3", "name": "Student Center", "capacity": 300, "type": "common"},
    {"id": "z4", "name": "Science Block", "capacity": 200, "type": "academic"},
    {"id": "z5", "name": "Auditorium", "capacity": 800, "type": "events"},
    {"id": "z6", "name": "Sports Complex", "capacity": 400, "type": "sports"},
    {"id": "z7", "name": "Computer Lab A", "capacity": 60, "type": "lab"},
    {"id": "z8", "name": "Computer Lab B", "capacity": 60, "type": "lab"},
    {"id": "z9", "name": "Cafeteria", "capacity": 250, "type": "dining"},
    {"id": "z10", "name": "Admin Block", "capacity": 100, "type": "admin"},
]

# Simulated complaint/ticket system
complaints_db = [
    {"id": "c1", "title": "AC not working in Lab B", "category": "maintenance", "status": "resolved", "priority": "high", "created": "2026-04-14T08:30:00Z", "resolved_at": "2026-04-14T10:15:00Z", "assigned_to": "Maintenance Team A"},
    {"id": "c2", "title": "Projector flickering in Room 301", "category": "equipment", "status": "in_progress", "priority": "medium", "created": "2026-04-14T09:00:00Z", "resolved_at": None, "assigned_to": "IT Support"},
    {"id": "c3", "title": "Water leakage near cafeteria", "category": "maintenance", "status": "open", "priority": "critical", "created": "2026-04-14T11:20:00Z", "resolved_at": None, "assigned_to": None},
    {"id": "c4", "title": "WiFi dead zone in Block C", "category": "network", "status": "in_progress", "priority": "high", "created": "2026-04-13T14:00:00Z", "resolved_at": None, "assigned_to": "Network Team"},
    {"id": "c5", "title": "Broken chair in Lecture Hall 2", "category": "furniture", "status": "open", "priority": "low", "created": "2026-04-14T07:45:00Z", "resolved_at": None, "assigned_to": None},
]

# Notification system
notifications_db = [
    {"id": "n1", "title": "Emergency: Fire Drill Tomorrow", "message": "Mandatory fire drill scheduled for 10 AM tomorrow. All students must evacuate.", "priority": "critical", "type": "emergency", "timestamp": "2026-04-14T12:00:00Z", "read": False},
    {"id": "n2", "title": "Lab B Maintenance Complete", "message": "AC repair in Computer Lab B has been completed. Lab is now operational.", "priority": "medium", "type": "system", "timestamp": "2026-04-14T10:15:00Z", "read": False},
    {"id": "n3", "title": "New Event: Hackathon 2026", "message": "Register now for the annual campus hackathon! Limited seats available.", "priority": "low", "type": "event", "timestamp": "2026-04-14T09:00:00Z", "read": True},
    {"id": "n4", "title": "Library Extended Hours", "message": "Library will remain open until 11 PM during exam week (Apr 20-27).", "priority": "medium", "type": "info", "timestamp": "2026-04-13T16:00:00Z", "read": True},
    {"id": "n5", "title": "WiFi Outage: Block C", "message": "Known WiFi issue in Block C. Team is working on it. ETA: 2 hours.", "priority": "high", "type": "alert", "timestamp": "2026-04-14T14:30:00Z", "read": False},
]


def _get_occupancy(zone, hour=None):
    """Simulate realistic occupancy based on time and zone type."""
    if hour is None:
        hour = datetime.now().hour
    
    base_patterns = {
        "library": [0.1, 0.1, 0.05, 0.05, 0.05, 0.05, 0.1, 0.2, 0.5, 0.7, 0.8, 0.85, 0.6, 0.5, 0.65, 0.8, 0.9, 0.85, 0.7, 0.5, 0.3, 0.2, 0.15, 0.1],
        "lab": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.4, 0.7, 0.85, 0.9, 0.5, 0.3, 0.6, 0.8, 0.7, 0.4, 0.2, 0.1, 0.0, 0.0, 0.0, 0.0],
        "common": [0.05, 0.02, 0.02, 0.02, 0.02, 0.02, 0.05, 0.15, 0.3, 0.4, 0.5, 0.6, 0.8, 0.7, 0.5, 0.4, 0.5, 0.65, 0.5, 0.3, 0.2, 0.1, 0.05, 0.05],
        "academic": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.5, 0.8, 0.9, 0.85, 0.4, 0.3, 0.7, 0.85, 0.6, 0.3, 0.1, 0.05, 0.0, 0.0, 0.0, 0.0],
        "events": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.2, 0.3, 0.2, 0.1, 0.1, 0.2, 0.3, 0.5, 0.7, 0.4, 0.2, 0.1, 0.0, 0.0, 0.0],
        "sports": [0.0, 0.0, 0.0, 0.0, 0.0, 0.05, 0.2, 0.4, 0.3, 0.2, 0.15, 0.1, 0.1, 0.15, 0.2, 0.3, 0.5, 0.7, 0.6, 0.4, 0.2, 0.1, 0.05, 0.0],
        "dining": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.05, 0.3, 0.5, 0.3, 0.15, 0.1, 0.8, 0.9, 0.5, 0.2, 0.1, 0.15, 0.5, 0.7, 0.4, 0.2, 0.05, 0.0],
        "admin": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.3, 0.7, 0.8, 0.85, 0.5, 0.4, 0.7, 0.8, 0.6, 0.3, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0],
    }
    
    pattern = base_patterns.get(zone["type"], base_patterns["common"])
    base = pattern[hour % 24]
    # Add random noise
    noise = random.uniform(-0.08, 0.08)
    occupancy_ratio = max(0, min(1, base + noise))
    return int(zone["capacity"] * occupancy_ratio)


@router.get("/dashboard-stats")
def get_dashboard_stats():
    """Get aggregated campus dashboard statistics."""
    total_students = 4250
    active_now = random.randint(1800, 2600)
    total_rooms = 45
    rooms_available = random.randint(12, 28)
    events_today = 3
    pending_complaints = len([c for c in complaints_db if c["status"] in ("open", "in_progress")])
    
    return {
        "total_students": total_students,
        "active_now": active_now,
        "total_rooms": total_rooms,
        "rooms_available": rooms_available,
        "rooms_booked": total_rooms - rooms_available,
        "events_today": events_today,
        "pending_complaints": pending_complaints,
        "resolved_today": 1,
        "ai_automations_today": random.randint(8, 22),
        "energy_saved_percent": round(random.uniform(12, 28), 1),
        "campus_safety_score": round(random.uniform(92, 99), 1),
    }


@router.get("/live-occupancy")
def get_live_occupancy():
    """Get real-time occupancy data for all campus zones."""
    hour = datetime.now().hour
    result = []
    for zone in campus_zones:
        current = _get_occupancy(zone, hour)
        trend_data = []
        for h in range(max(0, hour - 5), hour + 1):
            trend_data.append({
                "hour": f"{h:02d}:00",
                "count": _get_occupancy(zone, h)
            })
        
        occupancy_pct = round((current / zone["capacity"]) * 100, 1) if zone["capacity"] > 0 else 0
        density = "low" if occupancy_pct < 40 else "medium" if occupancy_pct < 70 else "high"
        
        result.append({
            "id": zone["id"],
            "name": zone["name"],
            "type": zone["type"],
            "capacity": zone["capacity"],
            "current_occupancy": current,
            "occupancy_percent": occupancy_pct,
            "density": density,
            "trend": trend_data,
        })
    return {"zones": result, "timestamp": datetime.now().isoformat()}


@router.get("/predictions")
def get_predictions():
    """AI-powered predictions for resource demand."""
    hour = datetime.now().hour
    predictions = []
    
    for zone in campus_zones:
        future_hours = []
        for offset in range(1, 7):
            future_h = (hour + offset) % 24
            predicted = _get_occupancy(zone, future_h)
            future_hours.append({
                "hour": f"{future_h:02d}:00",
                "predicted_occupancy": predicted,
                "predicted_percent": round((predicted / zone["capacity"]) * 100, 1),
                "confidence": round(random.uniform(0.78, 0.97), 2),
            })
        
        peak_hour_data = max(future_hours, key=lambda x: x["predicted_occupancy"])
        
        predictions.append({
            "zone_id": zone["id"],
            "zone_name": zone["name"],
            "type": zone["type"],
            "predictions": future_hours,
            "peak_prediction": peak_hour_data,
            "recommendation": _get_recommendation(zone, peak_hour_data),
        })
    
    return {"predictions": predictions, "model_version": "CampusAI v2.1", "generated_at": datetime.now().isoformat()}


def _get_recommendation(zone, peak_data):
    pct = peak_data["predicted_percent"]
    if pct > 85:
        return f"⚠️ {zone['name']} expected to be crowded. Consider redistributing to alternative spaces."
    elif pct > 60:
        return f"📊 Moderate demand expected at {zone['name']}. Monitor closely."
    else:
        return f"✅ {zone['name']} expected to have sufficient capacity."


@router.get("/anomalies")
def get_anomalies():
    """Detect anomalies in campus activity."""
    anomalies = [
        {
            "id": "a1",
            "type": "security",
            "severity": "high",
            "title": "Unusual after-hours access",
            "description": "Access card used at Engineering Lab at 2:47 AM — outside normal operating hours.",
            "location": "Engineering Lab",
            "timestamp": "2026-04-14T02:47:00Z",
            "status": "investigating",
            "ai_confidence": 0.91,
        },
        {
            "id": "a2",
            "type": "resource",
            "severity": "medium",
            "title": "Abnormal power consumption",
            "description": "Computer Lab A showing 340% higher power draw than baseline. Possible equipment malfunction.",
            "location": "Computer Lab A",
            "timestamp": "2026-04-14T11:30:00Z",
            "status": "flagged",
            "ai_confidence": 0.84,
        },
        {
            "id": "a3",
            "type": "crowd",
            "severity": "low",
            "title": "Unexpected crowd formation",
            "description": "Cafeteria occupancy spiked to 95% outside normal lunch hours. May indicate unscheduled event.",
            "location": "Cafeteria",
            "timestamp": "2026-04-14T15:20:00Z",
            "status": "monitoring",
            "ai_confidence": 0.72,
        },
    ]
    return {"anomalies": anomalies, "total": len(anomalies)}


@router.get("/notifications")
def get_notifications():
    """Get prioritized notifications."""
    # Sort by priority and timestamp
    priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    sorted_notifications = sorted(
        notifications_db,
        key=lambda n: (priority_order.get(n["priority"], 4), n["timestamp"]),
    )
    sorted_notifications.reverse()
    # Re-sort so critical comes first
    sorted_notifications = sorted(
        sorted_notifications,
        key=lambda n: priority_order.get(n["priority"], 4),
    )
    return {"notifications": sorted_notifications, "unread_count": len([n for n in sorted_notifications if not n["read"]])}


@router.get("/complaints")
def get_complaints():
    """Get all complaints/tickets."""
    return {"complaints": complaints_db}


class ComplaintCreate(BaseModel):
    title: str
    category: str
    priority: str = "medium"

@router.post("/complaints")
def create_complaint(complaint: ComplaintCreate):
    """AI-routed complaint creation."""
    # AI auto-assignment logic
    category_teams = {
        "maintenance": "Maintenance Team A",
        "equipment": "IT Support",
        "network": "Network Team",
        "furniture": "Facilities Team",
        "security": "Security Office",
        "other": None,
    }
    assigned = category_teams.get(complaint.category, None)
    
    new_complaint = {
        "id": f"c{len(complaints_db) + 1}",
        "title": complaint.title,
        "category": complaint.category,
        "status": "open" if not assigned else "in_progress",
        "priority": complaint.priority,
        "created": datetime.now().isoformat() + "Z",
        "resolved_at": None,
        "assigned_to": assigned,
    }
    complaints_db.append(new_complaint)
    return {
        "complaint": new_complaint,
        "ai_action": f"Auto-assigned to {assigned}" if assigned else "Queued for manual review",
    }


@router.get("/smart-schedule")
def get_smart_schedule():
    """AI-generated smart scheduling suggestions."""
    suggestions = [
        {
            "id": "s1",
            "type": "room_swap",
            "title": "Optimize Room 301 Usage",
            "description": "Room 301 is booked for 3 people but has 40 capacity. Suggest moving to Study Room A (capacity 6) and freeing 301 for the waitlisted Data Structures lecture (38 students).",
            "impact": "high",
            "savings": "1 room freed, 38 students accommodated",
            "confidence": 0.93,
        },
        {
            "id": "s2",
            "type": "time_shift",
            "title": "Stagger Lab Sessions",
            "description": "Computer Lab A and B both peak at 10 AM. Shifting Lab B's session to 11 AM reduces congestion by 40%.",
            "impact": "medium",
            "savings": "40% reduced wait time",
            "confidence": 0.87,
        },
        {
            "id": "s3",
            "type": "auto_booking",
            "title": "Auto-Reserve Exam Prep Rooms",
            "description": "Exam week approaching (Apr 20). Pre-book 8 study rooms for high-demand periods based on last year's patterns.",
            "impact": "high",
            "savings": "Eliminate 80% of booking conflicts",
            "confidence": 0.91,
        },
    ]
    return {"suggestions": suggestions, "generated_at": datetime.now().isoformat()}


@router.get("/utilization-chart")
def get_utilization_chart():
    """Hourly utilization data for charts."""
    hours = []
    for h in range(0, 24):
        total_capacity = sum(z["capacity"] for z in campus_zones)
        total_occupied = sum(_get_occupancy(z, h) for z in campus_zones)
        hours.append({
            "hour": f"{h:02d}:00",
            "utilization_percent": round((total_occupied / total_capacity) * 100, 1),
            "total_occupied": total_occupied,
            "total_capacity": total_capacity,
        })
    return {"chart_data": hours}
