from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json
import os
from datetime import datetime, timedelta

class DuplicateDetector:
    def __init__(self):
        self.complaints_db = []
        self.similarity_threshold = 0.8  # 80% similarity = duplicate
        self.time_window_days = 7
        self.vectorizer = TfidfVectorizer(max_features=1000, ngram_range=(1, 2))
        self.load_complaints()
        print("[OK] Duplicate detector loaded")
    
    def load_complaints(self):
        """Load recent complaints from file"""
        db_path = 'data/recent_complaints.json'
        if os.path.exists(db_path):
            with open(db_path, 'r') as f:
                self.complaints_db = json.load(f)
        else:
            self.complaints_db = []
    
    def save_complaint(self, text, user_id):
        """Save new complaint to database"""
        self.complaints_db.append({
            'text': text,
            'userId': user_id,
            'timestamp': datetime.now().isoformat()
        })
        
        # Keep only last 7 days
        cutoff_date = datetime.now() - timedelta(days=self.time_window_days)
        self.complaints_db = [
            c for c in self.complaints_db 
            if datetime.fromisoformat(c['timestamp']) > cutoff_date
        ]
        
        # Save to file
        os.makedirs('data', exist_ok=True)
        with open('data/recent_complaints.json', 'w') as f:
            json.dump(self.complaints_db, f)
    
    def check_duplicate(self, text, user_id):
        """
        Check if complaint is duplicate or spam
        Returns: {is_duplicate, similarity, matched_complaint}
        """
        if not text or len(self.complaints_db) == 0:
            self.save_complaint(text, user_id)
            return {
                "is_duplicate": False,
                "is_spam": False,
                "similarity": 0,
                "message": "New complaint"
            }
        
        # Get recent complaints
        cutoff_date = datetime.now() - timedelta(days=self.time_window_days)
        recent_complaints = [
            c for c in self.complaints_db 
            if datetime.fromisoformat(c['timestamp']) > cutoff_date
        ]
        
        if len(recent_complaints) == 0:
            self.save_complaint(text, user_id)
            return {
                "is_duplicate": False,
                "is_spam": False,
                "similarity": 0,
                "message": "New complaint"
            }
        
        # Check similarity with recent complaints
        all_texts = [c['text'] for c in recent_complaints] + [text]
        
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(all_texts)
        
        # Compare new complaint with all recent ones
        new_complaint_vector = tfidf_matrix[-1]
        similarities = cosine_similarity(new_complaint_vector, tfidf_matrix[:-1])[0]
        
        max_similarity = max(similarities) if len(similarities) > 0 else 0
        
        # Check if same user submitted multiple similar complaints (spam)
        user_complaints = [c for c in recent_complaints if c['userId'] == user_id]
        is_spam = len(user_complaints) >= 3  # 3+ complaints in 7 days = potential spam
        
        is_duplicate = max_similarity >= self.similarity_threshold
        
        # Save complaint
        self.save_complaint(text, user_id)
        
        return {
            "is_duplicate": is_duplicate,
            "is_spam": is_spam,
            "similarity": round(float(max_similarity), 2),
            "user_complaint_count": len(user_complaints),
            "message": "Duplicate detected" if is_duplicate else ("Potential spam" if is_spam else "Unique complaint")
        }
