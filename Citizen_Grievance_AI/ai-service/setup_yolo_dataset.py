"""
Setup YOLOv8 Dataset Structure
Creates folders for 4 complaint categories
"""

import os
import yaml

# Dataset structure
DATASET_ROOT = "yolo_dataset"
CATEGORIES = ["pothole", "garbage", "water_leak", "broken_wire"]

def create_dataset_structure():
    """Create YOLOv8 dataset folder structure"""
    print("\n" + "="*60)
    print("  CREATING YOLO DATASET STRUCTURE")
    print("="*60 + "\n")
    
    # Create main folders
    folders = [
        f"{DATASET_ROOT}/images/train",
        f"{DATASET_ROOT}/images/val",
        f"{DATASET_ROOT}/labels/train",
        f"{DATASET_ROOT}/labels/val"
    ]
    
    for folder in folders:
        os.makedirs(folder, exist_ok=True)
        print(f"[OK] Created: {folder}")
    
    # Create dataset.yaml
    dataset_config = {
        'path': os.path.abspath(DATASET_ROOT),
        'train': 'images/train',
        'val': 'images/val',
        'names': {i: cat for i, cat in enumerate(CATEGORIES)},
        'nc': len(CATEGORIES)
    }
    
    yaml_path = f"{DATASET_ROOT}/dataset.yaml"
    with open(yaml_path, 'w') as f:
        yaml.dump(dataset_config, f, default_flow_style=False)
    
    print(f"\n[OK] Created: {yaml_path}")
    
    # Create README
    readme_content = f"""# YOLOv8 Complaint Image Dataset

## Categories
{chr(10).join(f'{i}. {cat}' for i, cat in enumerate(CATEGORIES))}

## Dataset Structure
```
{DATASET_ROOT}/
├── images/
│   ├── train/          # Training images
│   └── val/            # Validation images
├── labels/
│   ├── train/          # Training labels (YOLO format)
│   └── val/            # Validation labels (YOLO format)
└── dataset.yaml        # Dataset configuration
```

## How to Add Images

### 1. Collect Images
- Take photos of: {', '.join(CATEGORIES)}
- Or download from Google Images / Kaggle
- Minimum: 50 images per category (200 total)
- Recommended: 100+ images per category

### 2. Place Images
- Put 80% in `images/train/`
- Put 20% in `images/val/`
- Supported formats: .jpg, .jpeg, .png

### 3. Label Images (Optional - YOLOv8 can auto-label)
- Use tools like LabelImg or Roboflow
- Save labels in YOLO format (.txt files)
- Place in corresponding `labels/train/` or `labels/val/`

### 4. Quick Start (No Manual Labeling)
If you don't have time to label:
- Just put images in folders
- YOLOv8 will use image classification mode
- Organize by category:
  ```
  images/train/pothole/image1.jpg
  images/train/garbage/image2.jpg
  ```

## Train Model
```bash
python train_yolo.py
```

## Test Model
```bash
python test_yolo.py
```
"""
    
    readme_path = f"{DATASET_ROOT}/README.md"
    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(readme_content)
    
    print(f"[OK] Created: {readme_path}")
    
    # Create sample download script
    download_script = f"""\"\"\"
Download Sample Images for Training
Uses Google Images (requires google_images_download or manual download)
\"\"\"

# OPTION 1: Manual Download
# Go to Google Images and search:
# - "pothole road damage"
# - "garbage pile street"
# - "water leak pipe"
# - "broken electric wire"
# 
# Download 50-100 images per category
# Save to: {DATASET_ROOT}/images/train/

# OPTION 2: Use Kaggle Datasets
# Search for:
# - Pothole Detection Dataset
# - Garbage Classification Dataset
# - Infrastructure Damage Dataset

# OPTION 3: Use Roboflow (Recommended)
# 1. Go to: https://universe.roboflow.com/
# 2. Search for relevant datasets
# 3. Download in YOLOv8 format
# 4. Extract to {DATASET_ROOT}/

print("Please download images manually or use Roboflow")
print("See README.md for instructions")
"""
    
    download_path = f"{DATASET_ROOT}/download_images.py"
    with open(download_path, 'w', encoding='utf-8') as f:
        f.write(download_script)
    
    print(f"[OK] Created: {download_path}")
    
    print("\n" + "="*60)
    print("  DATASET STRUCTURE CREATED!")
    print("="*60)
    print(f"\nCategories: {', '.join(CATEGORIES)}")
    print(f"\nNext steps:")
    print(f"1. Add images to: {DATASET_ROOT}/images/train/")
    print(f"2. Add images to: {DATASET_ROOT}/images/val/")
    print(f"3. Run training: python train_yolo.py")
    print()

if __name__ == "__main__":
    create_dataset_structure()
