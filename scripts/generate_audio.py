import os
import json
from gtts import gTTS

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORDS_PATH = os.path.join(BASE_DIR, "src", "data", "words.json")
OUTPUT_DIR = os.path.join(BASE_DIR, "public", "audio")

LANG = "en"

def slugify(text: str) -> str:
    keep = "abcdefghijklmnopqrstuvwxyz0123456789-"
    text = text.lower().replace(" ", "-")
    text = "".join(ch for ch in text if ch in keep)
    return text or "audio"


def main():
    with open(WORDS_PATH, "r", encoding="utf-8") as f:
        words = json.load(f)

    for item in words:
        lesson_id = str(item["lessonId"])
        text = item["word"]
        filename = os.path.basename(item["audio"])

        if not filename:
            filename = f"{slugify(text)}.mp3"
            item["audio"] = f"/audio/{lesson_id}/{filename}"

        out_dir = os.path.join(OUTPUT_DIR, lesson_id)
        os.makedirs(out_dir, exist_ok=True)
        out_path = os.path.join(out_dir, filename)

        if os.path.exists(out_path):
            continue

        tts = gTTS(text=text, lang=LANG)
        tts.save(out_path)

    print("Audio generation completed.")


if __name__ == "__main__":
    main()
