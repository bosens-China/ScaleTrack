---
name: file-line-audit
description: Audit oversized source files in a repository. Apply repository .gitignore rules plus extra exclude patterns, filter candidate files with include glob patterns, count physical lines, and output only files at or above the threshold. Use this skill when the user asks to find long files, review file-length distribution, identify split/refactor candidates, or analyze technical debt.
license: MIT
compatibility: Requires a bundled binary from scripts/ matching the host OS and CPU architecture. Current packaged targets are Windows amd64, Linux amd64, Linux arm64, macOS amd64, and macOS arm64.
allowed-tools: run_shell_command
metadata:
  author: github.com/bosens-China
  version: '0.3.0'
---

# File Line Audit

Use this skill to audit file line counts in a project and return only files that exceed a configured threshold.

When using this skill:

- Run the packaged binary from `scripts/` that matches the current OS and CPU architecture.
- Always run from the target repository root so `.gitignore` is resolved correctly.
- Inspect the repository layout and language stack before running the audit.
- Pass scan parameters explicitly on the command line; there is no default config file.
- Respect repository `.gitignore` rules first, then apply any extra `exclude` patterns on top.
- Use one or more `include` glob patterns to limit scan scope.
- Output only the files whose physical line count is greater than or equal to the configured threshold.

## Installation

```bash
npx skills add bosens-China/file-line-audit
```

## Binary Selection

Choose the packaged executable under `scripts/`:

- Windows amd64: `scripts/line-audit-windows-amd64.exe`
- Linux amd64: `scripts/line-audit-linux-amd64`
- Linux arm64: `scripts/line-audit-linux-arm64`
- macOS amd64: `scripts/line-audit-darwin-amd64`
- macOS arm64: `scripts/line-audit-darwin-arm64`

## Steps

1. Confirm you are in the repository root.
2. Inspect the repository to decide what to scan:
   - Identify source roots such as `src`, `app`, `apps`, `pkg`, `packages`, `lib`, `internal`, `cmd`, `backend`, `frontend`, `client`, `server`, `service`, `services`, `api`, or `web`.
   - Identify relevant source extensions for the project, such as `js`, `ts`, `tsx`, `vue`, `py`, `go`, `rs`, `java`, `kt`, `rb`, `php`, `cs`, or `swift`.
   - Add extra `exclude` patterns only when `.gitignore` is not enough, for example `dist/`, `build/`, `coverage/`, or generated folders.
3. Select the correct binary from `scripts/` for the current platform.
4. On Linux/macOS, ensure the binary is executable: `chmod +x <binary_path>`.
5. Run the binary with explicit `--include`, optional `--exclude`, and optional `--threshold`.
6. Return only the over-threshold file list to the user.

## Commands

### Run with explicit include patterns

On Unix-like systems:

```bash
chmod +x .agents/skills/file-line-audit/scripts/line-audit-<target>
.agents/skills/file-line-audit/scripts/line-audit-<target> \
  --threshold 400 \
  --include "src/**/*.{ts,tsx,js,jsx,vue}" \
  --include "apps/**/*.{ts,tsx,js,jsx,vue}" \
  --exclude "dist/" \
  --exclude "build/"
```

On Windows:

```powershell
& .\.agents\skills\file-line-audit\scripts\line-audit-windows-amd64.exe `
  --threshold 400 `
  --include "src/**/*.{ts,tsx,js,jsx,vue}" `
  --include "apps/**/*.{ts,tsx,js,jsx,vue}" `
  --exclude "dist/" `
  --exclude "build/"
```

### Run with inline JSON

When passing a full parameter object is easier, use `--json`:

```bash
.agents/skills/file-line-audit/scripts/line-audit-<target> --json '{
  "threshold": 400,
  "include": [
    "src/**/*.{ts,tsx,js,jsx,vue}",
    "apps/**/*.{ts,tsx,js,jsx,vue}"
  ],
  "exclude": [
    "dist/",
    "build/"
  ]
}'
```

## Parameters

- `--include` / `-i`: required glob pattern; repeat for multiple roots or extensions
- `--exclude` / `-e`: optional extra ignore rule in `.gitignore` syntax; repeat as needed
- `--threshold` / `-t`: minimum line count to report, default `400`
- `--json` / `-j`: optional JSON object with `threshold`, `include`, and `exclude`
- `--help` / `-h`: show CLI help

## Output Format

Return the tool output directly. The expected format is:

```text
# File Line Audit

## Files Over Threshold (>= 400 lines)

- src/example.ts 512
- apps/web/pages/home.tsx 438
```

## Limitations

- **Physical Lines Only**: The tool counts raw newlines and does not distinguish between code, comments, or blank lines.
- **Binary Files**: Automatically skipped.
- **Git Context**: Relies on `git` being available in the environment to resolve `.gitignore` rules effectively.
- **Performance**: Optimized for source code; avoid running on directories containing large data files or build artifacts not covered by `.gitignore`.

## Notes

- Repository `.gitignore` is always active even if you do not pass extra exclude patterns.
- Nested `.gitignore` files are respected.
- At least one `--include` pattern is required for every run.
