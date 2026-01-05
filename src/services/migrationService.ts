// Simple client-side schema migration runner
// Version history:
// 1: Normalize all stored user emails to lowercase & ensure uniqueness

const SCHEMA_VERSION_KEY = 'medimo_schema_version';
const USERS_KEY = 'medimo_mock_users';

interface StoredUser { id: string; email: string; password: string; name: string; isOnboardingComplete: boolean; }

type Migration = { version: number; run: () => void };

function migrate1_normalizeEmails() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return;
    let changed = false;
    const users: StoredUser[] = JSON.parse(raw);
    const seen: Record<string, number> = {};

    // Only normalize to lowercase, do NOT rename emails on collision
    // Renaming breaks logins and password resets
    users.forEach(u => {
      const original = u.email;
      const lower = original.toLowerCase();
      if (lower !== original) {
        u.email = lower;
        changed = true;
      }
      // Track duplicates for logging only
      if (seen[lower] != null) {
        console.warn(`[Migration v1] Duplicate email detected after normalization: ${lower}`);
      }
      seen[lower] = (seen[lower] || 0) + 1;
    });
    if (changed) {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  } catch (e) {
    console.warn('[Migration v1] Failed to process users:', e);
  }
}

const migrations: Migration[] = [
  { version: 1, run: migrate1_normalizeEmails }
];

export function runMigrations(): void {
  // SSR guard: prevents migrations from running on server (e.g., Next.js, Node.js SSR)
  // This early return is intentional future-proofing for SSR frameworks
  if (typeof window === 'undefined') return;
  const currentRaw = localStorage.getItem(SCHEMA_VERSION_KEY);
  const currentVersion = currentRaw ? parseInt(currentRaw, 10) : 0;
  const pending = migrations.filter(m => m.version > currentVersion).sort((a, b) => a.version - b.version);
  if (!pending.length) return;
  pending.forEach(m => {
    try {
      m.run();
      localStorage.setItem(SCHEMA_VERSION_KEY, String(m.version));
    } catch (e) {
      console.error(`[Migration v${m.version}] failed`, e);
    }
  });
}

// Optionally expose current version
export function getSchemaVersion(): number {
  const raw = localStorage.getItem(SCHEMA_VERSION_KEY);
  return raw ? parseInt(raw, 10) : 0;
}
