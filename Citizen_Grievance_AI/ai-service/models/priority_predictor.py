import joblib
import os
from textblob import TextBlob

class PriorityPredictor:
    def __init__(self):
        self.model = None
        self.reason = ""
        self.load_model()
    
    def load_model(self):
        """Load trained priority model"""
        model_path = 'models/saved/priority_model.pkl'
        
        if os.path.exists(model_path):
            self.model = joblib.load(model_path)
            print("[OK] Priority model loaded")
        else:
            print("[INFO] Priority model not found. Using rule-based approach.")
            print("       Train model with: python train_priority_model.py")
    
    def extract_features(self, text):
        """Extract features from text"""
        if not text:
            return [0, 0, 0, 0, 0]
        
        # Text length
        text_length = len(text)
        
        # Sentiment
        sentiment = TextBlob(text).sentiment.polarity
        
        # Urgency keywords
        urgent_keywords = ['urgent', 'emergency', 'danger', 'critical', 'immediate',
                          'asap', 'help', 'risk', 'severe', 'serious', 'life', 'death']
        has_urgent = int(any(kw in text.lower() for kw in urgent_keywords))
        
        # Exclamation marks
        exclamation_count = text.count('!')
        
        # Capital ratio
        capital_ratio = sum(1 for c in text if c.isupper()) / max(len(text), 1)
        
        return [text_length, sentiment, has_urgent, exclamation_count, capital_ratio]
    
    def predict(self, text, latitude=None, longitude=None):
        """Predict priority level (1, 2, or 3)"""
        if not text:
            return 1
        
        features = self.extract_features(text)
        
        if self.model:
            # Use trained model
            try:
                priority = self.model.predict([features])[0]
                self.reason = "ML model prediction"
                return int(priority)
            except:
                pass
        
        # Fallback to rule-based
        return self._rule_based_priority(text, features)
    
    def _rule_based_priority(self, text, features):
        """Rule-based priority prediction"""
        text_length, sentiment, has_urgent, exclamation_count, capital_ratio = features
        
        reasons = []
        priority = 1
        
        # High priority indicators
        if has_urgent:
            priority = 3
            reasons.append("Urgent keyword detected")
        
        if exclamation_count >= 2:
            priority = max(priority, 3)
            reasons.append("Multiple exclamation marks")
        
        if sentiment < -0.5:
            priority = max(priority, 3)
            reasons.append("Very negative sentiment")
        
        # Medium priority indicators
        if priority < 3:
            if sentiment < -0.2:
                priority = max(priority, 2)
                reasons.append("Negative sentiment")
            
            if exclamation_count >= 1:
                priority = max(priority, 2)
                reasons.append("Exclamation mark")
            
            if text_length > 100:
                priority = max(priority, 2)
                reasons.append("Detailed complaint")
        
        self.reason = "; ".join(reasons) if reasons else "Standard priority"
        return priority
    
    def get_reason(self):
        """Get explanation for priority decision"""
        return self.reason
