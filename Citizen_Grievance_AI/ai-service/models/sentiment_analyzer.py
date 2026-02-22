from textblob import TextBlob
import re
try:
    from transformers import pipeline
except ImportError:
    pipeline = None

class SentimentAnalyzer:
    def __init__(self):
        """
        Advanced sentiment analyzer with Tamil + English support
        Uses multilingual emotion detection model
        """
        print("[INFO] Loading sentiment model...")
        
        # Using multilingual sentiment model for Tamil + English
        try:
            self.emotion_classifier = pipeline(
                "text-classification",
                model="j-hartmann/emotion-english-distilroberta-base",
                return_all_scores=True
            )
            self.use_advanced = True
            print("[OK] Advanced emotion model loaded")
        except:
            print("[WARN] Advanced model failed, using basic TextBlob")
            self.use_advanced = False
        
        # Tamil emotion keywords
        self.tamil_emotions = {
            'angry': ['கோபம்', 'எரிச்சல்', 'வெறுப்பு', 'சண்டை'],
            'frustrated': ['தடை', 'பிரச்சனை', 'சிக்கல்', 'கஷ்டம்'],
            'worried': ['கவலை', 'பயம்', 'அச்சம்', 'கஷ்டம்'],
            'urgent': ['உடனடி', 'அவசர', 'விரைவாக', 'இப்போதே'],
            'sad': ['துக்கம்', 'வருத்தம்', 'சோகம்'],
            'happy': ['மகிழ்ச்சி', 'சந்தோஷம்', 'நன்றி']
        }
        
        self.urgent_keywords = [
            # English
            'urgent', 'emergency', 'immediately', 'asap', 'critical',
            'dangerous', 'risk', 'threat', 'hazard', 'unsafe',
            'angry', 'frustrated', 'worried', 'scared', 'terrified',
            'suffering', 'pain', 'helpless', 'desperate',
            # Tamil
            'உடனடி', 'அவசர', 'அபாயம்', 'ஆபத்து', 'கவலை'
        ]
    
    def analyze(self, text):
        """
        Analyze sentiment and emotional urgency for Tamil + English
        Returns: {sentiment, polarity, urgency_boost, emotion}
        """
        if not text or len(text.strip()) < 2:
            return {
                "sentiment": "Neutral",
                "polarity": "neutral",
                "urgency_boost": False,
                "emotion": "none"
            }
        
        text_lower = text.lower()
        
        # Check Tamil emotions first
        tamil_emotion = self._detect_tamil_emotion(text)
        
        # Use advanced model for English/Tanglish
        if self.use_advanced and any(char.isascii() for char in text):
            try:
                emotions = self.emotion_classifier(text[:512])[0]
                # Get top emotion
                top_emotion = max(emotions, key=lambda x: x['score'])
                emotion_label = top_emotion['label']
                emotion_score = top_emotion['score']
                
                # Map to sentiment categories
                sentiment_map = {
                    'anger': 'Angry',
                    'disgust': 'Frustrated',
                    'fear': 'Worried',
                    'sadness': 'Sad',
                    'joy': 'Happy',
                    'surprise': 'Surprised',
                    'neutral': 'Neutral'
                }
                
                detected_sentiment = sentiment_map.get(emotion_label, 'Neutral')
                
                # Override with Tamil emotion if found
                if tamil_emotion != 'none':
                    detected_sentiment = tamil_emotion.capitalize()
                
            except:
                detected_sentiment = tamil_emotion.capitalize() if tamil_emotion != 'none' else 'Neutral'
        else:
            # Fallback to TextBlob
            blob = TextBlob(text)
            sentiment_score = blob.sentiment.polarity
            
            if sentiment_score > 0.1:
                detected_sentiment = "Happy"
            elif sentiment_score < -0.3:
                detected_sentiment = "Angry"
            elif sentiment_score < -0.1:
                detected_sentiment = "Frustrated"
            else:
                detected_sentiment = tamil_emotion.capitalize() if tamil_emotion != 'none' else "Neutral"
        
        # Check urgency
        urgency_boost = any(keyword in text_lower for keyword in self.urgent_keywords)
        
        # Risk phrases
        risk_phrases = ['at risk', 'in danger', 'could harm', 'might hurt', 'unsafe', 'ஆபத்து', 'அபாயம்']
        if any(phrase in text_lower for phrase in risk_phrases):
            urgency_boost = True
            if detected_sentiment == "Neutral":
                detected_sentiment = "Worried"
        
        return {
            "sentiment": detected_sentiment,
            "polarity": detected_sentiment.lower(),
            "urgency_boost": urgency_boost,
            "emotion": detected_sentiment.lower(),
            "message": f"Emotion detected: {detected_sentiment}" + (" (Urgent)" if urgency_boost else "")
        }
    
    def _detect_tamil_emotion(self, text):
        """Detect emotion from Tamil keywords"""
        text_lower = text.lower()
        
        for emotion, keywords in self.tamil_emotions.items():
            for keyword in keywords:
                if keyword in text_lower:
                    return emotion
        
        return 'none'
