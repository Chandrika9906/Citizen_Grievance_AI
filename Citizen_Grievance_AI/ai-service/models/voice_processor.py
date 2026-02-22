try:
    import whisper
except ImportError:
    whisper = None
import tempfile
import os
import re

 
class VoiceProcessor :
    def __init__(self):
        """
        Offline Voice to Text using OpenAI Whisper
        Supports:
        - Tamil
        - English
        - Tanglish (Tamil + English mixed)
        """

        print("[INFO] Loading Whisper model...")
        if whisper:
            try:
                # Upgrading to 'medium' for MUCH better Tamil accuracy
                self.model = whisper.load_model("medium")
                print("[OK] Whisper medium model loaded")
            except Exception as e:
                print(f"[ERR] Failed to load Whisper: {e}")
                self.model = None
        else:
            print("[WARN] Whisper not installed, voice features will be disabled")
            self.model = None

    def convert_to_text(self, audio_file):
        """
        Convert uploaded audio file to text

        Works for:
        - Flask file object (has .save())
        - Normal Python file object (open("sample.wav", "rb"))
        """

        temp_path = None

        try:
            # Save temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp:
                temp_path = temp.name

                if hasattr(audio_file, "save"):
                    audio_file.save(temp_path)
                else:
                    temp.write(audio_file.read())

            # Restrict to auto-detection but guide towards our specific languages
            result = self.model.transcribe(
                temp_path,
                task="transcribe",
                # No forced language to allow detection
                initial_prompt="This is a citizen complaint. குப்பைகள், சாலை வசதி, தண்ணீர் பிரச்சனை.", # Use a mix of Eng/Tam for guidance
                temperature=0,
                best_of=5,
                beam_size=5
            )

            text = result["text"].strip()
            
            # Clean up text - sometimes whisper appends the prompt if audio is silent/short
            prompt_words = ["Analyze", "audio", "English", "Tamil"]
            for word in prompt_words:
                if text.endswith(word) or text.endswith(word + "."):
                    text = text.rsplit(word, 1)[0].strip()

            # Get actual detected language from Whisper
            detected_lang_code = result.get("language", "unknown")
            
            # Detect Tanglish (Mixed script)
            has_tamil = bool(re.search(r'[\u0b80-\u0bff]', text))
            has_english = bool(re.search(r'[a-zA-Z]', text))
            
            if has_tamil and has_english:
                lang_name = "Tanglish"
            elif has_tamil:
                lang_name = "Tamil"
            else:
                lang_name = "English"

            print(f"🔍 [DEBUG] Whisper code: {detected_lang_code} | Scripts: Tam={has_tamil}, Eng={has_english} | Final: {lang_name}")

            return {
                "success": True,
                "text": text,
                "language_detected": lang_name
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

        finally:
            # Always delete temp file
            if temp_path and os.path.exists(temp_path):
                os.remove(temp_path)
