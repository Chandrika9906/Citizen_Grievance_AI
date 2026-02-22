from geopy.distance import geodesic
from datetime import datetime, timedelta
import json
import os
import pandas as pd

class HotspotDetector:
    def __init__(self):
        self.complaints_db = []
        self.radius_km = 0.5  # 500 meters
        self.time_window_days = 7
        self.threshold = 3  # 3+ complaints = hotspot
        self.neighborhood_data = {}
        self.load_complaints()
        self.load_neighborhood_stats()
        print("[OK] Hotspot detector loaded")
    
    def load_neighborhood_stats(self):
        """Load neighborhood complaint statistics from Boston data"""
        csv_path = 'data/og_311_ServiceRequest_2021.csv'
        
        if os.path.exists(csv_path):
            try:
                df = pd.read_csv(csv_path, usecols=['neighborhood', 'latitude', 'longitude'])
                df = df.dropna()
                
                # Calculate average complaints per neighborhood
                neighborhood_counts = df['neighborhood'].value_counts().to_dict()
                self.neighborhood_data = neighborhood_counts
                
                print(f"[INFO] Loaded {len(neighborhood_counts)} neighborhoods")
            except:
                pass
    
    def load_complaints(self):
        """Load historical complaints from file"""
        db_path = 'data/complaints_history.json'
        if os.path.exists(db_path):
            with open(db_path, 'r') as f:
                self.complaints_db = json.load(f)
        else:
            self.complaints_db = []
    
    def save_complaint(self, latitude, longitude, neighborhood=None):
        """Save new complaint to history"""
        self.complaints_db.append({
            'latitude': latitude,
            'longitude': longitude,
            'neighborhood': neighborhood,
            'timestamp': datetime.now().isoformat()
        })
        
        # Keep only last 30 days
        cutoff_date = datetime.now() - timedelta(days=30)
        self.complaints_db = [
            c for c in self.complaints_db 
            if datetime.fromisoformat(c['timestamp']) > cutoff_date
        ]
        
        # Save to file
        os.makedirs('data', exist_ok=True)
        with open('data/complaints_history.json', 'w') as f:
            json.dump(self.complaints_db, f)
    
    def get_neighborhood_from_coords(self, latitude, longitude):
        """Get neighborhood name from coordinates (simplified)"""
        # In production, use geojson lookup
        # For now, use simple distance-based approach
        return None
    
    def check_hotspot(self, latitude, longitude):
        """Check if location is a hotspot"""
        if latitude is None or longitude is None:
            return {
                "is_hotspot": False,
                "nearby_count": 0,
                "priority_boost": 0,
                "message": "No location data"
            }
        
        current_location = (latitude, longitude)
        cutoff_date = datetime.now() - timedelta(days=self.time_window_days)
        
        # Count nearby complaints in time window
        nearby_count = 0
        for complaint in self.complaints_db:
            try:
                complaint_date = datetime.fromisoformat(complaint['timestamp'])
                if complaint_date > cutoff_date:
                    complaint_location = (complaint['latitude'], complaint['longitude'])
                    distance = geodesic(current_location, complaint_location).km
                    
                    if distance <= self.radius_km:
                        nearby_count += 1
            except:
                continue
        
        # Save current complaint
        neighborhood = self.get_neighborhood_from_coords(latitude, longitude)
        self.save_complaint(latitude, longitude, neighborhood)
        
        # Determine if hotspot
        is_hotspot = nearby_count >= self.threshold
        priority_boost = 1 if is_hotspot else 0
        
        # Check neighborhood statistics
        neighborhood_alert = False
        if neighborhood and neighborhood in self.neighborhood_data:
            avg_complaints = self.neighborhood_data[neighborhood]
            if avg_complaints > 1000:  # High complaint area
                neighborhood_alert = True
                priority_boost = max(priority_boost, 1)
        
        return {
            "is_hotspot": is_hotspot,
            "nearby_count": nearby_count,
            "priority_boost": priority_boost,
            "neighborhood": neighborhood,
            "neighborhood_alert": neighborhood_alert,
            "message": f"{nearby_count} complaints in this area (last {self.time_window_days} days)"
        }
