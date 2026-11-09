import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import labels from "../../reference/retailer_display_labels.json";
import ledger from "../public/json/risk_ledger.json";
import RiskLedger from "./views/RiskLedger";
import { retailerLabel } from "./displayLabels";
import type { RiskEntry } from "./types";

const entries = ledger as RiskEntry[];
const partners = Object.values({ ...labels.retailers, ...labels.distributors });
// "Regional Group" is its own label; every other name must never render.
const realNames = partners.filter((p) => p.name !== p.label).map((p) => p.name);

describe("retailerLabel", () => {
  it("maps a platform ID and a real name to the same label", () => {
    expect(retailerLabel("RET-WALMART")).toBe("National mass retailer");
    expect(retailerLabel("Walmart")).toBe("National mass retailer");
    expect(retailerLabel("DIST-UNFI")).toBe("Distributor A");
  });

  it("maps the sample JSON's short codes through their platform IDs", () => {
    expect(retailerLabel("WMT")).toBe("National mass retailer");
    expect(retailerLabel("KGR")).toBe("Conventional grocer");
    expect(retailerLabel("WHOLEFOODS")).toBe("Natural grocer");
  });

  it("passes unknown values through", () => {
    expect(retailerLabel("DTC")).toBe("DTC");
  });

  it("has a label for every retailer in the sample ledger", () => {
    for (const e of entries) {
      expect(retailerLabel(e.retailer)).not.toBe(e.retailer);
    }
  });
});

describe("RiskLedger", () => {
  afterEach(cleanup);

  it("renders labels, not real names or IDs, beside dollar figures", () => {
    const { container } = render(<RiskLedger entries={entries} />);
    // Pin the top row so the pin card's Retailer field is checked too.
    fireEvent.click(screen.getAllByRole("button", { name: /CHP-/ })[0]);
    expect(container.querySelector(".pin-card")).not.toBeNull();
    const text = container.textContent ?? "";
    for (const name of realNames) {
      expect(text.toUpperCase()).not.toContain(name.toUpperCase());
    }
    for (const code of ["RET-", "WMT", "KGR", "WHOLEFOODS"]) {
      expect(text).not.toContain(code);
    }
  });

  it("sorts the retailer filter by label", () => {
    render(<RiskLedger entries={entries} />);
    const options = screen
      .getAllByRole("option")
      .map((o) => o.textContent ?? "")
      .filter((t) => t !== "All retailers");
    expect(options).toEqual([...options].sort((a, b) => a.localeCompare(b)));
    expect(options.length).toBe(new Set(entries.map((e) => e.retailer)).size);
  });
});
