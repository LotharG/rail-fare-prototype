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
  }, [selected, total, activeFareType, addFlex, addAnytime, addFirst]);

  return (
    <div
      style={{
        ...styles.card,
        border: selected ? "2px solid #2563eb" : "1px solid #d1d5db"
      }}
    >
      <div style={styles.row}>
        <div>
          <div style={styles.time}>
            {journey.departure} → {journey.arrival}
          </div>

          <div style={styles.route}>
            {journey.origin} ({journey.originCode}) → {journey.destination} ({journey.destinationCode})
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
          {isCheapest && <span style={styles.badge}>Cheapest</span>}
          <div style={styles.price} aria-live="polite">
            £{total}
          </div>
        </div>
      </div>

      <div style={styles.base}>
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

      <div style={styles.options}>
        <strong>Ticket options</strong>

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
            +£{flexUpgrade} Add more flexibility (Off-Peak)
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
            +£{anytimeUpgrade} Upgrade to fully flexible (Anytime)
          </label>
        )}

        {firstUpgrade > 0 && (
          <label style={styles.optionRow}>
            <input
              type="checkbox"
              checked={addFirst}
              onChange={() => setAddFirst(!addFirst)}
            />
            +£{firstUpgrade} First Class
          </label>
        )}
      </div>

      <button onClick={onSelect} style={styles.button}>
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
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px"
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px"
  },
  time: {
    fontSize: "20px",
    fontWeight: "600"
  },
  route: {
    fontSize: "14px",
    color: "#1f2937"
  },
  duration: {
    fontSize: "14px",
    marginTop: "2px",
    color: "#374151"
  },
  meta: {
    fontSize: "13px",
    marginTop: "4px",
    color: "#374151"
  },
  calls: {
    fontSize: "13px",
    marginTop: "4px",
    color: "#4b5563"
  },
  badgeRow: {
    display: "flex",
    gap: "6px",
    marginTop: "6px",
    flexWrap: "wrap"
  },
  fastBadge: {
    background: "#16a34a",
    color: "white",
    padding: "3px 8px",
    borderRadius: "6px",
    fontSize: "12px"
  },
  directBadge: {
    background: "#2563eb",
    color: "white",
    padding: "3px 8px",
    borderRadius: "6px",
    fontSize: "12px"
  },
  fewStopsBadge: {
    background: "#f59e0b",
    color: "white",
    padding: "3px 8px",
    borderRadius: "6px",
    fontSize: "12px"
  },
  priceBlock: {
    textAlign: "right",
    minWidth: "80px"
  },
  price: {
    fontSize: "26px",
    fontWeight: "700"
  },
  badge: {
    background: "#16a34a",
    color: "white",
    padding: "3px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    display: "inline-block",
    marginBottom: "4px"
  },
  base: {
    marginTop: "12px"
  },
  serviceOnly: {
    fontSize: "14px",
    color: "#16a34a"
  },
  validityLabel: {
    fontSize: "14px",
    color: "#374151"
  },
  timelineWrapper: {
    display: "flex",
    gap: "4px",
    marginTop: "8px",
    flexWrap: "wrap"
  },
  timelineItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  block: {
    width: "20px",
    height: "14px",
    borderRadius: "3px"
  },
  label: {
    fontSize: "12px",
    color: "#374151"
  },
  legend: {
    display: "flex",
    gap: "12px",
    fontSize: "12px",
    marginTop: "6px",
    color: "#374151"
  },
  options: {
    marginTop: "16px"
  },
  optionRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "6px 0",
    cursor: "pointer",
    fontSize: "14px"
  },
  button: {
    marginTop: "14px",
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    background: "#2563eb",
    color: "white",
    border: "none",
    fontWeight: "600",
    cursor: "pointer"
  },
  postSelect: {
    marginTop: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  secondaryButton: {
    padding: "10px",
    borderRadius: "8px",
    border: "2px solid #d1d5db",
    background: "#fff",
    cursor: "pointer"
  },
  primaryAction: {
    padding: "12px",
    borderRadius: "8px",
    background: "#111827",
    color: "white",
    fontWeight: "700",
    border: "none",
    cursor: "pointer"
  }
};