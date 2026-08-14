import fs from 'fs';
import path from 'path';

export interface SyncSummary {
  added: number;
  updated: number;
  stale: number;
  skipped: boolean;
  reason?: string;
}

export interface SyncAssetsOptions {
  srcDir: string;
  destDir: string;
  filter: (name: string) => boolean;
}

export function fileContentsEqual(a: string, b: string): boolean {
  if (!fs.existsSync(b)) return false;
  return fs.readFileSync(a, 'utf8') === fs.readFileSync(b, 'utf8');
}

// Collect every asset file under `dir` (recursively) whose name passes `filter`.
function listAssetFiles(dir: string, filter: (name: string) => boolean): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listAssetFiles(full, filter));
    else if (filter(entry.name)) out.push(full);
  }
  return out;
}

// Collect every directory under `dir` (recursively) as paths relative to `dir`.
function listDirectories(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const rel = entry.name;
    out.push(rel, ...listDirectories(path.join(dir, entry.name)).map((c) => path.join(rel, c)));
  }
  return out;
}

/**
 * Brings `destDir` into exact sync with `srcDir` for the file types matched by
 * `filter`: copies/updates new or changed assets, deletes stale assets and
 * orphaned folders that no longer have a matching source, and reports a summary.
 *
 * Safety guardrails:
 * - Only files/dirs inside `destDir` are ever touched; nothing outside it.
 * - If the source is missing, unreadable, or yields zero expected assets, the
 *   whole sync is skipped (nothing copied, nothing deleted) so a broken scan can
 *   never be misread as "everything was deleted" and wipe `destDir`.
 */
export function syncAssets({ srcDir, destDir, filter }: SyncAssetsOptions): SyncSummary {
  const summary: SyncSummary = { added: 0, updated: 0, stale: 0, skipped: false };

  if (!fs.existsSync(srcDir) || !fs.statSync(srcDir).isDirectory()) {
    summary.skipped = true;
    summary.reason = `source directory is missing or not a directory (${srcDir}) — sync skipped, nothing deleted`;
    return summary;
  }

  let srcFiles: string[];
  let srcDirs: string[];
  try {
    srcFiles = listAssetFiles(srcDir, filter);
    srcDirs = listDirectories(srcDir);
  } catch (err) {
    summary.skipped = true;
    summary.reason = `source directory is unreadable (${srcDir}): ${
      err instanceof Error ? err.message : String(err)
    } — sync skipped, nothing deleted`;
    return summary;
  }

  const expected = new Set(srcFiles.map((f) => path.relative(srcDir, f)));
  const expectedDirs = new Set(srcDirs);

  if (expected.size === 0) {
    summary.skipped = true;
    summary.reason = `no matching asset files found under ${srcDir} — sync skipped (deletion disabled) to avoid wiping ${destDir}`;
    return summary;
  }

  fs.mkdirSync(destDir, { recursive: true });

  // Delete stale assets (matching `filter`) and orphaned folders inside destDir.
  const walkDest = (dir: string, rel: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const entryRel = rel ? path.join(rel, entry.name) : entry.name;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!expectedDirs.has(entryRel)) {
          fs.rmSync(full, { recursive: true, force: true });
          summary.stale += 1;
        } else {
          walkDest(full, entryRel);
        }
      } else if (filter(entry.name) && !expected.has(entryRel)) {
        fs.rmSync(full, { force: true });
        summary.stale += 1;
      }
    }
  };
  walkDest(destDir, '');

  // Copy or update every expected asset.
  for (const srcFile of srcFiles) {
    const rel = path.relative(srcDir, srcFile);
    const dest = path.join(destDir, rel);
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(srcFile, dest);
      summary.added += 1;
    } else if (!fileContentsEqual(srcFile, dest)) {
      fs.copyFileSync(srcFile, dest);
      summary.updated += 1;
    }
  }

  return summary;
}
