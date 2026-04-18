# Proposed workflows

This folder holds CI workflow files that were prepared but could not be pushed
directly because the OAuth token used by the agent that created this branch
does not carry the `workflow` scope.

To activate a workflow:

```bash
mkdir -p .github/workflows
git mv .github/workflows-proposed/<name>.yml .github/workflows/<name>.yml
```

Then push with a token that has the `workflow` scope (or move the file via the
GitHub web UI, which handles the scope for you).

## Files

- `ci.yml` — Runs `npm ci`, `npm run typecheck`, `npm test`, `npm run build`
  on every push to `main` and every PR. Typecheck is currently
  `continue-on-error: true` because the codebase has pre-existing type
  errors; tests and build are hard gates.
