from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "AI Service Running ✅"

@app.route("/predict", methods=["GET"])
def predict():
    return jsonify({
        "department": "Road Maintenance",
        "priority": "High",
        "sentiment": "Negative",
        "message": "Demo AI response"
    })