# 🎯 YOLOV8 QUICK REFERENCE

## ⚡ ONE-COMMAND SETUP (If you have Python 3.12)

```powershell
# If Python 3.12 is already installed:
py -3.12 -m venv yolo_env
.\yolo_env\Scripts\Activate.ps1
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
pip install ultralytics opencv-python pillow pyyaml
python setup_yolo_dataset.py
```

## 🚀 AUTOMATED SETUP (Downloads Python 3.12)

```powershell
.\setup_yolo.ps1
```

## ✅ VERIFY SETUP

```powershell
.\yolo_env\Scripts\Activate.ps1
python -c "import torch; print(f'CUDA: {torch.cuda.is_available()}')"
python -c "from ultralytics import YOLO; print('YOLOv8 OK')"
```

## 🎓 TRAINING COMMANDS

```powershell
# Quick test (2 min, no images needed)
python train_yolo.py --test

# Full training (30-60 min, needs images)
python train_yolo.py
```

## 📦 DEPLOY MODEL

```powershell
copy runs\classify\complaint_classifier\weights\best.pt models\saved\yolo_complaint_classifier.pt
```

## 🧪 TEST MODEL

```powershell
python -c "from models.image_classifier import ImageClassifier; c=ImageClassifier(); print(c.classify('test.jpg'))"
```

## 📊 MONITOR GPU

```powershell
nvidia-smi -l 1
```

## 🐛 FIX OUT OF MEMORY

Edit `train_yolo.py`:
- Line 67: `batch=8` (or `batch=4`)
- Line 66: `imgsz=128`

## 📁 DATASET STRUCTURE

```
yolo_dataset/
├── images/
│   ├── train/  ← Put 80% of images here
│   └── val/    ← Put 20% of images here
└── dataset.yaml
```

## 🎯 CATEGORIES

0. pothole → Road
1. garbage → Sanitation
2. water_leak → Water
3. broken_wire → Electricity

## 🔗 USEFUL LINKS

- Download images: https://universe.roboflow.com/
- YOLOv8 docs: https://docs.ultralytics.com/
- PyTorch CUDA: https://pytorch.org/get-started/locally/

## 💡 TIPS

- Start with `--test` to verify GPU works
- Use 224x224 images for RTX 3050
- Batch size 16 is optimal for 6GB VRAM
- Training 50 epochs takes ~45 minutes
- Model size: ~6 MB

## 🎬 DEMO FLOW

1. Upload image → Flask API
2. YOLOv8 classifies → Category
3. Map to department → Response
4. Show confidence score

## ⚠️ COMMON ISSUES

| Issue | Solution |
|-------|----------|
| CUDA not available | Check `nvidia-smi`, reinstall PyTorch |
| Out of memory | Reduce batch size to 8 or 4 |
| Slow training | Close Chrome, check GPU usage |
| Model not loading | `pip install ultralytics` in main env |

## 📞 INTEGRATION

The model automatically integrates with Flask:
- Endpoint: `/classify-image`
- Input: Image file
- Output: Department + confidence

No code changes needed!

---

**Read YOLO_STEPS.md for detailed instructions**
