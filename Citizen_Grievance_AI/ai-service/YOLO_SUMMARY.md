# 🚀 YOLOv8 Image Classification - Complete Setup

## 📋 WHAT YOU GET

After completing this setup, your AI system will:
- ✅ Classify complaint images into 4 categories
- ✅ Use GPU acceleration (RTX 3050)
- ✅ Integrate with Flask API
- ✅ Work alongside existing ML models

## 🎯 CATEGORIES

1. **Pothole** → Road Department
2. **Garbage** → Sanitation Department
3. **Water Leak** → Water Department
4. **Broken Wire** → Electricity Department

## 📁 FILES CREATED

| File | Purpose |
|------|---------|
| `setup_yolo.ps1` | Automated setup script |
| `setup_yolo_dataset.py` | Create dataset structure |
| `train_yolo.py` | Train YOLOv8 model |
| `models/image_classifier.py` | Updated Flask integration |
| `YOLO_STEPS.md` | Step-by-step guide |
| `YOLO_SETUP_GUIDE.txt` | Detailed instructions |

## ⚡ QUICK START (5 MINUTES)

```powershell
# 1. Run automated setup
cd D:\Blaze2026\Citizen_Grievance_AI\ai-service
.\setup_yolo.ps1

# 2. Activate environment
.\yolo_env\Scripts\Activate.ps1

# 3. Verify CUDA
python -c "import torch; print(torch.cuda.is_available())"

# 4. Quick test (no images needed)
python train_yolo.py --test

# 5. Copy model
copy runs\classify\test_run\weights\best.pt models\saved\yolo_complaint_classifier.pt

# 6. Done! Model is ready
```

## 🎓 FULL TRAINING (WITH REAL IMAGES)

### Step 1: Collect Images (200+ total)
- 50+ pothole images
- 50+ garbage images  
- 50+ water leak images
- 50+ broken wire images

**Sources:**
- Google Images
- Kaggle: Search "pothole detection", "garbage classification"
- Roboflow: https://universe.roboflow.com/

### Step 2: Organize Images
```
yolo_dataset/
├── images/
│   ├── train/  (80% of images)
│   └── val/    (20% of images)
```

### Step 3: Train
```powershell
python train_yolo.py
```

Training time: 30-60 minutes on RTX 3050

### Step 4: Deploy
```powershell
copy runs\classify\complaint_classifier\weights\best.pt models\saved\yolo_complaint_classifier.pt
```

## 🔧 SYSTEM REQUIREMENTS

✅ Windows 11
✅ Python 3.12 (will be installed)
✅ NVIDIA RTX 3050 (6GB VRAM)
✅ CUDA 11.8 (compatible with CUDA 13.0)
✅ 16GB RAM

## 📊 EXPECTED PERFORMANCE

| Metric | Value |
|--------|-------|
| Training Time | 30-60 min (50 epochs) |
| Inference Time | 10-50ms per image |
| Model Size | ~6 MB |
| Accuracy | 80-95% (with 200+ images) |
| GPU Memory | 3-5 GB / 6 GB |

## 🎬 DEMO READY

After setup, you can:

1. **Upload image via API:**
```bash
curl -X POST http://localhost:5001/classify-image \
  -F "image=@pothole.jpg"
```

2. **Get response:**
```json
{
  "detected": "pothole",
  "department": "Road",
  "confidence": 0.92,
  "model": "YOLOv8"
}
```

## 🔥 HACKATHON ADVANTAGES

1. **Real Computer Vision**: Not just text analysis
2. **GPU Accelerated**: Fast inference
3. **Production Ready**: YOLOv8 is industry standard
4. **Easy to Demo**: Upload image → Get department
5. **Scalable**: Can add more categories easily

## 🐛 TROUBLESHOOTING

### CUDA Not Available
```powershell
nvidia-smi  # Check driver
python -c "import torch; print(torch.version.cuda)"
```

### Out of Memory
Edit `train_yolo.py`:
- Change `batch=16` to `batch=8`
- Change `imgsz=224` to `imgsz=128`

### Slow Training
- Close Chrome/other GPU apps
- Check: `nvidia-smi -l 1`
- Verify GPU usage is 80-100%

### Model Not Loading
```powershell
# Install in main environment
pip install ultralytics
```

## 📝 INTEGRATION WITH FLASK

The updated `image_classifier.py` automatically:
- Loads YOLOv8 model if available
- Falls back to placeholder if not trained
- Returns department + confidence
- Works with existing Flask endpoints

No changes needed to `app.py`!

## ✅ CHECKLIST

- [ ] Run `setup_yolo.ps1`
- [ ] Verify CUDA works
- [ ] Create dataset structure
- [ ] Add training images (or skip for quick test)
- [ ] Train model
- [ ] Copy model to `models/saved/`
- [ ] Test with Flask API
- [ ] Demo ready!

## 🎯 NEXT STEPS

1. **For Quick Demo**: Use `--test` flag, get working model in 5 minutes
2. **For Real Accuracy**: Collect 200+ images, train for 1 hour
3. **For Production**: Collect 1000+ images, fine-tune hyperparameters

## 💡 TIPS

- Start with quick test to verify GPU works
- Collect images during hackathon if time permits
- Use Roboflow for pre-labeled datasets
- Monitor GPU with `nvidia-smi`
- Save checkpoints during training

---

**Your image classification system is ready to build!** 🚀

Follow `YOLO_STEPS.md` for detailed commands.
