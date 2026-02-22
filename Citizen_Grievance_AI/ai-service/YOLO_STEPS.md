# YOLOV8 SETUP - STEP BY STEP COMMANDS

## STEP 1: Run Setup Script (Automated)

Open PowerShell as Administrator and run:

```powershell
cd D:\Blaze2026\Citizen_Grievance_AI\ai-service
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\setup_yolo.ps1
```

This will:
- Download Python 3.12
- Create virtual environment
- Install PyTorch with CUDA
- Install YOLOv8
- Create dataset structure

---

## STEP 2: Activate Virtual Environment

```powershell
.\yolo_env\Scripts\Activate.ps1
```

You should see `(yolo_env)` in your prompt.

---

## STEP 3: Verify CUDA is Working

```powershell
python -c "import torch; print(f'CUDA: {torch.cuda.is_available()}'); print(f'GPU: {torch.cuda.get_device_name(0)}')"
```

Expected output:
```
CUDA: True
GPU: NVIDIA GeForce RTX 3050
```

---

## STEP 4: Create Dataset Structure

```powershell
python setup_yolo_dataset.py
```

This creates:
```
yolo_dataset/
├── images/train/
├── images/val/
├── labels/train/
├── labels/val/
└── dataset.yaml
```

---

## STEP 5: Add Training Images

### Option A: Quick Test (No Images Needed)
Skip to Step 6 with `--test` flag

### Option B: Real Training (Recommended)

1. Download images for each category:
   - Pothole: 50-100 images
   - Garbage: 50-100 images
   - Water leak: 50-100 images
   - Broken wire: 50-100 images

2. Place images:
   - 80% in `yolo_dataset/images/train/`
   - 20% in `yolo_dataset/images/val/`

3. Sources:
   - Google Images (search: "pothole", "garbage pile", etc.)
   - Kaggle datasets
   - Roboflow Universe: https://universe.roboflow.com/

---

## STEP 6: Train Model

### Quick Test (5 epochs, ~2 minutes):
```powershell
python train_yolo.py --test
```

### Full Training (50 epochs, ~30-60 minutes):
```powershell
python train_yolo.py
```

Training parameters (optimized for RTX 3050):
- Model: YOLOv8n (nano - smallest)
- Batch size: 16
- Image size: 224x224
- Epochs: 50
- Mixed precision: Enabled

---

## STEP 7: Monitor Training

Watch GPU usage in another terminal:
```powershell
nvidia-smi -l 1
```

You should see:
- GPU utilization: 80-100%
- Memory usage: 3-5 GB / 6 GB
- Temperature: 60-80°C

---

## STEP 8: Copy Trained Model

After training completes:

```powershell
# Find the best model
# It will be in: runs/classify/complaint_classifier/weights/best.pt

# Copy to Flask models folder
copy runs\classify\complaint_classifier\weights\best.pt models\saved\yolo_complaint_classifier.pt
```

---

## STEP 9: Test Model

```powershell
python -c "from models.image_classifier import ImageClassifier; clf = ImageClassifier(); print('Model loaded!')"
```

---

## STEP 10: Restart Flask App

```powershell
# Deactivate YOLO environment
deactivate

# Go back to main environment
cd D:\Blaze2026\Citizen_Grievance_AI\ai-service

# Start Flask
python app.py
```

The image classification endpoint will now use your trained YOLOv8 model!

---

## TROUBLESHOOTING

### CUDA Not Available
```powershell
# Check NVIDIA driver
nvidia-smi

# Reinstall PyTorch
pip uninstall torch torchvision torchaudio
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### Out of Memory Error
Edit `train_yolo.py` and reduce:
- `batch=8` (or `batch=4`)
- `imgsz=128`

### Training Too Slow
- Close Chrome/other GPU apps
- Check GPU usage: `nvidia-smi`
- Verify CUDA is being used

### Model Not Loading in Flask
```powershell
# Install ultralytics in main environment
pip install ultralytics
```

---

## EXPECTED RESULTS

After training with 200+ images:
- Accuracy: 80-95%
- Inference time: 10-50ms per image
- Model size: ~6 MB

---

## QUICK START (No Manual Steps)

If you just want to test the system:

1. Run setup: `.\setup_yolo.ps1`
2. Activate env: `.\yolo_env\Scripts\Activate.ps1`
3. Quick test: `python train_yolo.py --test`
4. Copy model: `copy runs\classify\test_run\weights\best.pt models\saved\yolo_complaint_classifier.pt`
5. Done!

The model will work (with low accuracy) and you can improve it later by adding real images.
