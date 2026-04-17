"use client";

import { useState, useEffect } from "react";
import {
  getCheapestFare,
  buildFlexibilityLadder,
  getFirstClassFare
} from "../lib/pricing";

function getDurationMinutes(dep, arr) {
  const [dh, dm] = dep.split(":").map(Number);
  const [ah, am] = arr.split(":").map(Number);
  return (ah * 60 + am) - (dh * 60 + dm);
}

function formatDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

function getValidityBlocks(type) {
  if (type === "advance") return null;

  if (type === "anytime") {
    return [
      { label: "06", valid: true },
      { label: "07", valid: true },
      { label: "08", valid: true },
      { label: "09", valid: true },
      { label: "10", valid: true },
      { label: "11", valid: true },
      { label: "12", valid: true },
      { label: "13", valid: true },
      { label: "14", valid: true },
      { label: "15", valid: true },
      { label: "16", valid: true },
      { label: "17", valid: true },
      { label: "18", valid: true }
    ];
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

export default function JourneyCard({
  journey,
  selected,
  onSelect,
  onPriceChange,
  isCheapest,
  fastestDuration,
  onContinue
}) {
  const cheapest = getCheapestFare(journey.fares);
  const ladder = buildFlexibilityLadder(journey.fares);
  const firstClass = getFirstClassFare(journey.fares);

  const flexFare = ladder.find((f) => f.type === "off_peak");
  const anytimeFare = ladder.find((f) => f.type === "anytime");

  const flexUpgrade = flexFare ? flexFare.delta : 0;
  const anytimeUpgrade = anytimeFare ? anytimeFare.delta : 0;

  const firstUpgrade =
    firstClass && cheapest.class === "standard"
      ? firstClass.price - cheapest.price
      : 0;

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
  if (addAnytime) {
    activeFareType = "anytime";
  } else if (addFlex) {
    activeFareType = "off_peak";
  }

  let total = cheapest.price;
  if (addAnytime) {
    total += anytimeUpgrade;
  } else if (addFlex) {
    total += flexUpgrade;
  }
  if (addFirst) {
    total += firstUpgrade;
  }

  const durationMins = getDurationMinutes(journey.departure, journey.arrival);
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
  }, [selected, addFlex, addAnytime, addFirst]); // intentionally excludes parent callback identity

  return (
    <div
      style={{
        ...styles.card,
        border: selected ? "2px solid #2563eb" : "1px solid #d7deea"
      }}
    >
      <div style={styles.topStripe} />

      <div style={styles.row}>
        <div>
          <div style={styles.time}>
            {journey.departure} → {journey.arrival}
          </div>

          <div style={styles.route}>
            {journey.origin} ({journey.originCode}) →{" "}
            {journey.destination} ({journey.destinationCode})
          </div>

          <div style={styles.duration}>{duration}</div>

          <div style={styles.badgeRow}>
            {isFastest && <span style={styles.fastBadge}>Fastest</span>}
            {stops === 0 && <span style={styles.directBadge}>Direct</span>}
            {stops <= 2 && !isFastest && (
              <span style={styles.fewStopsBadge}>Fewer stops</span>
            )}
          </div>

          <div style={styles.meta}>Platform {journey.platform}</div>

          <div style={styles.calls}>
            Calling at:{" "}
            {journey.callingPoints.length > 0
              ? journey.callingPoints.join(" • ")
              : "Direct service"}
          </div>
        </div>

        <div style={styles.priceBlock}>
          {isCheapest && <span style={styles.cheapestBadge}>Cheapest</span>}
          <div style={styles.price} aria-live="polite">
            £{total}
          </div>
        </div>
      </div>

      <div style={styles.section}>
        {activeFareType === "advance" ? (
          <div style={styles.serviceOnly}>
            ✔ This fare is valid on this train only
          </div>
        ) : (
          <div>
            <div style={styles.validityLabel}>
              {activeFareType === "anytime"
                ? "✔ Valid on any service today"
                : "✔ Valid on selected off-peak services"}
            </div>

            <div style={styles.timelineWrapper}>
              {getValidityBlocks(activeFareType).map((b, i) => (
                <div key={i} style={styles.timelineItem}>
                  <div
                    style={{
                      ...styles.block,
                      background: b.valid ? "#16a34a" : "#dc2626"
                    }}
                  />
                  <div style={styles.label}>{i % 3 === 0 ? b.label : ""}</div>
                </div>
              ))}
            </div>

            <div style={styles.legend}>
              <span>🟩 Valid (can travel)</span>
              <span>🟥 Not valid</span>
            </div>
          </div>
        )}
      </div>

      <div style={styles.section}>
        <strong style={styles.sectionTitle}>Ticket options</strong>

        {flexFare && (
          <label style={styles.optionRow}>
            <input
              type="checkbox"
              checked={addFlex}
              onChange={() => {
                const newValue = !addFlex;
                setAddFlex(newValue);
                if (newValue) setAddAnytime(false);
              }}
            />
            <span>+£{flexUpgrade} Add more flexibility (Off-Peak)</span>
          </label>
        )}

        {anytimeFare && (
          <label style={styles.optionRow}>
            <input
              type="checkbox"
              checked={addAnytime}
              onChange={() => {
                const newValue = !addAnytime;
                setAddAnytime(newValue);
                if (newValue) setAddFlex(false);
              }}
            />
            <span>+£{anytimeUpgrade} Upgrade to fully flexible (Anytime)</span>
          </label>
        )}

        {firstUpgrade > 0 && (
          <label style={styles.optionRow}>
            <input
              type="checkbox"
              checked={addFirst}
              onChange={() => setAddFirst(!addFirst)}
            />
            <span>+£{firstUpgrade} First Class</span>
          </label>
        )}
      </div>

      <button onClick={onSelect} style={styles.selectButton}>
        {selected ? "Selected ✓" : "Select"}
      </button>

      {selected && (
        <div style={styles.postSelect}>
          <button style={styles.secondaryButton}>Add return</button>
          <button style={styles.secondaryButton}>Add another journey</button>

          <button style={styles.primaryAction} onClick={onContinue}>
            Continue to basket →
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: "#ffffff",
    borderRadius: "14px",
    marginBottom: "20px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(11, 31, 58, 0.06)"
  },
  topStripe: {
    height: "6px",
    borderRadius: "8px 8px 0 0",
    background: "linear-gradient(90deg, #0b1f3a 0%, #2563eb 68%, #d72638 100%)",
    margin: "-20px -20px 18px -20px"
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px"
  },
  time: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#0b1f3a"
  },
  route: {
    fontSize: "14px",
    color: "#334155",
    marginTop: "4px"
  },
  duration: {
    fontSize: "14px",
    marginTop: "4px",
    color: "#334155"
  },
  meta: {
    fontSize: "13px",
    marginTop: "6px",
    color: "#334155"
  },
  calls: {
    fontSize: "13px",
    marginTop: "4px",
    color: "#475569"
  },
  badgeRow: {
    display: "flex",
    gap: "8px",
    marginTop: "8px",
    flexWrap: "wrap"
  },
  fastBadge: {
    background: "#16a34a",
    color: "#ffffff",
    padding: "3px 8px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700"
  },
  directBadge: {
    background: "#2563eb",
    color: "#ffffff",
    padding: "3px 8px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700"
  },
  fewStopsBadge: {
    background: "#d72638",
    color: "#ffffff",
    padding: "3px 8px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700"
  },
  priceBlock: {
    textAlign: "right",
    minWidth: "92px"
  },
  price: {
    fontSize: "30px",
    fontWeight: "800",
    color: "#0b1f3a"
  },
  cheapestBadge: {
    background: "#d72638",
    color: "#ffffff",
    padding: "4px 8px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
    display: "inline-block",
    marginBottom: "6px"
  },
  section: {
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "1px solid #e2e8f0"
  },
  sectionTitle: {
    display: "block",
    marginBottom: "8px",
    color: "#0b1f3a",
    fontSize: "15px"
  },
  serviceOnly: {
    fontSize: "14px",
    color: "#0b1f3a",
    fontWeight: "600"
  },
  validityLabel: {
    fontSize: "14px",
    color: "#0b1f3a",
    fontWeight: "600"
  },
  timelineWrapper: {
    display: "flex",
    gap: "4px",
    marginTop: "10px",
    flexWrap: "wrap"
  },
  timelineItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  block: {
    width: "18px",
    height: "12px",
    borderRadius: "2px"
  },
  label: {
    fontSize: "12px",
    color: "#334155",
    marginTop: "3px"
  },
  legend: {
    display: "flex",
    gap: "12px",
    fontSize: "12px",
    marginTop: "8px",
    color: "#334155",
    flexWrap: "wrap"
  },
  optionRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 0",
    cursor: "pointer",
    fontSize: "14px",
    color: "#0b1f3a"
  },
  selectButton: {
    marginTop: "16px",
    width: "100%",
    padding: "13px",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer"
  },
  postSelect: {
    marginTop: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  secondaryButton: {
    padding: "11px",
    borderRadius: "10px",
    border: "2px solid #cbd5e1",
    background: "#ffffff",
    color: "#0b1f3a",
    fontWeight: "700",
    cursor: "pointer"
  },
  primaryAction: {
    padding: "13px",
    borderRadius: "10px",
    background: "#0b1f3a",
    color: "#ffffff",
    fontWeight: "700",
    border: "none",
    cursor: "pointer"
  }
};