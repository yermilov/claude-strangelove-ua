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

ITALICS. The same patch runs on the italic masters, where two of the moves
above would lean the wrong way: mirroring Э flips a 10° right slant into a
10° LEFT slant, and an upright rectangle reads as a kink on a slanted Г. So
every geometric step reads the slant off `post.italicAngle` and re-shears —
the mirror becomes `x' = -x + 2·tan(a)·y + dx`, the upstroke a parallelogram,
and the stem is measured across the slanted `I` rather than its bbox. With
an angle of 0 all three reduce to the upright formulas exactly.

USAGE
-----
    python3 scripts/patch-jost-ukrainian.py <jost-ttf-dir> <out-dir>

Writes `jost-ua-<weight>.woff2` and `jost-ua-<weight>-italic.woff2` (+ .woff
fallbacks) for the weights and styles the deck uses. Re-run only if the upstream font is upgraded; the built files are
committed, so a normal `bun install` needs nothing from here.
"""

import math
import sys
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.pens.ttGlyphPen import TTGlyphPen

# (weight, output suffix) -> upstream file stem. Italic only where the deck
# sets <em>: body (400) and the red "now" step (600).
WEIGHTS = {
    (400, ""): "Jost-400-Book",
    (600, ""): "Jost-600-Semi",
    (800, ""): "Jost-800-Heavy",
    (400, "-italic"): "Jost-400-BookItalic",
    (600, "-italic"): "Jost-600-SemiItalic",
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


def slant(font: TTFont) -> float:
    """Horizontal run per unit of height: 0 upright, ~0.18 for Jost italic."""
    return -math.tan(math.radians(font["post"].italicAngle))


def stem_width(font: TTFont) -> int:
    """Stem thickness, measured from `I` (a bare bar in Jost).

    On an italic the bbox also spans the slant, so take that back out."""
    i = font["glyf"]["I"]
    return round(i.xMax - i.xMin - (i.yMax - i.yMin) * slant(font))


def add_composite(font: TTFont, name: str, donor: str, mirrored: bool) -> None:
    glyf, hmtx = font["glyf"], font["hmtx"]
    pen = TTGlyphPen(glyf)
    donor_glyph = glyf[donor]
    if mirrored:
        # scale(-1, 1) about the glyph's own (slanted) axis, then re-shear by
        # twice the slant so an italic still leans right: x' = -x + 2t·y + dx
        t = slant(font)
        dx = donor_glyph.xMin + donor_glyph.xMax - t * (donor_glyph.yMin + donor_glyph.yMax)
        pen.addComponent(donor, (-1, 0, 2 * t, 1, round(dx), 0))
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
    # On an italic the upstroke leans with the letter: a parallelogram.
    lean = round(rise * slant(font))
    pen.moveTo((x_right - stem, y_top))
    pen.lineTo((x_right, y_top))
    pen.lineTo((x_right + lean, y_top + rise))
    pen.lineTo((x_right - stem + lean, y_top + rise))
    pen.closePath()

    glyf[name] = pen.glyph()
    hmtx[name] = hmtx[donor]


def patch(src: Path, out_dir: Path, weight: int, suffix: str) -> None:
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
        font.save(out_dir / f"jost-ua-{weight}{suffix}.{fmt}")
    print(f"  {weight}{suffix}: wrote jost-ua-{weight}{suffix}.woff2 / .woff")


def main() -> int:
    if len(sys.argv) != 3:
        print(__doc__)
        return 2
    ttf_dir, out_dir = Path(sys.argv[1]), Path(sys.argv[2])
    for (weight, suffix), stem in WEIGHTS.items():
        patch(ttf_dir / f"{stem}.ttf", out_dir, weight, suffix)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
