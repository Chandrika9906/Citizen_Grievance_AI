"""
Train YOLOv8 Model for Complaint Image Classification
Optimized for RTX 3050 (6GB VRAM)
"""

from ultralytics import YOLO
import torch
import os

def check_gpu():
    """Verify GPU is available"""
    print("\n" + "="*60)
    print("  GPU CHECK")
    print("="*60)
    print(f"PyTorch Version: {torch.__version__}")
    print(f"CUDA Available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"CUDA Version: {torch.version.cuda}")
        print(f"GPU: {torch.cuda.get_device_name(0)}")
        print(f"GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
    print("="*60 + "\n")

def train_yolo():
    """Train YOLOv8 model"""
    
    # Check GPU
    check_gpu()
    
    if not torch.cuda.is_available():
        print("[WARNING] CUDA not available! Training will be slow on CPU.")
        response = input("Continue anyway? (y/n): ")
        if response.lower() != 'y':
            return
    
    # Check dataset
    dataset_yaml = "yolo_dataset/dataset.yaml"
    if not os.path.exists(dataset_yaml):
        print(f"[ERROR] Dataset not found: {dataset_yaml}")
        print("Run: python setup_yolo_dataset.py")
        return
    
    # Check if images exist
    train_images = "yolo_dataset/images/train"
    if not os.path.exists(train_images) or len(os.listdir(train_images)) == 0:
        print(f"[ERROR] No training images found in: {train_images}")
        print("Please add images before training")
        return
    
    print("\n" + "="*60)
    print("  TRAINING YOLOV8 MODEL")
    print("="*60 + "\n")
    
    # Load YOLOv8 nano model (smallest, fastest)
    print("[1/3] Loading YOLOv8n model...")
    model = YOLO('yolov8n-cls.pt')  # Classification model
    
    # Training parameters optimized for RTX 3050 (6GB VRAM)
    print("\n[2/3] Starting training...")
    print("Configuration:")
    print("  - Model: YOLOv8n (nano)")
    print("  - Epochs: 50")
    print("  - Batch: 16")
    print("  - Image Size: 224")
    print("  - Device: GPU (CUDA)")
    print()
    
    try:
        results = model.train(
            data=dataset_yaml,
            epochs=50,              # Number of training epochs
            imgsz=224,              # Image size (smaller = less VRAM)
            batch=16,               # Batch size (adjust if OOM error)
            device=0,               # Use GPU 0
            workers=4,              # Number of workers
            patience=10,            # Early stopping patience
            save=True,              # Save checkpoints
            plots=True,             # Generate plots
            verbose=True,           # Verbose output
            amp=True,               # Mixed precision training (faster)
            project='runs/classify', # Save location
            name='complaint_classifier'
        )
        
        print("\n[3/3] Training complete!")
        print(f"Best model saved to: {results.save_dir}/weights/best.pt")
        
        # Test the model
        print("\n" + "="*60)
        print("  TESTING MODEL")
        print("="*60 + "\n")
        
        best_model = YOLO(f"{results.save_dir}/weights/best.pt")
        metrics = best_model.val()
        
        print(f"\nValidation Accuracy: {metrics.top1:.2%}")
        print(f"Top-5 Accuracy: {metrics.top5:.2%}")
        
        print("\n" + "="*60)
        print("  SUCCESS!")
        print("="*60)
        print(f"\nModel ready for deployment!")
        print(f"Copy to: models/saved/yolo_complaint_classifier.pt")
        print()
        
    except RuntimeError as e:
        if "out of memory" in str(e):
            print("\n[ERROR] GPU Out of Memory!")
            print("\nSolutions:")
            print("1. Reduce batch size: batch=8 or batch=4")
            print("2. Reduce image size: imgsz=128")
            print("3. Close other GPU applications")
            print("4. Use CPU: device='cpu' (slower)")
        else:
            print(f"\n[ERROR] {e}")

def quick_test():
    """Quick test with tiny dataset"""
    print("\n" + "="*60)
    print("  QUICK TEST (5 epochs)")
    print("="*60 + "\n")
    
    model = YOLO('yolov8n-cls.pt')
    
    results = model.train(
        data="yolo_dataset/dataset.yaml",
        epochs=5,
        imgsz=128,
        batch=8,
        device=0,
        project='runs/classify',
        name='test_run'
    )
    
    print("\n[OK] Quick test complete!")
    print("If this worked, run full training with: python train_yolo.py")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == '--test':
        quick_test()
    else:
        train_yolo()
