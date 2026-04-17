"use client";

import { useState, useEffect } from "react";
import {
  getCheapestFare,
  buildFlexibilityLadder
} from "../lib/pricing";

// ---------- helpers ----------
function getDurationMinutes(dep, arr) {
  const [dh, dm] = dep.split(":").map(Number);
  const [ah, am] = arr.split(":").map(Number);
  return ah * 60 + am - (dh * 60 + dm);
}

function formatDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

function getMinutesFromTime(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function roundUpToNearest5p(value) {
  return Math.ceil(value * 20) / 20;
}

function formatMoney(value) {
  return roundUpToNearest5p(value).toFixed(2);
}

function getValidityBlocks(type) {
  if (type === "advance") return null;

  if (type === "anytime") {
    return Array.from({ length: 13 }, (_, i) => ({
      label: String(6 + i).padStart(2, "0"),
      valid: true
    }));
  }

  return [
    { label: "06", valid: false },
    { label: "07", valid: false },
    { label: "08", valid: false },
    { label: "09", valid: true },
    { label: "10", valid: true },
    { label: "11", valid: true },
    { label: "12", valid: true },
    { label: "13", valid: true },
    { label: "14", valid: true },
    { label: "15", valid: true },
    { label: "16", valid: false },
    { label: "17", valid: false },
    { label: "18", valid: false }
  ];
}

// ---------- component ----------
export default function JourneyCard({
  journey,
  selected,
  onSelect,
  onPriceChange,
  isCheapest,
  fastestDuration,
  onContinue,
  railcardEligible
}) {
  const cheapest = getCheapestFare(journey.fares);
  const ladder = buildFlexibilityLadder(journey.fares);

  const flexFare = ladder.find((f) => f.type === "off_peak");
  const anytimeFare = ladder.find((f) => f.type === "anytime");

  const flexUpgrade = flexFare ? roundUpToNearest5p(flexFare.delta) : 0;
  const anytimeUpgrade = anytimeFare ? roundUpToNearest5p(anytimeFare.delta) : 0;

  const firstMultiplier = journey.route === "london" ? 1.6 : 1.3;
  const firstUpgrade = roundUpToNearest5p(
    cheapest.price * (firstMultiplier - 1)
  );

  const [addFlex, setAddFlex] = useState(false);
  const [addAnytime, setAddAnytime] = useState(false);
  const [addFirst, setAddFirst] = useState(false);

  useEffect(() => {
    if (!selected) {
      setAddFlex(false);
      setAddAnytime(false);
      setAddFirst(false);
    }
  }, [selected]);

  let activeFareType = "advance";
  if (addAnytime) activeFareType = "anytime";
  else if (addFlex) activeFareType = "off_peak";

  let total = roundUpToNearest5p(cheapest.price);

  if (addAnytime) total = roundUpToNearest5p(total + anytimeUpgrade);
  else if (addFlex) total = roundUpToNearest5p(total + flexUpgrade);

  if (addFirst) total = roundUpToNearest5p(total + firstUpgrade);

  const showRailcard =
    railcardEligible &&
    journey.route === "glossop" &&
    getMinutesFromTime(journey.departure) >= 570;

  let railcardSaving = 0;

  if (showRailcard) {
    const adultPortion = total * 0.7;
    const childPortion = total * 0.3;
    const adultSaving = adultPortion * 0.34;
    const childSaving = Math.max(childPortion - 4, 0);
    railcardSaving = roundUpToNearest5p(adultSaving + childSaving);
  }

  const durationMins = getDurationMinutes(
    journey.departure,
    journey.arrival
  );

  const duration = formatDuration(durationMins);
  const stops = journey.callingPoints.length;
  const isFastest = durationMins === fastestDuration;

  useEffect(() => {
    if (selected && onPriceChange) {
      onPriceChange({
        total,
        activeFareType,
        addFlex,
        addAnytime,
        addFirst
      });
    }
  }, [
    selected,
    addFlex,
    addAnytime,
    addFirst,
    total,
    activeFareType,
    onPriceChange
  ]);

  return (
    <div style={styles.card(selected)}>
      <div style={styles.topStripe} />

      <div style={styles.row}>
        <div>
          <div style={styles.time}>
            {journey.departure} → {journey.arrival}
          </div>

          <div style={styles.route}>
            {journey.origin} → {journey.destination}
          </div>

          <div style={styles.duration}>{duration}</div>

          <div style={styles.badgeRow}>
            {isFastest && <span style={styles.fast}>Fastest</span>}
            {stops === 0 && <span style={styles.direct}>Direct</span>}
          </div>

          <div style={styles.meta}>Platform {journey.platform}</div>
        </div>

        <div style={styles.priceBlock}>
          {isCheapest && <div style={styles.cheapest}>Cheapest</div>}
          <div style={styles.price}>£{formatMoney(total)}</div>
        </div>
      </div>

      <div style={styles.section}>
        {activeFareType === "advance" ? (
          <div style={styles.validityBox}>
            ✔ This fare is valid on this train only
          </div>
        ) : (
          <>
            <div style={styles.validityBox}>
              {activeFareType === "anytime"
                ? "✔ Valid on any service today"
                : "✔ Valid on selected off-peak services"}
            </div>

            <div style={styles.timeline}>
              {getValidityBlocks(activeFareType).map((b, i) => (
                <div key={i} style={styles.timelineItem}>
                  <div
                    style={{
                      ...styles.block,
                      background: b.valid ? "#16a34a" : "#dc2626"
                    }}
                  />
                  <div style={styles.label}>
                    {i % 3 === 0 ? b.label : ""}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Ticket options</h3>

        {flexFare && (
          <label style={styles.option}>
            <input
              type="checkbox"
              checked={addFlex}
              onChange={() => {
                const v = !addFlex;
                setAddFlex(v);
                if (v) setAddAnytime(false);
              }}
            />
            <span>
              +£{formatMoney(flexUpgrade)} Add more flexibility (Off-Peak)
            </span>
          </label>
        )}

        {anytimeFare && (
          <label style={styles.option}>
            <input
              type="checkbox"
              checked={addAnytime}
              onChange={() => {
                const v = !addAnytime;
                setAddAnytime(v);
                if (v) setAddFlex(false);
              }}
            />
            <span>
              +£{formatMoney(anytimeUpgrade)} Upgrade to fully flexible (Anytime)
            </span>
          </label>
        )}

        <label style={styles.option}>
          <input
            type="checkbox"
            checked={addFirst}
            onChange={() => setAddFirst(!addFirst)}
          />
          <span>
            +£{formatMoney(firstUpgrade)} Upgrade to First Class
          </span>
        </label>
      </div>

      {showRailcard && (
        <div style={styles.railcard}>
          <strong>Family Railcard</strong>
          <div>
            Save <strong>£{formatMoney(railcardSaving)}</strong>
          </div>
          <div style={styles.railcardSub}>
            Available after 09:30
          </div>
        </div>
      )}

      <button onClick={onSelect} style={styles.select}>
        {selected ? "Selected ✓" : "Select"}
      </button>

      {selected && (
        <div style={styles.post}>
          <button style={styles.secondary}>Add return</button>
          <button style={styles.secondary}>Add another journey</button>

          <button style={styles.primary} onClick={onContinue}>
            Continue to basket →
          </button>
        </div>
      )}
    </div>
  );
}

// ---------- styles ----------
const styles = {
  card: (selected) => ({
    background: "#fff",
    padding: "24px",
    borderRadius: "12px",
    marginBottom: "24px",
    border: selected ? "3px solid #2563eb" : "1px solid #d7deea"
  }),

  topStripe: {
    height: "5px",
    background: "linear-gradient(to right, #0b1f3a, #2563eb, #d72638)",
    margin: "-24px -24px 20px -24px"
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px"
  },

  time: {
    fontSize: "26px",
    fontWeight: "700",
    lineHeight: 1.2
  },

  route: {
    fontSize: "16px",
    lineHeight: 1.5,
    color: "#475569",
    marginTop: "4px"
  },

  duration: {
    fontSize: "15px",
    lineHeight: 1.5,
    marginTop: "4px"
  },

  badgeRow: {
    display: "flex",
    gap: "8px",
    marginTop: "10px"
  },

  fast: {
    background: "#16a34a",
    color: "white",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "13px",
    lineHeight: 1.3
  },

  direct: {
    background: "#2563eb",
    color: "white",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "13px",
    lineHeight: 1.3
  },

  priceBlock: {
    textAlign: "right"
  },

  price: {
    fontSize: "34px",
    fontWeight: "800",
    lineHeight: 1.15
  },

  cheapest: {
    background: "#d72638",
    color: "white",
    padding: "4px 10px",
    borderRadius: "6px",
    marginBottom: "8px",
    fontSize: "13px",
    lineHeight: 1.3
  },

  meta: {
    fontSize: "15px",
    lineHeight: 1.5,
    marginTop: "6px"
  },

  section: {
    marginTop: "20px"
  },

  sectionTitle: {
    fontSize: "18px",
    lineHeight: 1.3,
    marginBottom: "8px"
  },

  validityBox: {
    padding: "14px",
    background: "#f1f5f9",
    borderRadius: "8px",
    fontSize: "16px",
    lineHeight: 1.5
  },

  timeline: {
    display: "flex",
    gap: "6px",
    marginTop: "14px"
  },

  timelineItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },

  block: {
    width: "18px",
    height: "12px"
  },

  label: {
    fontSize: "11px",
    lineHeight: 1.4,
    marginTop: "4px"
  },

  option: {
    display: "flex",
    gap: "12px",
    marginTop: "10px",
    alignItems: "center",
    cursor: "pointer",
    fontSize: "16px",
    lineHeight: 1.5
  },

  railcard: {
    marginTop: "18px",
    padding: "14px",
    borderRadius: "8px",
    background: "#ecfdf5",
    border: "2px solid #10b981",
    fontSize: "16px",
    lineHeight: 1.5
  },

  railcardSub: {
    fontSize: "14px",
    lineHeight: 1.5,
    color: "#065f46",
    marginTop: "4px"
  },

  select: {
    marginTop: "20px",
    width: "100%",
    padding: "16px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "17px",
    lineHeight: 1.3,
    cursor: "pointer"
  },

  post: {
    marginTop: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  secondary: {
    padding: "14px 16px",
    border: "2px solid #cbd5e1",
    borderRadius: "10px",
    background: "white",
    cursor: "pointer",
    fontSize: "16px",
    lineHeight: 1.4
  },

  primary: {
    padding: "16px",
    background: "#0b1f3a",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "17px",
    lineHeight: 1.3,
    cursor: "pointer"
  }
};