import joblib
import os

class DepartmentClassifier:
    def __init__(self):
        self.model = None
        self.preprocessor = None
        self.load_model()
    
    def load_model(self):
        """Load trained model"""
        real_model_path = 'models/saved/real_department_model.pkl'
        preprocessor_path = 'models/saved/text_preprocessor.pkl'
        
        if os.path.exists(real_model_path):
            self.model = joblib.load(real_model_path)
            if os.path.exists(preprocessor_path):
                self.preprocessor = joblib.load(preprocessor_path)
            print("[OK] Real department model loaded")
        else:
            print("[INFO] Real model not found. Train it with: python train_real_model.py")
            self._load_fallback_model()
    
    def _load_fallback_model(self):
        """Load fallback dummy model if real model not available"""
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.linear_model import LogisticRegression
        from sklearn.pipeline import Pipeline
        
        dummy_model_path = 'models/saved/dept_classifier.pkl'
        
        if os.path.exists(dummy_model_path):
            # Load old dummy model
            from sklearn.feature_extraction.text import TfidfVectorizer
            from sklearn.linear_model import LogisticRegression
            import joblib
            
            self.model = joblib.load(dummy_model_path)
            vectorizer_path = 'models/saved/dept_vectorizer.pkl'
            if os.path.exists(vectorizer_path):
                vectorizer = joblib.load(vectorizer_path)
                # Wrap in pipeline format
                self.model = Pipeline([
                    ('tfidf', vectorizer),
                    ('clf', self.model)
                ])
            print("[OK] Fallback model loaded")
        else:
            print("[INFO] Training basic model...")
            self._train_basic_model()
    
    def _train_basic_model(self):
        """Train basic model with minimal data"""
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.linear_model import LogisticRegression
        from sklearn.pipeline import Pipeline
        
        training_data = [
            ("water leakage pipeline", "Water"),
            ("water pipe broken supply", "Water"),
            ("no water supply available", "Water"),
            ("drinking water quality", "Water"),
            ("pothole on road street", "Road"),
            ("road damaged construction", "Road"),
            ("street light broken not working", "Road"),
            ("garbage not collected trash", "Sanitation"),
            ("trash overflow waste", "Sanitation"),
            ("drain blocked sewage", "Sanitation"),
            ("dirty streets cleaning", "Sanitation"),
            ("power cut electricity", "Electricity"),
            ("electric pole damaged wire", "Electricity"),
            ("no electricity supply", "Electricity"),
            ("street light repair", "Electricity"),
            ("illegal parking vehicle", "General"),
            ("noise pollution loud", "General"),
            ("general issue problem", "General"),
        ]
        
        texts = [t[0] for t in training_data]
        labels = [t[1] for t in training_data]
        
        self.model = Pipeline([
            ('tfidf', TfidfVectorizer(max_features=500)),
            ('clf', LogisticRegression(max_iter=1000, class_weight='balanced'))
        ])
        
        self.model.fit(texts, labels)
        
        os.makedirs('models/saved', exist_ok=True)
        joblib.dump(self.model, 'models/saved/dept_classifier.pkl')
        print("[OK] Basic model trained")
    
    def predict(self, text):
        """Predict department from complaint text"""
        if not text:
            return "General"
            
        text_lower = text.lower()
        
        # KEYWORD OVERRIDE (High confidence matches)
        keywords = {
            "Sanitation": ["garbage", "trash", "sewage", "drain", "drainage", "waste", "cleaning", "sweep", "dump"],
            "Water": ["water", "pipe", "pipeline", "leakage", "drinking", "supply", "tanker"],
            "Road": ["road", "pothole", "street", "pavement", "construction", "bridge"],
            "Electricity": ["power", "electric", "electricity", "pole", "wire", "current", "shock", "light"],
            "Public Safety": ["safety", "crime", "theft", "police", "threat", "emergency"]
        }
        
        for dept, words in keywords.items():
            if any(word in text_lower for word in words):
                return dept
        
        if not self.model:
            return "General"
            
        # Fallback to model
        if self.preprocessor:
            clean_text = self.preprocessor.clean_text(text)
        else:
            clean_text = text_lower
            
        if not clean_text:
            return "General"
            
        try:
            # Check for Boston codes and map them
            raw_prediction = self.model.predict([clean_text])[0]
            
            # Simple mapping for Boston-style codes if using the real model
            mapping = {
                'PWDx': 'Road',
                'ISD': 'Sanitation',
                'PARK': 'Sanitation',
                'BPD_': 'Public Safety',
                'ANML': 'General',
                'INFO': 'General',
                'GEN_': 'General'
            }
            return mapping.get(raw_prediction, raw_prediction)
        except:
            return "General"
    
    def get_confidence(self, text):
        """Get prediction confidence"""
        if not text or not self.model:
            return 0.5
        
        # Preprocess if preprocessor available
        if self.preprocessor:
            text = self.preprocessor.clean_text(text)
        
        if not text:
            return 0.5
        
        try:
            probabilities = self.model.predict_proba([text])[0]
            return float(max(probabilities))
        except:
            return 0.5
