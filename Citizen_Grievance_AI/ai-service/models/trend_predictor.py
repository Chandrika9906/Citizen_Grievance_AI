import json
import os
from datetime import datetime, timedelta
from collections import defaultdict

class TrendPredictor:
    def __init__(self):
        self.complaints_history = []
        self.load_history()
    
    def load_history(self):
        """Load historical complaint data"""
        db_path = 'data/complaints_history.json'
        if os.path.exists(db_path):
            with open(db_path, 'r') as f:
                self.complaints_history = json.load(f)
        else:
            self.complaints_history = []
    
    def predict(self, department, days=7):
        """
        Predict complaint trend for next week
        
        Returns: {trend, prediction, current_count, avg_count}
        """
        if len(self.complaints_history) == 0:
            return {
                "trend": "stable",
                "prediction": 0,
                "current_count": 0,
                "message": "Insufficient data for prediction"
            }
        
        # Count complaints by day for last 30 days
        cutoff_date = datetime.now() - timedelta(days=30)
        daily_counts = defaultdict(int)
        
        for complaint in self.complaints_history:
            complaint_date = datetime.fromisoformat(complaint['timestamp'])
            if complaint_date > cutoff_date:
                day_key = complaint_date.strftime('%Y-%m-%d')
                daily_counts[day_key] += 1
        
        # Calculate trend
        if len(daily_counts) < 7:
            return {
                "trend": "stable",
                "prediction": 0,
                "current_count": 0,
                "message": "Need at least 7 days of data"
            }
        
        # Get last 7 days and previous 7 days
        sorted_days = sorted(daily_counts.keys())
        recent_7_days = sorted_days[-7:]
        previous_7_days = sorted_days[-14:-7] if len(sorted_days) >= 14 else sorted_days[:7]
        
        recent_count = sum(daily_counts[day] for day in recent_7_days)
        previous_count = sum(daily_counts[day] for day in previous_7_days)
        
        # Calculate trend
        if recent_count > previous_count * 1.2:
            trend = "rising"
            prediction = int(recent_count * 1.15)
        elif recent_count < previous_count * 0.8:
            trend = "falling"
            prediction = int(recent_count * 0.85)
        else:
            trend = "stable"
            prediction = recent_count
        
        avg_daily = recent_count / 7
        
        return {
            "trend": trend,
            "prediction": prediction,
            "current_week_count": recent_count,
            "previous_week_count": previous_count,
            "avg_daily_complaints": round(avg_daily, 1),
            "message": f"Complaints are {trend}",
            "alert": trend == "rising" and recent_count > previous_count * 1.5
        }
