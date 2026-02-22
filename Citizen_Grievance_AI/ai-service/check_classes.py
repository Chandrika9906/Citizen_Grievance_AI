import joblib
import os

model_path = 'models/saved/real_department_model.pkl'
if os.path.exists(model_path):
    model = joblib.load(model_path)
    # Check classes
    if hasattr(model, 'classes_'):
        print("CLASSES:", model.classes_)
    elif hasattr(model, 'named_steps') and 'clf' in model.named_steps:
        print("CLASSES:", model.named_steps['clf'].classes_)
else:
    print("Model not found")
