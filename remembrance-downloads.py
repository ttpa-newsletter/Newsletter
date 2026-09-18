from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

# ==========================================================
# TTPA - Create downloadable remembrance photographs
# ==========================================================

SOURCE = Path("images/remembrance")
OUTPUT = SOURCE / "downloads"

OUTPUT.mkdir(exist_ok=True)

TEXT = "AI-reconstructed image"

SUPPORTED = {".png", ".jpg", ".jpeg"}

processed = 0
skipped = 0


def get_font(size):
    """
    Try commonly available fonts.
    Fall back to Pillow's default font if necessary.
    """
    font_paths = [
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial.ttf"
    ]

    for font_path in font_paths:
        try:
            return ImageFont.truetype(font_path, size)
        except OSError:
            continue

    return ImageFont.load_default()


for source_file in SOURCE.iterdir():

    # Ignore folders such as /downloads/
    if not source_file.is_file():
        continue

    if source_file.suffix.lower() not in SUPPORTED:
        continue

    output_file = OUTPUT / source_file.name

    try:

        with Image.open(source_file) as original:

            # Work internally in RGB
            image = original.convert("RGB")

            width, height = image.size

            # Footer proportional to photograph size
            footer_height = max(45, int(height * 0.07))

            # Font proportional to image width
            font_size = max(18, int(width * 0.025))

            font = get_font(font_size)

            # Create a new image taller than the original
            new_image = Image.new(
                "RGB",
                (width, height + footer_height),
                "white"
            )

            # Original photograph remains untouched
            new_image.paste(image, (0, 0))

            draw = ImageDraw.Draw(new_image)

            # Calculate text size
            bbox = draw.textbbox(
                (0, 0),
                TEXT,
                font=font
            )

            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]

            x = (width - text_width) // 2

            y = (
                height
                + (footer_height - text_height) // 2
                - bbox[1]
            )

            draw.text(
                (x, y),
                TEXT,
                fill="black",
                font=font
            )

            # Save using the original filename/extension
            if source_file.suffix.lower() in {".jpg", ".jpeg"}:

                new_image.save(
                    output_file,
                    quality=95,
                    optimize=True
                )

            else:

                new_image.save(
                    output_file,
                    optimize=True
                )

            processed += 1

            print(
                "Created:",
                output_file
            )

    except Exception as error:

        skipped += 1

        print(
            "ERROR:",
            source_file.name,
            "-",
            error
        )


print()
print("==============================")
print("Processing completed")
print("==============================")
print("Created:", processed)
print("Errors:", skipped)
print("Output:", OUTPUT)