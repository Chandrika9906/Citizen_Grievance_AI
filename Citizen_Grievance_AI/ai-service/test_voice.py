from models.voice_processor import VoiceProcessor

vp = VoiceProcessor()

with open("sample.wav", "rb") as f:
    result = vp.convert_to_text(f)

print("Result:", result)
