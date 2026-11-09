// Public display labels for trade partners (rule decided 2026-11-05 in
// lailara-website DECISIONS): a Cinderhaven dollar figure never sits beside a
// real retailer or distributor name. The JSON keeps its retailer codes; only
// rendered text goes through here. The map is vendored from
// cinderhaven-data-platform by scripts/refresh_canonical.py;
// scripts/check_retailer_labels.py enforces the rule on rendered text.
import labels from "../../reference/retailer_display_labels.json";

const LABELS = new Map<string, string>();
for (const [id, p] of Object.entries({ ...labels.retailers, ...labels.distributors })) {
  LABELS.set(id, p.label);
  LABELS.set(p.name, p.label);
}

// The committed sample JSON (scripts/generate_sample_json.py, byte-locked by
// tests/test_demo_golden.py) uses short retailer codes; the pipeline exports
// platform IDs. This resolves each short code to its platform ID only; the
// labels themselves come from the shared map above.
const SAMPLE_CODE_TO_ID: Record<string, string> = {
  WMT: "RET-WALMART",
  COSTCO: "RET-COSTCO",
  WHOLEFOODS: "RET-WHOLEFOODS",
  SPROUTS: "RET-SPROUTS",
  KGR: "RET-KROGER",
  REGIONAL: "RET-REGIONAL",
};

/** Capitalized display label for a retailer code, platform ID or name.
 *  Values not in the map pass through unchanged. */
export function retailerLabel(value: string): string {
  const label = LABELS.get(SAMPLE_CODE_TO_ID[value] ?? value) ?? value;
  return label.charAt(0).toUpperCase() + label.slice(1);
}
