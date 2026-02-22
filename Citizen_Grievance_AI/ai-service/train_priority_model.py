"""
Train Priority Prediction Model
Using text features + sentiment + length
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
from textblob import TextBlob
import joblib
import os

def extract_features(df):
    """Extract features for priority prediction"""
    print("[1/4] Extracting features...")
    
    # Text length
    df['text_length'] = df['subject'].str.len()
    
    # Sentiment score
    df['sentiment'] = df['subject'].apply(
        lambda x: TextBlob(str(x)).sentiment.polarity if pd.notna(x) else 0
    )
    
    # Urgency keywords
    urgent_keywords = ['urgent', 'emergency', 'danger', 'critical', 'immediate', 
                       'asap', 'help', 'risk', 'severe', 'serious']
    df['has_urgent_keyword'] = df['subject'].str.lower().apply(
        lambda x: int(any(kw in str(x) for kw in urgent_keywords))
    )
    
    # Exclamation marks
    df['exclamation_count'] = df['subject'].str.count('!')
    
    # Capital letters ratio
    df['capital_ratio'] = df['subject'].apply(
        lambda x: sum(1 for c in str(x) if c.isupper()) / max(len(str(x)), 1)
    )
    
    return df

def assign_priority_labels(df):
    """Assign priority labels based on heuristics"""
    print("[2/4] Assigning priority labels...")
    
    def get_priority(row):
        # High priority (3)
        if row['has_urgent_keyword'] == 1:
            return 3
        if row['exclamation_count'] >= 2:
            return 3
        if row['sentiment'] < -0.5:
            return 3
        
        # Medium priority (2)
        if row['sentiment'] < -0.2:
            return 2
        if row['exclamation_count'] >= 1:
            return 2
        if row['text_length'] > 100:
            return 2
        
        # Low priority (1)
        return 1
    
    df['priority'] = df.apply(get_priority, axis=1)
    
    print(f"Priority distribution:")
    print(df['priority'].value_counts().sort_index())
    
    return df

def train_priority_model(csv_path):
    """Train priority prediction model"""
    print("="*70)
    print("  TRAINING PRIORITY PREDICTION MODEL")
    print("="*70 + "\n")
    
    # Load data
    df = pd.read_csv(csv_path)
    df = df[['subject']].dropna()
    
    print(f"Total records: {len(df)}")
    
    # Extract features
    df = extract_features(df)
    
    # Assign priority labels
    df = assign_priority_labels(df)
    
    # Prepare features
    feature_cols = ['text_length', 'sentiment', 'has_urgent_keyword', 
                    'exclamation_count', 'capital_ratio']
    X = df[feature_cols]
    y = df['priority']
    
    # Train-test split
    print("\n[3/4] Training model...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Train Random Forest
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        class_weight='balanced'
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    print("\n[4/4] Evaluating model...")
    y_pred = model.predict(X_test)
    
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nAccuracy: {accuracy:.2%}")
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Feature importance
    print("\nFeature Importance:")
    for feat, imp in zip(feature_cols, model.feature_importances_):
        print(f"  {feat}: {imp:.3f}")
    
    # Save model
    os.makedirs('models/saved', exist_ok=True)
    joblib.dump(model, 'models/saved/priority_model.pkl')
    
    print("\n[OK] Model saved: models/saved/priority_model.pkl")
    print("\n" + "="*70)
    print(f"  TRAINING COMPLETE! Accuracy: {accuracy:.2%}")
    print("="*70 + "\n")
    
    return model

if __name__ == "__main__":
    csv_path = 'data/og_311_ServiceRequest_2021.csv'
    
    if not os.path.exists(csv_path):
        print(f"[ERROR] Dataset not found: {csv_path}")
    else:
        train_priority_model(csv_path)
