# Dataset Setup

## Required Dataset

This project uses the **Boston 311 Service Requests dataset**.

### Download Instructions

1. Download the dataset from Kaggle:
   - Dataset: Boston 311 Service Requests
   - File: `og_311_ServiceRequest_2021.csv`
   - Size: ~125 MB

2. Place the file in:
   ```
   ai-service/data/og_311_ServiceRequest_2021.csv
   ```

3. Train the models:
   ```bash
   cd ai-service
   python train_all_models.py
   ```

### Alternative: Use Pre-trained Models

If you don't have the dataset, the system will use fallback models with basic functionality.

### Note

The dataset is not included in the repository due to GitHub's 100MB file size limit.
