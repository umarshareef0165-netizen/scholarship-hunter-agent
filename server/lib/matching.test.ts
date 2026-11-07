import { describe, expect, it } from "vitest";

import {
  buildEssayOutline,
  daysUntilDeadline,
  deadlineUrgency,
  prepSteps,
  scoreMatch,
  type ProfileInput,
  type ScholarshipInput,
} from "./matching.js";

const NOW = new Date("2026-11-07T12:00:00Z");

const PROFILE: ProfileInput = {
  level: "masters",
  field: "cs",
  country: "Pakistan",
  targetCountries: ["United Kingdom", "Germany"],
  graduationYear: 2027,
  name: "Umar",
};

function scholarship(overrides: Partial<ScholarshipInput>): ScholarshipInput {
  return {
    slug: "test",
    name: "Test Scholarship",
    provider: "Test Trust",
    country: "United Kingdom",
    levels: ["masters"],
    fields: ["cs"],
    amount: "Full funding",
    deadline: "2026-12-08",
    deadlineNote: "Closes 8 Dec 2026.",
    status: "open",
    verified: true,
    ...overrides,
  };
}

describe("daysUntilDeadline", () => {
  it("counts whole days to a future deadline", () => {
    expect(daysUntilDeadline("2026-12-08", NOW)).toBe(31);
  });
  it("returns negative days for a past deadline", () => {
    expect(daysUntilDeadline("2026-11-01", NOW)).toBeLessThan(0);
  });
  it("returns null without a deadline", () => {
    expect(daysUntilDeadline(null, NOW)).toBeNull();
  });
  it("returns null for an invalid date", () => {
    expect(daysUntilDeadline("not-a-date", NOW)).toBeNull();
  });
});

describe("deadlineUrgency", () => {
  it("marks <=14 days as urgent", () => {
    expect(
      deadlineUrgency({ deadline: "2026-11-20", status: "open" }, NOW),
    ).toBe("urgent");
  });
  it("marks <=45 days as soon", () => {
    expect(
      deadlineUrgency({ deadline: "2026-12-08", status: "open" }, NOW),
    ).toBe("soon");
  });
  it("marks later dates as later", () => {
    expect(
      deadlineUrgency({ deadline: "2027-02-20", status: "open" }, NOW),
    ).toBe("later");
  });
  it("marks closed programmes as closed regardless of date", () => {
    expect(
      deadlineUrgency({ deadline: "2026-12-08", status: "closed" }, NOW),
    ).toBe("closed");
  });
  it("marks rolling programmes as none", () => {
    expect(
      deadlineUrgency({ deadline: null, status: "rolling" }, NOW),
    ).toBe("none");
  });
  it("marks past deadlines as overdue", () => {
    expect(
      deadlineUrgency({ deadline: "2026-11-01", status: "open" }, NOW),
    ).toBe("overdue");
  });
});

describe("scoreMatch", () => {
  it("scores a perfect open match at 100", () => {
    const { score, reasons } = scoreMatch(PROFILE, scholarship({}), NOW);
    expect(score).toBe(100);
    expect(reasons.length).toBeGreaterThanOrEqual(4);
  });
  it("penalises a level mismatch", () => {
    const { score } = scoreMatch(
      PROFILE,
      scholarship({ levels: ["phd"] }),
      NOW,
    );
    expect(score).toBeLessThan(70);
  });
  it("penalises a field mismatch", () => {
    const { score } = scoreMatch(
      PROFILE,
      scholarship({ fields: ["medicine"] }),
      NOW,
    );
    expect(score).toBeLessThan(80);
  });
  it("penalises a destination outside the targets", () => {
    const { score, reasons } = scoreMatch(
      PROFILE,
      scholarship({ country: "Japan" }),
      NOW,
    );
    expect(score).toBeLessThan(100);
    expect(reasons.join(" ")).toContain("outside your targets");
  });
  it("caps closed programmes at 30", () => {
    const { score, reasons } = scoreMatch(
      PROFILE,
      scholarship({ status: "closed" }),
      NOW,
    );
    expect(score).toBeLessThanOrEqual(30);
    expect(reasons.join(" ")).toContain("Closed for this cycle");
  });
  it("caps overdue programmes at 30", () => {
    const { score } = scoreMatch(
      PROFILE,
      scholarship({ deadline: "2026-11-01" }),
      NOW,
    );
    expect(score).toBeLessThanOrEqual(30);
  });
  it("treats 'all fields' as a field match", () => {
    const { score } = scoreMatch(
      PROFILE,
      scholarship({ fields: ["all"] }),
      NOW,
    );
    expect(score).toBe(100);
  });
});

describe("buildEssayOutline", () => {
  it("builds a personalised 4-point outline", () => {
    const outline = buildEssayOutline(PROFILE, scholarship({}));
    expect(outline.title).toContain("Test Scholarship");
    expect(outline.points).toHaveLength(4);
    expect(outline.hook).toContain("cs");
    expect(JSON.stringify(outline)).toContain("Umar");
    expect(JSON.stringify(outline)).toContain("Pakistan");
    expect(outline.wordTarget).toContain("500");
  });
});

describe("prepSteps", () => {
  it("warns about unverified entries", () => {
    const steps = prepSteps(scholarship({ verified: false }));
    expect(steps.join(" ")).toContain("UNVERIFIED");
  });
  it("does not warn for verified entries", () => {
    const steps = prepSteps(scholarship({ verified: true }));
    expect(steps.join(" ")).not.toContain("UNVERIFIED");
  });
  it("includes the deadline note", () => {
    const steps = prepSteps(scholarship({}));
    expect(steps.join(" ")).toContain("8 Dec 2026");
  });
});
