# Project Rules — Backoffice

## Branch Strategy

### Main branches

| Branch | Purpose |
|--------|---------|
| `main` | Production code. Never receives direct commits. |
| `develop` | Continuous integration. Base for all features. |

### Branch naming

All new work must be done on a dedicated branch, created from `develop` (or from `main` for hotfixes). Use the pattern:

```
<type>/<0000>/<short-description>
```

Where `<0000>` is the sequential issue/ticket number for versioning control.

**Valid types:**

| Type | When to use |
|------|-------------|
| `feat/` | New feature |
| `fix/` | Bug fix |
| `hotfix/` | Urgent production fix (created from `main`) |
| `refactor/` | Refactoring without behavior change |
| `chore/` | Maintenance tasks (deps, configs, CI) |
| `docs/` | Documentation |
| `test/` | Test coverage |

**Examples:**

```
feat/0001/withdrawal-approval-flow
fix/0002/transaction-status-update
hotfix/0003/pix-key-validation
refactor/0004/financial-service
chore/0005/update-prisma
docs/0006/api-endpoints
```

### Merge rules

1. **No direct commits to `main` or `develop`** — always via Pull Request.
2. **PR to `develop`** — requires at least 1 approval before merge.
3. **PR to `main`** — requires at least 1 approval + branch up to date with `develop`.
4. **Hotfix** — created from `main`, merged into `main` **and** `develop` after approval.
5. **Delete the branch** after merge to keep the repository clean.

### Standard flow

```
develop
  └── feat/0001/my-feature
        └── (work) → PR → review → merge into develop
              └── (accumulated) → PR → review → merge into main → deploy
```

```
main
  └── hotfix/0003/my-fix
        └── (fix) → PR → merge into main → deploy
              └── (backport) → PR → merge into develop
```

---

## Commits

Follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:

```
<type>(<optional scope>): <short description>
```

**Types:** `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`

**Examples:**
```
feat(withdrawals): add approval workflow
fix(financial): resolve running balance calculation
chore(deps): upgrade prisma to 6.19.2
```
