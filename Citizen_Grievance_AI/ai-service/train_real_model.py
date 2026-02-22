"""
Train Real Department Classification Model
Using Boston 311 Dataset
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import joblib
import os
import re
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import nltk

# Download required NLTK data
try:
    nltk.data.find('corpora/stopwords')
except:
    nltk.download('stopwords', quiet=True)

try:
    nltk.data.find('tokenizers/punkt')
except:
    nltk.download('punkt', quiet=True)

class TextPreprocessor:
    """Clean and preprocess text data"""
    
    def __init__(self):
        self.stop_words = set(stopwords.words('english'))
    
    def clean_text(self, text):
        if pd.isna(text) or text == '':
            return ''
        
        # Lowercase
        text = str(text).lower()
        
        # Remove special characters and digits
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        # Remove stopwords
        words = text.split()
        words = [w for w in words if w not in self.stop_words and len(w) > 2]
        
        return ' '.join(words)

def load_and_prepare_data(csv_path):
    """Load and prepare Boston 311 dataset"""
    print("[1/6] Loading dataset...")
    df = pd.read_csv(csv_path)
    
    print(f"Total records: {len(df)}")
    print(f"Columns: {df.columns.tolist()}")
    
    # Select relevant columns
    df = df[['subject', 'department']].copy()
    
    # Remove missing values
    print("\n[2/6] Cleaning data...")
    df = df.dropna(subset=['subject', 'department'])
    
    # Filter departments with sufficient samples (at least 100)
    dept_counts = df['department'].value_counts()
    valid_depts = dept_counts[dept_counts >= 100].index.tolist()
    df = df[df['department'].isin(valid_depts)]
    
    print(f"Records after cleaning: {len(df)}")
    print(f"Number of departments: {df['department'].nunique()}")
    print(f"\nTop departments:")
    print(df['department'].value_counts().head(10))
    
    return df

def train_model(df):
    """Train department classification model"""
    print("\n[3/6] Preprocessing text...")
    preprocessor = TextPreprocessor()
    df['subject_clean'] = df['subject'].apply(preprocessor.clean_text)
    
    # Remove empty texts
    df = df[df['subject_clean'].str.len() > 0]
    
    X = df['subject_clean']
    y = df['department']
    
    print(f"Training samples: {len(X)}")
    
    # Train-test split
    print("\n[4/6] Splitting data...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"Train: {len(X_train)}, Test: {len(X_test)}")
    
    # Create pipeline
    print("\n[5/6] Training model...")
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2),
            min_df=2,
            max_df=0.8
        )),
        ('clf', LogisticRegression(
            max_iter=1000,
            random_state=42,
            class_weight='balanced'
        ))
    ])
    
    # Train
    pipeline.fit(X_train, y_train)
    
    # Evaluate
    print("\n[6/6] Evaluating model...")
    y_pred = pipeline.predict(X_test)
    
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nAccuracy: {accuracy:.2%}")
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    return pipeline, preprocessor, accuracy

def save_model(pipeline, preprocessor):
    """Save trained model"""
    os.makedirs('models/saved', exist_ok=True)
    
    joblib.dump(pipeline, 'models/saved/real_department_model.pkl')
    joblib.dump(preprocessor, 'models/saved/text_preprocessor.pkl')
    
    print("\n[OK] Model saved:")
    print("  - models/saved/real_department_model.pkl")
    print("  - models/saved/text_preprocessor.pkl")

def main():
    print("="*70)
    print("  TRAINING REAL DEPARTMENT CLASSIFICATION MODEL")
    print("="*70)
    
    csv_path = 'data/og_311_ServiceRequest_2021.csv'
    
    if not os.path.exists(csv_path):
        print(f"\n[ERROR] Dataset not found: {csv_path}")
        print("Please place the Boston 311 dataset in the data/ folder")
        return
    
    # Load data
    df = load_and_prepare_data(csv_path)
    
    # Train model
    pipeline, preprocessor, accuracy = train_model(df)
    
    # Save model
    save_model(pipeline, preprocessor)
    
    print("\n" + "="*70)
    print(f"  MODEL TRAINING COMPLETE! Accuracy: {accuracy:.2%}")
    print("="*70)
    print("\nNext steps:")
    print("1. Model is saved and ready to use")
    print("2. Restart your Flask app: python app.py")
    print("3. The new model will be loaded automatically")
    print()

if __name__ == "__main__":
    main()
