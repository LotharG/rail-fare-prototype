"use client";

import { useState, useEffect } from "react";
import {
  getCheapestFare,
  buildFlexibilityLadder,
  getFirstClassFare
} from "../lib/pricing";

// ✅ Duration helpers
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

// ✅ FIXED timeline logic
function getValidityBlocks(type) {
  if (type === "advance") return null;

  // 🔥 Anytime = fully valid all day
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

  // Off-peak
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
  fastestDuration
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

  // Active fare type
  let activeFareType = "advance";
  if (addAnytime) activeFareType = "anytime";
  else if (addFlex) activeFareType = "off_peak";

  // Total price
  let total = cheapest.price;
  if (addAnytime) total += anytimeUpgrade;
  else if (addFlex) total += flexUpgrade;
  if (addFirst) total += firstUpgrade;

  // Journey metrics
  const durationMins = getDurationMinutes(
    journey.departure,
    journey.arrival
  );
  const duration = formatDuration(durationMins);
  const stops = journey.callingPoints.length;

  const isFastest = durationMins === fastestDuration;

  useEffect(() => {
    if (selected) {
      onPriceChange({ total });
    }
  }, [selected, total]);

  useEffect(() => {
    if (!selected) {
      setAddFlex(false);
      setAddAnytime(false);
      setAddFirst(false);
    }
  }, [selected]);

  return (
    <div
      style={{
        ...styles.card,
        border: selected ? "2px solid #2563eb" : "1px solid #ddd"
      }}
    >
      {/* HEADER */}
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
            {isFastest && (
              <span style={styles.fastBadge}>Fastest</span>
            )}
            {stops === 0 && (
              <span style={styles.directBadge}>Direct</span>
            )}
            {stops <= 2 && !isFastest && (
              <span style={styles.fewStopsBadge}>Fewer stops</span>
            )}
          </div>

          <div style={styles.meta}>
            Platform {journey.platform}
          </div>

          <div style={styles.calls}>
            Calling at: {journey.callingPoints.join(" • ")}
          </div>
        </div>

        <div style={styles.priceBlock}>
          {isCheapest && (
            <span style={styles.badge}>Cheapest</span>
          )}
          <div style={styles.price}>£{total}</div>
        </div>
      </div>

      {/* VALIDITY */}
      <div style={styles.base}>
        {activeFareType === "advance" ? (
          <div style={styles.serviceOnly}>
            ✔ This service only
          </div>
        ) : (
          <div>
            <div style={styles.validityLabel}>
              {activeFareType === "anytime"
                ? "Valid all day"
                : "Ticket validity"}
            </div>

            <div style={styles.timelineWrapper}>
              {getValidityBlocks(activeFareType).map((b, i) => (
                <div key={i} style={styles.timelineItem}>
                  <div
                    style={{
                      ...styles.block,
                      background: b.valid
                        ? "#10b981"
                        : "#ef4444"
                    }}
                  />
                  <div style={styles.label}>
                    {i % 3 === 0 ? b.label : ""}
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.legend}>
              <span>🟩 Valid</span>
              <span>🟥 Not valid</span>
            </div>
          </div>
        )}
      </div>

      {/* ADD-ONS */}
      <div style={styles.options}>
        <strong>Customize</strong>

        {flexFare && (
          <label style={styles.option}>
            <input
              type="checkbox"
              checked={addFlex}
              onChange={() => {
                setAddFlex(!addFlex);
                setAddAnytime(false);
              }}
            />
            +£{flexUpgrade} Off-Peak
          </label>
        )}

        {anytimeFare && (
          <label style={styles.option}>
            <input
              type="checkbox"
              checked={addAnytime}
              onChange={() => {
                setAddAnytime(!addAnytime);
                setAddFlex(false);
              }}
            />
            +£{anytimeUpgrade} Anytime
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

      {/* BUTTON */}
      <button onClick={onSelect} style={styles.button}>
        {selected ? "Selected" : "Select"}
      </button>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    padding: "16px",
    borderRadius: "12px",
    marginBottom: "14px"
  },
  row: {
    display: "flex",
    justifyContent: "space-between"
  },
  time: { fontSize: "18px", fontWeight: "600" },
  route: { fontSize: "12px", color: "#666" },
  duration: { fontSize: "12px", marginTop: "2px" },
  meta: { fontSize: "12px", marginTop: "2px" },
  calls: { fontSize: "12px", marginTop: "4px" },
  badgeRow: { display: "flex", gap: "6px", marginTop: "6px" },
  fastBadge: { background: "#10b981", color: "white", padding: "2px 6px", borderRadius: "6px" },
  directBadge: { background: "#3b82f6", color: "white", padding: "2px 6px", borderRadius: "6px" },
  fewStopsBadge: { background: "#f59e0b", color: "white", padding: "2px 6px", borderRadius: "6px" },
  priceBlock: { textAlign: "right" },
  price: { fontSize: "24px", fontWeight: "700" },
  badge: { background: "#10b981", color: "white", padding: "2px 6px", borderRadius: "6px" },
  base: { marginTop: "10px" },
  serviceOnly: { fontSize: "13px", color: "#10b981" },
  validityLabel: { fontSize: "12px" },
  timelineWrapper: { display: "flex", gap: "4px", marginTop: "6px" },
  timelineItem: { display: "flex", flexDirection: "column", alignItems: "center" },
  block: { width: "20px", height: "14px", borderRadius: "3px" },
  label: { fontSize: "10px" },
  legend: { display: "flex", gap: "10px", fontSize: "11px", marginTop: "6px" },
  options: { marginTop: "10px" },
  option: { display: "block", marginTop: "6px" },
  button: {
    marginTop: "12px",
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    background: "#2563eb",
    color: "white"
  }
};