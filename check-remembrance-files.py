from pathlib import Path
import re

DATA_FILE = Path("js/remembrance-data.js")
IMAGE_DIR = Path("images/remembrance")

text = DATA_FILE.read_text(encoding="utf-8")

data_files = re.findall(
    r'image:\s*"([^"]+)"',
    text
)

actual_files = {
    f.name
    for f in IMAGE_DIR.iterdir()
    if f.is_file()
    and f.suffix.lower() in {".png", ".jpg", ".jpeg"}
}

missing = [
    filename
    for filename in data_files
    if filename not in actual_files
]

print()
print("==============================")
print("REMEMBRANCE IMAGE CHECK")
print("==============================")
print("Records in data file:", len(data_files))
print("Images in folder:", len(actual_files))
print("Missing / mismatched:", len(missing))
print()

for filename in missing:
    print("MISSING:", filename)