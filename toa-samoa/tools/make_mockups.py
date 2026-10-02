#!/usr/bin/env python3
"""Build the Toa Samoa tee mockups: A3 landscape chest print + flag on the left sleeve.

Usage:
  python3 tools/make_mockups.py "/path/to/final-artwork.png" ["/path/to/artwork-for-white-tees.png"]

Artwork must be a transparent PNG. It is trimmed to its visible pixels, then fitted inside an
A3 landscape box (42 x 29.7 cm) centred on the chest. The optional second file is used on white
tees (e.g. a version with dark outlines instead of white ones). Writes 12 images to img/
(box fit, adult, kids x 4 colours). Kids prints fit an A4 landscape box instead.
"""
import math
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageChops, ImageFilter

HERE = Path(__file__).resolve().parent
BLANKS = HERE / "blanks"
OUT = HERE.parent / "img"
SIZE = 900                    # output px
BG = (243, 241, 236)          # page --bg-2, so white tees still read
A3_W_CM, A3_H_CM = 42.0, 29.7
FLAG_W_CM = 9.0               # adult sleeve flag width
LIGHT_EXTRA = {("boxfit", "grey")}   # light garments (besides white) that get the white-tee artwork

# Per-garment geometry, measured on the blank photos (pixels in the source image).
#   px_cm: pixels per cm at the chest   cx: chest centre x   top: print top y
#   sleeve: (x, y, angle) flag centre on the TOP SEAM of the wearer's left sleeve (viewer's right),
#           6 cm in from the sleeve opening. angle turns the flag so its long edge runs parallel to
#           the opening and its top edge faces the shoulder: upright on the arm when worn.
#           The flag wraps over the seam, so the front view shows the half on the front of the sleeve.
#   mask: blank whose silhouette cuts out every colour (Cloke photos sit on white, not transparent);
#         a dict = per-colour override, others use their own photo (kids grey is a different shot)
#   box: print area in cm (kids get A4 landscape, A3 is wider than a kids chest)   flag: sleeve flag width cm
# Kids blanks (kd-*.jpg) are Cloke T102 photos rescaled so the body is the same size in each (~size 8).
GARMENTS = {
    "boxfit": dict(files={"black": "uc-PB.png", "royal": "uc-RO.png", "grey": "uc-HG.png", "white": "uc-WH.png"},
                   mask="uc-PB.png", px_cm=933 / 60, cx=794, top=430, sleeve=(1488, 422, 63.4)),
    "adult":  dict(files={"black": "cl-black.jpg", "royal": "cl-royal.jpg", "grey": "cl-grey.jpg", "white": "cl-white.jpg"},
                   mask="cl-black.jpg", px_cm=901 / 54, cx=1023, top=500, sleeve=(1782, 667, 40.0)),
    "kids":   dict(files={"black": "kd-black.jpg", "royal": "kd-royal.jpg", "grey": "kd-grey.jpg", "white": "kd-white.jpg"},
                   mask={"white": "kd-black.jpg"}, px_cm=698 / 41, cx=792, top=455, sleeve=(1387, 450, 59.0),
                   box=(29.7, 21.0), flag=7.0),
}


def art_flag_colours(art):
    """Red and blue of the flag in the artwork, so the sleeve flag prints in the same inks."""
    from collections import Counter
    is_red = lambda p: p[3] > 250 and p[0] > 150 and p[1] < 60 and p[2] < 80
    is_blue = lambda p: p[3] > 250 and p[2] > 120 and p[0] < 60 and p[1] < 90
    px, (W, H) = art.load(), art.size
    reds, blues = Counter(), Counter()
    # Only count red/blue that touch each other (the canton edge), not the swoosh or the 685 fill.
    for y in range(0, H - 3):
        for x in range(0, W - 3):
            p = px[x, y]
            for q in (px[x + 3, y], px[x, y + 3]):
                if is_blue(p) and is_red(q) or is_red(p) and is_blue(q):
                    (blues if is_blue(p) else reds)[p[:3]] += 1
                    (blues if is_blue(q) else reds)[q[:3]] += 1
    return (reds.most_common(1)[0][0] if reds else (206, 17, 38),
            blues.most_common(1)[0][0] if blues else (0, 43, 127))


def samoa_flag(w, red=(206, 17, 38), blue=(0, 43, 127)):
    """Samoa flag (1:2) as RGBA: red field, blue canton, Southern Cross in white."""
    s = 4  # supersample
    W, H = w * s, w * s // 2
    im = Image.new("RGBA", (W, H), red + (255,))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W // 2, H // 2], fill=blue + (255,))

    def star(cx, cy, r):
        pts = []
        for i in range(10):
            a = -math.pi / 2 + i * math.pi / 5
            rr = r if i % 2 == 0 else r * 0.4
            pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
        d.polygon(pts, fill="white")

    cw, ch = W / 2, H / 2
    for x, y, r in [(.50, .20, .085), (.30, .45, .085), (.68, .40, .085), (.50, .80, .085), (.57, .58, .05)]:
        star(cw * x, ch * y, ch * r * 1.2)
    return im.resize((w, w // 2), Image.LANCZOS)


def silhouette(fname):
    """Garment mask: alpha for the PNGs, non-white pixels for the Cloke JPGs."""
    im = Image.open(BLANKS / fname)
    if im.mode == "RGBA":
        m = im.getchannel("A").point(lambda a: 255 if a > 128 else 0)
    else:
        m = im.convert("L").point(lambda v: 255 if v < 235 else 0)
        m = m.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))  # close tiny holes
    return m.filter(ImageFilter.GaussianBlur(1.2))


def printed(layer, blank_crop):
    """Make ink sit in the fabric: pick up the garment's light/shadow texture."""
    lum = blank_crop.convert("L").filter(ImageFilter.GaussianBlur(1))
    lo, hi = lum.getextrema()
    lum = lum.point(lambda v: int(205 + 50 * (v - lo) / max(1, hi - lo)))
    rgb = ImageChops.multiply(layer.convert("RGB"), Image.merge("RGB", (lum, lum, lum)))
    out = rgb.convert("RGBA")
    out.putalpha(layer.getchannel("A").point(lambda a: int(a * 0.96)))
    return out


def place(base, layer, x, y, clip=None):
    crop = base.crop((x, y, x + layer.width, y + layer.height))
    ink = printed(layer, crop)
    if clip is not None:
        ink.putalpha(ImageChops.multiply(ink.getchannel("A"), clip.crop((x, y, x + layer.width, y + layer.height))))
    base.alpha_composite(ink, (x, y))


def fit_a3(art, k, box=(A3_W_CM, A3_H_CM)):
    scale = min(box[0] * k / art.width, box[1] * k / art.height)
    return art.resize((round(art.width * scale), round(art.height * scale)), Image.LANCZOS)


def main(art_path, light_art_path=None):
    def load(p):
        a = Image.open(p).convert("RGBA")
        return a.crop(a.getchannel("A").getbbox())
    art = load(art_path)
    light_art = load(light_art_path) if light_art_path else art
    red, blue = art_flag_colours(art)
    print("flag inks from artwork: red #%02X%02X%02X, blue #%02X%02X%02X" % (red + blue))

    for g, cfg in GARMENTS.items():
        k = cfg["px_cm"]
        box = cfg.get("box", (A3_W_CM, A3_H_CM))
        dark_print, light_print = fit_a3(art, k, box), fit_a3(light_art, k, box)
        flag = samoa_flag(round(cfg.get("flag", FLAG_W_CM) * k), red, blue).rotate(
            cfg["sleeve"][2], expand=True, resample=Image.BICUBIC)

        for colour, fname in cfg["files"].items():
            m = cfg["mask"]
            mask = silhouette(m.get(colour, fname) if isinstance(m, dict) else m)
            shadow = mask.filter(ImageFilter.GaussianBlur(22)).point(lambda a: int(a * 0.22))
            src = Image.open(BLANKS / fname).convert("RGBA")
            base = Image.new("RGBA", src.size, BG + (255,))
            soft = Image.new("RGBA", src.size, (60, 50, 40, 0))
            soft.putalpha(shadow)
            base.alpha_composite(soft, (0, 14))
            tee = src.copy()
            tee.putalpha(mask)
            base.alpha_composite(tee)

            a = light_print if colour == "white" or (g, colour) in LIGHT_EXTRA else dark_print
            place(base, a, round(cfg["cx"] - a.width / 2), cfg["top"])
            sx, sy, _ = cfg["sleeve"]
            place(base, flag, round(sx - flag.width / 2), round(sy - flag.height / 2), clip=mask)

            out = OUT / f"{g}-{colour}.jpg"
            base.convert("RGB").resize((SIZE, SIZE), Image.LANCZOS).save(out, quality=84, optimize=True)
            print("wrote", out.name, f"(print {a.width / k:.1f} x {a.height / k:.1f} cm)")


if __name__ == "__main__":
    if len(sys.argv) not in (2, 3):
        sys.exit(__doc__)
    main(*sys.argv[1:])
