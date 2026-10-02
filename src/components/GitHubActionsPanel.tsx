/* The GitHub Actions page beside «рецепт 3»'s terminal, as live DOM rather than
 * part of the video, so it can take whatever width the slide leaves (Yarik,
 * 02.10.2026). It follows the terminal video's clock: `frame` is that video's
 * current frame, and the run events are the frames of the AliasGuard
 * composition (video/src/AliasGuard.tsx, RUN_FRAMES) — the first push fails on
 * the two relative imports, the second goes green. Its look copies the panel
 * that composition used to draw: GitHub's own dark palette, kept as is — it is
 * a screenshot of a real UI, like the deck's other screenshots. */

export const RUN_FRAMES = { run1: 627, run1Done: 707, run2: 892, run2Done: 962 };

const SCRIPT = 'bun scripts/check-imports.ts';
const FAIL = [
  "✗ budget/BudgetChart.tsx:2  '../../lib/money'",
  "✗ budget/BudgetChart.tsx:3  '../../components/ui/card'",
  'Error: Process completed with exit code 1.',
];
const OK = 'import check OK — 214 files, 0 relative imports';

type RunState = 'running' | 'fail' | 'ok';

// the run's title alone — GitHub's «lint #N: pushed by …» line under it is
// left out to give the page larger type on the slide
function RunRow({ title, state, log }: { title: string; state: RunState; log: { text: string; ok?: boolean }[] }) {
  return (
    <div className="gh-actions__run">
      <div className="gh-actions__run-head">
        <span className={`gh-actions__status gh-actions__status--${state}`} aria-label={state}>
          {state === 'ok' ? '✓' : state === 'fail' ? '✕' : ''}
        </span>
        <div className="gh-actions__run-title">{title}</div>
      </div>
      {log.length > 0 && (
        <div className="gh-actions__log">
          <div className="gh-actions__log-head">▾ Run {SCRIPT}</div>
          {log.map((l, i) => (
            <div key={i} className={l.ok ? 'gh-actions__log-ok' : 'gh-actions__log-fail'}>
              {l.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function GitHubActionsPanel({ frame }: { frame: number }) {
  const at = (f: number) => frame >= f;
  const runs = at(RUN_FRAMES.run2) ? 2 : at(RUN_FRAMES.run1) ? 1 : 0;
  return (
    <div className="gh-actions" aria-label="GitHub Actions: workflow lint">
      <div className="gh-actions__header">
        <div className="gh-actions__repo">
          <span className="gh-actions__muted">yermilov /</span> <b>money-app</b>
        </div>
        <div className="gh-actions__tabs">
          <span>Code</span>
          <span>Pull requests</span>
          <span className="gh-actions__tab--on">Actions</span>
          <span>Settings</span>
        </div>
      </div>
      <div className="gh-actions__workflow">
        lint <span className="gh-actions__file">.github/workflows/lint.yml · on: push</span>
      </div>
      <div className="gh-actions__runs">
        {runs === 0 && <div className="gh-actions__empty">This workflow has no runs yet.</div>}
        {at(RUN_FRAMES.run2) && (
          <RunRow
            title="BudgetChart: imports via @/"
            state={at(RUN_FRAMES.run2Done) ? 'ok' : 'running'}
            log={at(RUN_FRAMES.run2Done) ? [{ text: OK, ok: true }] : []}
          />
        )}
        {at(RUN_FRAMES.run1) && (
          <RunRow
            title="Add the import check to GitHub Actions"
            state={at(RUN_FRAMES.run1Done) ? 'fail' : 'running'}
            log={at(RUN_FRAMES.run1Done) && !at(RUN_FRAMES.run2Done) ? FAIL.map((text) => ({ text })) : []}
          />
        )}
      </div>
    </div>
  );
}
