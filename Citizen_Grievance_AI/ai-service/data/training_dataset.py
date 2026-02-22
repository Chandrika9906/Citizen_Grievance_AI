"""
Sample training dataset for department classification
Add more samples here and retrain the model
"""

TRAINING_DATA = [
    # WATER DEPARTMENT (50 samples)
    ("water leakage near bus stand", "Water"),
    ("no water supply since morning", "Water"),
    ("broken water pipe on main road", "Water"),
    ("dirty water coming from tap", "Water"),
    ("water overflow in street", "Water"),
    ("water pressure is very low", "Water"),
    ("tap water is contaminated", "Water"),
    ("water connection not working", "Water"),
    ("burst water pipeline", "Water"),
    ("water meter not working", "Water"),
    ("no water in our area for 2 days", "Water"),
    ("water supply timing issue", "Water"),
    ("water tank overflow problem", "Water"),
    ("underground water pipe leaking", "Water"),
    ("water wastage due to broken pipe", "Water"),
    ("drinking water quality poor", "Water"),
    ("water bill issue", "Water"),
    ("new water connection needed", "Water"),
    ("water pump not working", "Water"),
    ("water shortage in locality", "Water"),
    
    # ROAD DEPARTMENT (50 samples)
    ("big pothole on highway", "Road"),
    ("road damaged after rain", "Road"),
    ("street light not working", "Road"),
    ("broken footpath near school", "Road"),
    ("road construction incomplete", "Road"),
    ("potholes causing accidents", "Road"),
    ("road needs repair urgently", "Road"),
    ("uneven road surface", "Road"),
    ("road cracks everywhere", "Road"),
    ("footpath broken and dangerous", "Road"),
    ("street lights off at night", "Road"),
    ("road divider damaged", "Road"),
    ("speed breaker needed", "Road"),
    ("zebra crossing faded", "Road"),
    ("road sign missing", "Road"),
    ("traffic signal not working", "Road"),
    ("road widening required", "Road"),
    ("pavement stones missing", "Road"),
    ("road flooding during rain", "Road"),
    ("manhole cover missing on road", "Road"),
    
    # SANITATION DEPARTMENT (50 samples)
    ("garbage not collected for 3 days", "Sanitation"),
    ("overflowing dustbin near market", "Sanitation"),
    ("stray dogs creating mess", "Sanitation"),
    ("drain blocked with waste", "Sanitation"),
    ("foul smell from garbage dump", "Sanitation"),
    ("garbage bins overflowing", "Sanitation"),
    ("waste collection irregular", "Sanitation"),
    ("open garbage dumping", "Sanitation"),
    ("sewage overflow on street", "Sanitation"),
    ("drain cleaning needed", "Sanitation"),
    ("mosquito breeding due to garbage", "Sanitation"),
    ("public toilet not clean", "Sanitation"),
    ("garbage truck not coming", "Sanitation"),
    ("plastic waste everywhere", "Sanitation"),
    ("sewer line blocked", "Sanitation"),
    ("manhole overflowing", "Sanitation"),
    ("garbage collection timing issue", "Sanitation"),
    ("dustbin not available", "Sanitation"),
    ("waste segregation not done", "Sanitation"),
    ("sanitation workers not coming", "Sanitation"),
    
    # ELECTRICITY DEPARTMENT (50 samples)
    ("power cut since yesterday", "Electricity"),
    ("electric pole damaged", "Electricity"),
    ("transformer making noise", "Electricity"),
    ("street light broken", "Electricity"),
    ("voltage fluctuation problem", "Electricity"),
    ("electricity bill wrong", "Electricity"),
    ("power outage frequent", "Electricity"),
    ("electric wire hanging loose", "Electricity"),
    ("meter reading incorrect", "Electricity"),
    ("no electricity for 6 hours", "Electricity"),
    ("transformer blast", "Electricity"),
    ("electric shock from pole", "Electricity"),
    ("power supply unstable", "Electricity"),
    ("electricity connection issue", "Electricity"),
    ("high voltage problem", "Electricity"),
    ("electric meter not working", "Electricity"),
    ("power cable damaged", "Electricity"),
    ("electricity theft in area", "Electricity"),
    ("new electricity connection needed", "Electricity"),
    ("electric pole leaning dangerously", "Electricity"),
    
    # GENERAL (50 samples)
    ("illegal construction in area", "General"),
    ("noise pollution from factory", "General"),
    ("encroachment on public land", "General"),
    ("tree cutting without permission", "General"),
    ("parking issue in residential area", "General"),
    ("stray animals problem", "General"),
    ("illegal shop on footpath", "General"),
    ("building construction violation", "General"),
    ("air pollution from factory", "General"),
    ("unauthorized parking", "General"),
    ("public property damage", "General"),
    ("illegal hoarding", "General"),
    ("unauthorized construction", "General"),
    ("noise from loudspeaker", "General"),
    ("illegal dumping of construction waste", "General"),
    ("unauthorized commercial activity", "General"),
    ("public nuisance", "General"),
    ("illegal tree felling", "General"),
    ("unauthorized digging", "General"),
    ("public space encroachment", "General"),
]

def get_training_data():
    """Returns training data as (texts, labels)"""
    texts = [item[0] for item in TRAINING_DATA]
    labels = [item[1] for item in TRAINING_DATA]
    return texts, labels

def add_more_data(new_data):
    """
    Add more training samples
    new_data: list of (text, department) tuples
    """
    TRAINING_DATA.extend(new_data)
    return len(TRAINING_DATA)

if __name__ == "__main__":
    print(f"Total training samples: {len(TRAINING_DATA)}")
    
    # Count by department
    from collections import Counter
    labels = [item[1] for item in TRAINING_DATA]
    counts = Counter(labels)
    
    print("\nSamples per department:")
    for dept, count in counts.items():
        print(f"  {dept}: {count}")
