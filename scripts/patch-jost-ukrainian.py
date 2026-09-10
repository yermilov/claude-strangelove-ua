#!/usr/bin/env python3
"""Add the eight missing Ukrainian glyphs to Jost and emit web fonts.

WHY THIS EXISTS
---------------
Jost* ships a Cyrillic set that is Russian-only. Its `unicode-range` in both
Google Fonts and @fontsource *declares* `U+0400-045F, U+0490-0491`, but the
font file itself contains only 76 of those code points — every
Ukrainian-specific letter is absent:

    І U+0406   і U+0456   Ї U+0407   ї U+0457
    Є U+0404   є U+0454   Ґ U+0490   ґ U+0491

Verified against three independent sources on 10.09.2026, all identical:
Google Fonts v20 (the live gstatic woff2), @fontsource/jost 5.3.0, and the
designer's own release (indestructible-type/Jost, tag 3.5 and master). A
positive control on the same cmap finds 32/32 Russian letters, so this is a
real gap in the typeface and not a decoding artefact.

Left unpatched, a browser falls back per glyph — and since і/ї/є occur in
almost every Ukrainian sentence, the deck would render most words in two
different typefaces.

WHAT IT DOES
------------
Six of the eight glyphs already exist in Jost under other code points, so they
are built as TrueType *composites* — zero new drawing, exact same curves:

    І ← I            і ← i
    Ї ← Idieresis    ї ← idieresis
    Є ← Э mirrored   є ← э mirrored

Only Ґ/ґ need new geometry: Г/г plus the upstroke at the right end of the arm.
The upstroke is a rectangle whose width is measured from the font's own stem
(the `I` glyph's bounding box), so it stays correct across weights.

USAGE
-----
    python3 scripts/patch-jost-ukrainian.py <jost-ttf-dir> <out-dir>

Writes `jost-ua-<weight>.woff2` (+ .woff fallback) for the weights the deck
uses. Re-run only if the upstream font is upgraded; the built files are
committed, so a normal `bun install` needs nothing from here.
"""

import sys
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.pens.ttGlyphPen import TTGlyphPen

# weight -> upstream file stem
WEIGHTS = {
    400: "Jost-400-Book",
    600: "Jost-600-Semi",
    800: "Jost-800-Heavy",
}

# Ukrainian glyph -> (new glyph name, donor glyph name, mirrored?)
COMPOSITES = {
    0x0406: ("uni0406", "I", False),
    0x0456: ("uni0456", "i", False),
    0x0407: ("uni0407", "Idieresis", False),
    0x0457: ("uni0457", "idieresis", False),
    0x0404: ("uni0404", "uni042D", True),
    0x0454: ("uni0454", "uni044D", True),
}

# Ukrainian ghe-with-upturn -> donor
UPTURN = {
    0x0490: ("uni0490", "uni0413"),
    0x0491: ("uni0491", "uni0433"),
}


def stem_width(font: TTFont) -> int:
    """Vertical stem thickness, measured from `I` (a bare bar in Jost)."""
    glyf = font["glyf"]
    i = glyf["I"]
    return i.xMax - i.xMin


def add_composite(font: TTFont, name: str, donor: str, mirrored: bool) -> None:
    glyf, hmtx = font["glyf"], font["hmtx"]
    pen = TTGlyphPen(glyf)
    donor_glyph = glyf[donor]
    if mirrored:
        # scale(-1, 1) about the glyph's own bbox, then shift back into place
        dx = donor_glyph.xMin + donor_glyph.xMax
        pen.addComponent(donor, (-1, 0, 0, 1, dx, 0))
    else:
        pen.addComponent(donor, (1, 0, 0, 1, 0, 0))
    glyf[name] = pen.glyph()
    hmtx[name] = hmtx[donor]


def add_upturn(font: TTFont, name: str, donor: str) -> None:
    """Г/г + the vertical upstroke that makes it Ґ/ґ.

    The donor is decomposed rather than referenced, because a TrueType glyph
    may hold components or contours but not both.
    """
    glyf, hmtx = font["glyf"], font["hmtx"]
    donor_glyph = glyf[donor]
    stem = stem_width(font)
    # The arm's right end and top, taken from the donor's own bbox.
    x_right, y_top = donor_glyph.xMax, donor_glyph.yMax
    # Upstroke rises above the arm by roughly a quarter of the letter's height.
    rise = round((y_top - donor_glyph.yMin) * 0.26)

    pen = TTGlyphPen(glyf)
    donor_glyph.draw(pen, glyf)
    pen.moveTo((x_right - stem, y_top))
    pen.lineTo((x_right, y_top))
    pen.lineTo((x_right, y_top + rise))
    pen.lineTo((x_right - stem, y_top + rise))
    pen.closePath()

    glyf[name] = pen.glyph()
    hmtx[name] = hmtx[donor]


def patch(src: Path, out_dir: Path, weight: int) -> None:
    font = TTFont(src)
    cmap_tables = [t for t in font["cmap"].tables if t.isUnicode()]

    for code, (name, donor, mirrored) in COMPOSITES.items():
        add_composite(font, name, donor, mirrored)
        for t in cmap_tables:
            t.cmap[code] = name

    for code, (name, donor) in UPTURN.items():
        add_upturn(font, name, donor)
        for t in cmap_tables:
            t.cmap[code] = name

    # No glyph-order bookkeeping here on purpose: `glyf.__setitem__` appends
    # unknown names itself, and its `glyphOrder` is the same list object the
    # font hands back from `getGlyphOrder()`. Appending again would desync the
    # two and `maxp` recalculation would assert on the length mismatch.

    # Rename so a stray system copy of real Jost can never win the cascade.
    for record in font["name"].names:
        if record.nameID in (1, 3, 4, 6, 16):
            value = record.toUnicode().replace("Jost", "Jost UA")
            record.string = value.encode(record.getEncoding())

    out_dir.mkdir(parents=True, exist_ok=True)
    for fmt in ("woff2", "woff"):
        font.flavor = fmt
        font.save(out_dir / f"jost-ua-{weight}.{fmt}")
    print(f"  {weight}: wrote jost-ua-{weight}.woff2 / .woff")


def main() -> int:
    if len(sys.argv) != 3:
        print(__doc__)
        return 2
    ttf_dir, out_dir = Path(sys.argv[1]), Path(sys.argv[2])
    for weight, stem in WEIGHTS.items():
        patch(ttf_dir / f"{stem}.ttf", out_dir, weight)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
