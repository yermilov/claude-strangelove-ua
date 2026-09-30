#!/usr/bin/env python3
"""Regenerate video/src/claude-md-steps.json — the VS Code views of «рецепт 2».

Walks juggernaut's CLAUDE.md history and, for the commit that first added each
picked rule, keeps a 22-line window of the REAL file at that commit, which of
those lines the commit added, and the file's line and bold-rule counts.

    python3 video/scripts/claude-md-steps.py ~/src/juggernaut
"""
import json, re, subprocess, sys
from pathlib import Path

REPO = sys.argv[1] if len(sys.argv) > 1 else str(Path.home() / 'src/juggernaut')
OUT = Path(__file__).resolve().parent.parent / 'src' / 'claude-md-steps.json'
RULE = re.compile(r'^\s*[-*] \*\*(.+?)\*\*', re.M)
PICKS = ['PowerSync client isolation', 'Agent permission model', 'Three schemas stay in lockstep',
         'Deployed ≠ callable', 'Calendar days/months are Kyiv-local', '`design-workflows@juggernaut`',
         'Never use `\\b`', 'Every synced table the client WRITES', 'Prefer the Drizzle query builder',
         'PGlite runs every query', 'A column on a `SELECT *` synced table', 'Reading a repo lock',
         'The Clerk SDK gives up', 'A zod/JS `.length` cap', 'A KEYSET CURSOR', 'Never compare a SYNCED timestamp']


def git(*a):
    return subprocess.run(['git', '-C', REPO, *a], capture_output=True, text=True, check=True).stdout


def lines_at(h):
    t = git('show', f'{h}:CLAUDE.md').split('\n')
    return t[:-1] if t and t[-1] == '' else t


def view(h, anchor, label, before=False):
    txt = lines_at(h)
    added = set()
    if not before:
        for m in re.finditer(r'^@@ -\S+ \+(\d+)(?:,(\d+))? @@', git('diff', '-U0', f'{h}^', h, '--', 'CLAUDE.md'), re.M):
            s, c = int(m.group(1)), int(m.group(2) or 1)
            added.update(range(s, s + c))
    idx = 0 if before else next(i for i, l in enumerate(txt) if re.search(anchor, l))
    start = max(0, idx - 3)
    return {'h': h[:8], 'date': git('show', '-s', '--format=%ad', '--date=short', h).strip(),
            'total': len(txt), 'rules': len(RULE.findall('\n'.join(txt))), 'label': label,
            'lines': [{'n': i + 1, 't': txt[i], 'add': (i + 1) in added} for i in range(start, min(len(txt), start + 22))]}


first = {}
for h in git('log', '--reverse', '--format=%H', '--', 'CLAUDE.md').split():
    for r in RULE.findall('\n'.join(lines_at(h))):
        first.setdefault(r, h)

steps = [view(git('rev-parse', 'bd712975').strip(), r'^## UI design rule', 'UI design rule (hard)')]
for p in PICKS:
    name = next(k for k in first if k.startswith(p))
    steps.append(view(first[name], re.escape('**' + name + '**'), name))
out = {'before': view(git('rev-parse', 'bd712975^').strip(), None, 'before', before=True), 'steps': steps}
OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1))
print(f'{len(steps)} steps → {OUT}')
