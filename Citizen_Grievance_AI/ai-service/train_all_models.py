"""
Master Training Script
Train all ML models using Boston 311 dataset
"""

import os
import sys

def check_dataset():
    """Check if dataset exists"""
    csv_path = 'data/og_311_ServiceRequest_2021.csv'
    
    if not os.path.exists(csv_path):
        print("\n[ERROR] Dataset not found!")
        print(f"Expected location: {csv_path}")
        print("\nPlease place the Boston 311 dataset in the data/ folder")
        return False
    
    print(f"[OK] Dataset found: {csv_path}")
    return True

def train_all_models():
    """Train all ML models"""
    print("\n" + "="*70)
    print("  TRAINING ALL ML MODELS")
    print("="*70 + "\n")
    
    if not check_dataset():
        return
    
    # Train department classification model
    print("\n[1/2] Training Department Classification Model...")
    print("-"*70)
    try:
        from train_real_model import main as train_dept
        train_dept()
    except Exception as e:
        print(f"[ERROR] Department model training failed: {e}")
    
    # Train priority prediction model
    print("\n[2/2] Training Priority Prediction Model...")
    print("-"*70)
    try:
        from train_priority_model import train_priority_model
        train_priority_model('data/og_311_ServiceRequest_2021.csv')
    except Exception as e:
        print(f"[ERROR] Priority model training failed: {e}")
    
    print("\n" + "="*70)
    print("  ALL MODELS TRAINED!")
    print("="*70)
    print("\nModels saved:")
    print("  - models/saved/real_department_model.pkl")
    print("  - models/saved/text_preprocessor.pkl")
    print("  - models/saved/priority_model.pkl")
    print("\nNext steps:")
    print("  1. Restart Flask app: python app.py")
    print("  2. Test API: python demo.py")
    print()

if __name__ == "__main__":
    train_all_models()
