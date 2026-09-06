#!/usr/bin/env bash
#
# Bootstrap for Bounded-Graph-Access.
#
# This file is not the package. It parks a sparse clone of the canonical repo
# at a stable path and hands off to that clone's own install.sh, because the
# installer points the shims at whatever directory it was run from and a
# hand-made copy has no way to tell you it has fallen behind.
#
#   ./bootstrap.sh            install (or adopt and update an existing clone)
#   ./bootstrap.sh --check    report whether the live install is current
#
# Run from Git Bash: the downstream installer needs cygpath and PowerShell.

set -euo pipefail

REPO_URL="https://github.com/Ethan23p/extending-logseq-ethan.git"
SUBDIR="Bounded-Graph-Access"
BRANCH="main"
DEFAULT_DEST="$HOME/bounded-graph-access"

if [[ -t 1 ]] && command -v tput >/dev/null 2>&1 && [[ "$(tput colors 2>/dev/null || echo 0)" -ge 8 ]]; then
  BOLD=$(tput bold); DIM=$(tput dim); RESET=$(tput sgr0)
  BLUE=$(tput setaf 4); GREEN=$(tput setaf 2); YELLOW=$(tput setaf 3); RED=$(tput setaf 1)
else
  BOLD=""; DIM=""; RESET=""; BLUE=""; GREEN=""; YELLOW=""; RED=""
fi

say()  { printf '  %s\n' "$1"; }
note() { printf '  %s%s%s\n' "$DIM" "$1" "$RESET"; }
ok()   { printf '  %s✓%s %s\n' "$GREEN" "$RESET" "$1"; }
warn() { printf '  %s⚠ %s%s\n' "$YELLOW" "$1" "$RESET"; }
die()  { printf '\n  %s✗ %s%s\n\n' "$RED" "$1" "$RESET" >&2; exit 1; }
head2() { printf '\n%s%s▸ %s%s\n' "$BOLD" "$BLUE" "$1" "$RESET"; }

confirm() {
  local reply=""
  printf '  %s? %s%s [Y/n] ' "$YELLOW" "$1" "$RESET"
  read -r reply || true
  [[ -z "$reply" || "$reply" =~ ^[Yy] ]]
}

# live_install_dir echoes the Bounded-Graph-Access directory the installed shim
# actually points at. The shim is the only authority on what is live; asking it
# beats guessing at a path.
live_install_dir() {
  local shim="$HOME/bin/logseq" line
  [[ -f "$shim" ]] || return 1
  line=$(grep -m1 -E '^exec node ' "$shim" 2>/dev/null) || return 1
  line=${line#exec node \"}
  line=${line%%\"*}
  [[ "$line" == */src/main.js ]] || return 1
  printf '%s' "${line%/src/main.js}"
}

# report_freshness DIR compares a checkout against its remote and says whether
# the machine is running current code. `git status` cannot answer this: a clone
# parked on a stale branch reports "up to date" with that branch and looks fine.
report_freshness() {
  local dir="$1" branch behind
  git -C "$dir" rev-parse --git-dir >/dev/null 2>&1 || { warn "not a git checkout: $dir"; return 1; }

  branch=$(git -C "$dir" rev-parse --abbrev-ref HEAD)
  say "checkout: $dir"
  say "branch:   $branch"

  if [[ "$branch" != "$BRANCH" ]]; then
    warn "on '$branch', not '$BRANCH' — this is the silent-staleness trap."
    note "git status will call this 'up to date' with its own branch and look healthy."
  fi

  git -C "$dir" fetch -q origin "$BRANCH" || { warn "could not reach origin; freshness unknown"; return 1; }
  behind=$(git -C "$dir" rev-list --count "HEAD..origin/$BRANCH")

  if [[ "$behind" == "0" ]]; then
    ok "current with origin/$BRANCH"
    return 0
  fi
  warn "$behind commit(s) behind origin/$BRANCH — the machine is running old code"
  return 1
}

run_tests() {
  local pkg="$1"
  command -v node >/dev/null 2>&1 || { warn "node not found; skipping tests"; return 0; }
  ( cd "$pkg" && node --test test/boundary.test.js test/guard.test.js >/dev/null 2>&1 ) \
    && ok "test suite passes (offline, no graph needed)" \
    || warn "tests did not pass in $pkg — install anyway at your own risk"
}

# ── --check ───────────────────────────────────────────────────────────────
if [[ "${1:-}" == "--check" ]]; then
  head2 "Bounded-Graph-Access · live install check"
  pkg=$(live_install_dir) || die "no Bounded-Graph-Access shim found at ~/bin/logseq. Nothing installed?"
  say "shim points at: $pkg"
  root=$(dirname "$pkg")
  echo
  if report_freshness "$root"; then
    echo; ok "live install is current."; echo
    exit 0
  fi
  echo
  say "Bring it up to date with:"
  note "  git -C \"$root\" checkout $BRANCH && git -C \"$root\" pull --ff-only"
  note "  (nothing to reinstall — the shims point into this clone)"
  echo
  exit 1
fi

[[ "${1:-}" == "" ]] || die "unknown argument: $1 (expected nothing, or --check)"

# ── install ───────────────────────────────────────────────────────────────
# Every prompt below defaults to yes on a bare Enter, which at EOF would mean a
# piped or unattended run silently consenting to all of it. This path is a
# wizard; require a human. (--check is non-interactive and exits above.)
[[ -t 0 ]] || die "bootstrap.sh is interactive — run it from a terminal, or use --check."

head2 "Bounded-Graph-Access · bootstrap"
say "Parks a sparse clone at a stable path, then runs the package's own"
say "installer from it. Upgrading afterwards is 'git pull' and nothing else."

head2 "Preflight"
command -v git >/dev/null 2>&1 || die "git is required."
ok "git $(git --version | awk '{print $3}')"

if command -v node >/dev/null 2>&1; then
  major=$(node -p 'process.versions.node.split(".")[0]')
  [[ "$major" -ge 18 ]] || die "Node 18+ required, found $(node -v)."
  ok "node $(node -v)"
else
  die "Node 18+ is required."
fi

command -v cygpath >/dev/null 2>&1 \
  && ok "cygpath present (Git Bash)" \
  || warn "cygpath missing — the downstream installer expects Git Bash on Windows."

if existing=$(live_install_dir 2>/dev/null); then
  note "an install already appears live at: $existing"
fi

head2 "Where should the clone live?"
say "This path is permanent: the shims will point inside it forever, and"
say "upgrades happen by pulling here. Do not use a scratch directory."
printf '  %spath [%s]:%s ' "$DIM" "$DEFAULT_DEST" "$RESET"
read -r DEST || true
DEST="${DEST:-$DEFAULT_DEST}"
DEST="${DEST%/}"
PKG="$DEST/$SUBDIR"

head2 "Clone"
if [[ -e "$DEST/.git" ]]; then
  say "a checkout already exists at $DEST — adopting it rather than re-cloning."
  report_freshness "$DEST" || {
    if confirm "Update it to origin/$BRANCH now?"; then
      git -C "$DEST" checkout "$BRANCH"
      git -C "$DEST" pull --ff-only
      ok "updated"
    fi
  }
elif [[ -e "$DEST" ]]; then
  die "$DEST exists and is not a git checkout. Move it aside and re-run."
else
  say "sparse-cloning $SUBDIR/ only, without blobs for the rest of the repo"
  confirm "Clone into $DEST?" || die "aborted."
  git clone --filter=blob:none --no-checkout --branch "$BRANCH" "$REPO_URL" "$DEST"
  # `set --no-cone` in one call: `init --no-cone` is rejected by git 2.51+.
  git -C "$DEST" sparse-checkout set --no-cone "$SUBDIR/*"
  git -C "$DEST" checkout "$BRANCH"
  ok "cloned to $DEST"
fi

[[ -d "$PKG" ]] || die "expected $PKG after checkout, but it is missing."
[[ -f "$PKG/install.sh" ]] || die "no install.sh in $PKG — repo layout changed?"

head2 "Verify the checkout"
run_tests "$PKG"

head2 "Hand off to the package installer"
say "The rest is the package's own seven-stage wizard: it configures what is"
say "visible, backs up your current shim, installs the entry points, fixes the"
say "Windows PATH order, verifies, and offers the PreToolUse bypass guard."
note "It points the shims at $PKG — the path you chose above."
echo
confirm "Run $PKG/install.sh now?" || {
  echo
  say "Skipped. Run it yourself whenever you like:"
  note "  cd \"$PKG\" && bash install.sh"
  echo
  exit 0
}

# Via `bash`, not `./`: install.sh is mode 644 in the repo, so a checkout that
# honours file modes would refuse to execute it directly.
cd "$PKG"
exec bash install.sh
