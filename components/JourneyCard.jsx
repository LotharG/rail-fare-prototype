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
    return Array.from({ length: 13 }, (_, i) => ({
      label: String(6 + i),
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

  const flexFare = ladder.find(f => f.type === "off_peak");
  const anytimeFare = ladder.find(f => f.type === "anytime");

  const flexUpgrade = flexFare ? flexFare.delta : 0;
  const anytimeUpgrade = anytimeFare ? anytimeFare.delta : 0;

  const firstUpgrade =
    firstClass && cheapest.class === "standard"
      ? firstClass.price - cheapest.price
      : 0;

  const [addFlex, setAddFlex] = useState(false);
  const [addAnytime, setAddAnytime] = useState(false);
  const [addFirst, setAddFirst] = useState(false);

  // Reset only when deselected
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

  let total = cheapest.price;
  if (addAnytime) total += anytimeUpgrade;
  else if (addFlex) total += flexUpgrade;
  if (addFirst) total += firstUpgrade;

  const durationMins = getDurationMinutes(
    journey.departure,
    journey.arrival
  );

  const duration = formatDuration(durationMins);
  const stops = journey.callingPoints.length;
  const isFastest = durationMins === fastestDuration;

  // Update parent WITHOUT causing loop
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
  }, [selected, addFlex, addAnytime, addFirst]);

  return (
    <div style={{
      ...styles.card,
      border: selected ? "2px solid #2563eb" : "1px solid #d7deea"
    }}>
      {/* TOP STRIPE */}
      <div style={styles.topStripe} />

      {/* HEADER */}
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
          <div style={styles.price}>£{total}</div>
        </div>
      </div>

      {/* VALIDITY */}
      <div style={styles.section}>
        {activeFareType === "advance" ? (
          <div style={styles.serviceOnly}>
            ✔ This fare is valid on this train only
          </div>
        ) : (
          <>
            <div style={styles.validity}>
              {activeFareType === "anytime"
                ? "✔ Valid on any service today"
                : "✔ Valid on selected off-peak services"}
            </div>

            <div style={styles.timeline}>
              {getValidityBlocks(activeFareType).map((b, i) => (
                <div key={i} style={styles.timelineItem}>
                  <div style={{
                    ...styles.block,
                    background: b.valid ? "#16a34a" : "#dc2626"
                  }} />
                  <div style={styles.label}>
                    {i % 3 === 0 ? b.label : ""}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* OPTIONS */}
      <div style={styles.section}>
        <strong>Ticket options</strong>

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
            +£{flexUpgrade} Add more flexibility (Off-Peak)
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
            +£{anytimeUpgrade} Upgrade to fully flexible (Anytime)
          </label>
        )}

        {firstUpgrade > 0 && (
          <label style={styles.option}>
            <input
              type="checkbox"
              checked={addFirst}
              onChange={() => setAddFirst(!addFirst)}
            />
            +£{firstUpgrade} First Class
          </label>
        )}
      </div>

      {/* SELECT */}
      <button onClick={onSelect} style={styles.select}>
        {selected ? "Selected ✓" : "Select"}
      </button>

      {/* POST SELECT */}
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

const styles = {
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px"
  },
  topStripe: {
    height: "5px",
    background: "linear-gradient(to right, #0b1f3a, #2563eb, #d72638)",
    margin: "-20px -20px 12px -20px"
  },
  row: {
    display: "flex",
    justifyContent: "space-between"
  },
  time: {
    fontSize: "22px",
    fontWeight: "700"
  },
  route: {
    fontSize: "14px",
    color: "#475569"
  },
  duration: {
    fontSize: "13px"
  },
  badgeRow: {
    marginTop: "6px",
    display: "flex",
    gap: "6px"
  },
  fast: {
    background: "#16a34a",
    color: "white",
    padding: "2px 6px",
    borderRadius: "6px"
  },
  direct: {
    background: "#2563eb",
    color: "white",
    padding: "2px 6px",
    borderRadius: "6px"
  },
  priceBlock: { textAlign: "right" },
  price: { fontSize: "28px", fontWeight: "800" },
  cheapest: {
    background: "#d72638",
    color: "white",
    padding: "2px 6px",
    borderRadius: "6px",
    marginBottom: "4px"
  },
  section: { marginTop: "14px" },
  serviceOnly: { color: "#16a34a" },
  validity: { fontSize: "14px" },
  timeline: {
    display: "flex",
    gap: "4px",
    marginTop: "6px"
  },
  timelineItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  block: {
    width: "16px",
    height: "10px"
  },
  label: { fontSize: "10px" },
  option: {
    display: "flex",
    gap: "8px",
    marginTop: "6px"
  },
  select: {
    marginTop: "14px",
    width: "100%",
    padding: "12px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px"
  },
  post: {
    marginTop: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  secondary: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "white"
  },
  primary: {
    padding: "12px",
    background: "#111827",
    color: "white",
    border: "none",
    borderRadius: "8px"
  }
};