# Automated Setup Script for YOLOv8 with CUDA
# Run this in PowerShell as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  YOLOv8 + CUDA Setup for RTX 3050" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Download Python 3.12 embeddable
Write-Host "[1/8] Downloading Python 3.12.8..." -ForegroundColor Yellow
$pythonUrl = "https://www.python.org/ftp/python/3.12.8/python-3.12.8-embed-amd64.zip"
$pythonZip = "python312.zip"
$pythonDir = "D:\Blaze2026\python312"

if (-Not (Test-Path $pythonDir)) {
    Invoke-WebRequest -Uri $pythonUrl -OutFile $pythonZip
    Expand-Archive -Path $pythonZip -DestinationPath $pythonDir -Force
    Remove-Item $pythonZip
    Write-Host "[OK] Python 3.12 installed to $pythonDir" -ForegroundColor Green
} else {
    Write-Host "[OK] Python 3.12 already exists" -ForegroundColor Green
}

# Step 2: Get get-pip.py
Write-Host ""
Write-Host "[2/8] Setting up pip..." -ForegroundColor Yellow
$getPipUrl = "https://bootstrap.pypa.io/get-pip.py"
$getPipPath = "$pythonDir\get-pip.py"

if (-Not (Test-Path "$pythonDir\Scripts\pip.exe")) {
    Invoke-WebRequest -Uri $getPipUrl -OutFile $getPipPath
    & "$pythonDir\python.exe" $getPipPath
    Write-Host "[OK] Pip installed" -ForegroundColor Green
} else {
    Write-Host "[OK] Pip already installed" -ForegroundColor Green
}

# Step 3: Create virtual environment
Write-Host ""
Write-Host "[3/8] Creating virtual environment..." -ForegroundColor Yellow
$venvPath = "D:\Blaze2026\Citizen_Grievance_AI\ai-service\yolo_env"

if (-Not (Test-Path $venvPath)) {
    & "$pythonDir\python.exe" -m venv $venvPath
    Write-Host "[OK] Virtual environment created" -ForegroundColor Green
} else {
    Write-Host "[OK] Virtual environment already exists" -ForegroundColor Green
}

# Step 4: Activate and install PyTorch
Write-Host ""
Write-Host "[4/8] Installing PyTorch with CUDA 11.8..." -ForegroundColor Yellow
Write-Host "This may take 5-10 minutes..." -ForegroundColor Gray

$activateScript = "$venvPath\Scripts\Activate.ps1"
& $activateScript

# Upgrade pip
& "$venvPath\Scripts\python.exe" -m pip install --upgrade pip --quiet

# Install PyTorch with CUDA 11.8
& "$venvPath\Scripts\pip.exe" install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

Write-Host "[OK] PyTorch installed" -ForegroundColor Green

# Step 5: Verify CUDA
Write-Host ""
Write-Host "[5/8] Verifying CUDA..." -ForegroundColor Yellow
& "$venvPath\Scripts\python.exe" -c "import torch; print(f'CUDA Available: {torch.cuda.is_available()}'); print(f'GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else \"None\"}')"

# Step 6: Install YOLOv8
Write-Host ""
Write-Host "[6/8] Installing Ultralytics YOLOv8..." -ForegroundColor Yellow
& "$venvPath\Scripts\pip.exe" install ultralytics opencv-python pillow --quiet
Write-Host "[OK] YOLOv8 installed" -ForegroundColor Green

# Step 7: Test YOLOv8
Write-Host ""
Write-Host "[7/8] Testing YOLOv8..." -ForegroundColor Yellow
& "$venvPath\Scripts\python.exe" -c "from ultralytics import YOLO; print('YOLOv8 working!')"

# Step 8: Create dataset structure
Write-Host ""
Write-Host "[8/8] Creating dataset structure..." -ForegroundColor Yellow
& "$venvPath\Scripts\python.exe" setup_yolo_dataset.py

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  SETUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Activate environment: .\yolo_env\Scripts\Activate.ps1"
Write-Host "2. Add images to: yolo_dataset/images/train/"
Write-Host "3. Train model: python train_yolo.py"
Write-Host ""
