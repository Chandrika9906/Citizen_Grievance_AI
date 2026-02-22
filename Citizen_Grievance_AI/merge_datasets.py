import os
import shutil

BASE_PATH = "datasets"
FINAL_PATH = os.path.join(BASE_PATH, "final_dataset")

# Class mapping
CLASS_MAPPING = {
    "Pothole Detection.v1i.yolov8": 0,
    "Garbage.v1i.yolov8": 1,
    "Water_Flow_Detection.v2i.yolov8": 2,
    "WIRES.v1i.yolov8": 3,
}

def update_label_file(label_path, new_class_id):
    with open(label_path, "r") as f:
        lines = f.readlines()

    updated_lines = []
    for line in lines:
        parts = line.strip().split()
        if len(parts) > 0:
            parts[0] = str(new_class_id)
            updated_lines.append(" ".join(parts))

    with open(label_path, "w") as f:
        f.write("\n".join(updated_lines))


for dataset_name, class_id in CLASS_MAPPING.items():
    dataset_path = os.path.join(BASE_PATH, dataset_name)

    for split in ["train", "valid", "val", "test"]:
        images_path = os.path.join(dataset_path, split, "images")
        labels_path = os.path.join(dataset_path, split, "labels")

        if not os.path.exists(images_path):
            continue

        # Decide final split
        if split in ["valid", "val", "test"]:
            final_images = os.path.join(FINAL_PATH, "val", "images")
            final_labels = os.path.join(FINAL_PATH, "val", "labels")
        else:
            final_images = os.path.join(FINAL_PATH, "train", "images")
            final_labels = os.path.join(FINAL_PATH, "train", "labels")

        # 🔥 CREATE FOLDERS IF NOT EXIST
        os.makedirs(final_images, exist_ok=True)
        os.makedirs(final_labels, exist_ok=True)

        # Copy images
        for file in os.listdir(images_path):
            shutil.copy(
                os.path.join(images_path, file),
                os.path.join(final_images, f"{dataset_name}_{file}")
            )

        # Copy labels and update class ID
        if os.path.exists(labels_path):
            for file in os.listdir(labels_path):
                dest_path = os.path.join(final_labels, f"{dataset_name}_{file}")
                shutil.copy(
                    os.path.join(labels_path, file),
                    dest_path
                )
                update_label_file(dest_path, class_id)

print("✅ All datasets merged successfully!")
