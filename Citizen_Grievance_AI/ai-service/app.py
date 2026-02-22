from flask import Flask, request, jsonify
from flask_cors import CORS
from models.department_classifier import DepartmentClassifier
from models.priority_predictor import PriorityPredictor
from models.hotspot_detector import HotspotDetector
from models.sentiment_analyzer import SentimentAnalyzer
from models.duplicate_detector import DuplicateDetector
from models.image_classifier import ImageClassifier
from models.voice_processor import VoiceProcessor
from models.trend_predictor import TrendPredictor

app = Flask(__name__)
CORS(app)

# Initialize AI models
dept_classifier = DepartmentClassifier()
priority_predictor = PriorityPredictor()
hotspot_detector = HotspotDetector()
sentiment_analyzer = SentimentAnalyzer()
duplicate_detector = DuplicateDetector()
image_classifier = ImageClassifier()
voice_processor = VoiceProcessor()
trend_predictor = TrendPredictor()

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "message": "AI Service Running 🤖",
        "endpoints": [
            "/classify-department",
            "/predict-priority",
            "/detect-hotspot",
            "/analyze-sentiment",
            "/detect-duplicate",
            "/classify-image",
            "/voice-to-text",
            "/predict-trend",
            "/analyze-complaint"
        ]
    })

# TASK 1: Department Classification
@app.route('/classify-department', methods=['POST'])
def classify_department():
    data = request.json
    text = data.get('text', '')
    
    department = dept_classifier.predict(text)
    confidence = dept_classifier.get_confidence(text)
    
    return jsonify({
        "department": department,
        "confidence": confidence
    })

# TASK 2: Priority Prediction
@app.route('/predict-priority', methods=['POST'])
def predict_priority():
    data = request.json
    text = data.get('text', '')
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    
    priority = priority_predictor.predict(text, latitude, longitude)
    
    return jsonify({
        "priority": priority,
        "reason": priority_predictor.get_reason()
    })

# TASK 3: Hotspot Detection
@app.route('/detect-hotspot', methods=['POST'])
def detect_hotspot():
    data = request.json
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    
    result = hotspot_detector.check_hotspot(latitude, longitude)
    
    return jsonify(result)

# TASK 4: Voice to Text
@app.route('/voice-to-text', methods=['POST'])
def voice_to_text():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file"}), 400
    
    audio_file = request.files['audio']
    text = voice_processor.convert_to_text(audio_file)
    
    return jsonify({
        "text": text
    })

# TASK 5: Image Classification
@app.route('/classify-image', methods=['POST'])
def classify_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image file"}), 400
    
    image_file = request.files['image']
    result = image_classifier.classify(image_file)
    
    return jsonify(result)

# TASK 6: Sentiment Analysis
@app.route('/analyze-sentiment', methods=['POST'])
def analyze_sentiment():
    data = request.json
    text = data.get('text', '')
    
    result = sentiment_analyzer.analyze(text)
    
    return jsonify(result)

# TASK 7: Duplicate Detection
@app.route('/detect-duplicate', methods=['POST'])
def detect_duplicate():
    data = request.json
    text = data.get('text', '')
    user_id = data.get('userId')
    
    result = duplicate_detector.check_duplicate(text, user_id)
    
    return jsonify(result)

# TASK 8: Trend Prediction
@app.route('/predict-trend', methods=['POST'])
def predict_trend():
    data = request.json
    department = data.get('department')
    days = data.get('days', 7)
    
    result = trend_predictor.predict(department, days)
    
    return jsonify(result)

    # TASK 4B: Full Voice Complaint AI Analysis
@app.route('/voice-complaint', methods=['POST'])
def voice_complaint():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file"}), 400

    audio_file = request.files['audio']

    # 1️⃣ Convert voice to text
    print("🎤 [API] Processing voice to text...")
    voice_result = voice_processor.convert_to_text(audio_file)
    print(f"✅ [API] Result language: {voice_result.get('language_detected')}")
    
    if not voice_result.get("success"):
        return jsonify(voice_result), 500

    text = voice_result.get("text", "")
    language = voice_result.get("language_detected")

    # 2️⃣ Run full AI pipeline
    department = dept_classifier.predict(text)
    sentiment = sentiment_analyzer.analyze(text)
    base_priority = priority_predictor.predict(text, None, None)

    final_priority = int(base_priority)

    # Urgency boost from sentiment
    if sentiment.get("urgency_boost", False):
        final_priority = min(final_priority + 1, 3)

    return jsonify({
        "transcribed_text": text,
        "language_detected": language,
        "department": str(department),
        "priority": int(final_priority),
        "sentiment": {
            "sentiment": str(sentiment.get("sentiment")),
            "urgency_boost": bool(sentiment.get("urgency_boost"))
        },
        "analysis_complete": True
    })


# COMBINED: Full Complaint Analysis
@app.route('/analyze-complaint', methods=['POST'])
def analyze_complaint():
    data = request.json
    text = data.get('text', '')
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    user_id = data.get('userId')

    department = dept_classifier.predict(text)
    sentiment = sentiment_analyzer.analyze(text)
    base_priority = priority_predictor.predict(text, latitude, longitude)
    hotspot = hotspot_detector.check_hotspot(latitude, longitude)
    duplicate = duplicate_detector.check_duplicate(text, user_id)

    final_priority = int(base_priority)

    if bool(hotspot.get('is_hotspot', False)):
        final_priority = min(final_priority + 1, 3)

    if bool(sentiment.get('urgency_boost', False)):
        final_priority = min(final_priority + 1, 3)

    return jsonify({
        "department": str(department),
        "priority": int(final_priority),
        "sentiment": {
            "sentiment": str(sentiment.get("sentiment")),
            "urgency_boost": bool(sentiment.get("urgency_boost"))
        },
        "hotspot": {
            "is_hotspot": bool(hotspot.get("is_hotspot")),
            "count": int(hotspot.get("count", 0))
        },
        "duplicate": {
            "is_duplicate": bool(duplicate.get("is_duplicate")),
            "similarity": float(duplicate.get("similarity", 0))
        },
        "analysis_complete": True
    })


if __name__ == '__main__':
    print("🤖 AI Service Starting...")
    print("📡 Running on http://localhost:5001")
    app.run(port=5001)
