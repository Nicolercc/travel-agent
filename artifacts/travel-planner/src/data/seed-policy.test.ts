import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Demo-data policy (INV-13): the public repository must not contain real travel identifiers.
 * Real references are listed as SHA-256 hashes so this test does not republish them.
 */
const DENYLIST_SHA256 = new Set([
  "a82df7b5e32c6a2f0838b51491a26ba035cee2820197a7c6397546becfa7011b",
  "8e91c6c1d914cb35f3dfe5d430c7a10fdcccbae8bb539be07a7045ca11669021",
  "e936647cd0fe65ab66c052dfac33541ec7321032e0f60a894fc44afdb320d68f",
  "2d8a7036315740020c32991607ce88a6b45ba12643b5d4067849ecee72414f29",
  "12a303c224c250d07c81691de6e0fd74699ce6bd78c234057de70413a58457cf",
]);
const DEMO_REFERENCE = /^DEMO-[A-Z0-9-]{4,}$/;

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "../../../..");
const SCANNED_ROOTS = [join(here), join(repoRoot, "docs"), join(repoRoot, "README.md")];

function filesUnder(path: string): string[] {
  if (statSync(path).isFile()) return [path];
  return readdirSync(path).flatMap((entry) => filesUnder(join(path, entry)));
}

const scannedFiles = SCANNED_ROOTS.flatMap(filesUnder).filter(
  (file) => /\.(ts|tsx|md)$/.test(file) && !file.endsWith("seed-policy.test.ts"),
);

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

describe("demo data policy", () => {
  it("scans seed data and documentation", () => {
    expect(scannedFiles.some((file) => file.includes("/data/"))).toBe(true);
    expect(scannedFiles.some((file) => file.includes("/docs/"))).toBe(true);
  });

  it("uses DEMO- prefixed values for every confirmation in seed data", () => {
    const offenders = scannedFiles
      .filter((file) => file.includes("/src/data/"))
      .flatMap((file) =>
        [...readFileSync(file, "utf8").matchAll(/confirmation(?:Number)?:\s*"([^"]*)"/g)]
          .map((match) => match[1])
          .filter((value) => !DEMO_REFERENCE.test(value))
          .map((value) => `${relative(repoRoot, file)}: ${value}`),
      );
    expect(offenders).toEqual([]);
  });

  it("contains none of the known real travel identifiers", () => {
    const offenders = scannedFiles.flatMap((file) =>
      (readFileSync(file, "utf8").toLowerCase().match(/[a-z0-9-]+/g) ?? [])
        .filter((token) => DENYLIST_SHA256.has(sha256(token)))
        .map(() => relative(repoRoot, file)),
    );
    expect([...new Set(offenders)]).toEqual([]);
  });
});
