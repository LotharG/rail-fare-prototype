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
  return ah * 60 + am - (dh * 60 + dm);
}

function formatDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
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

  useEffect(() => {
    if (selected) {
      onPriceChange({ total });
    }
  }, [selected, total, onPriceChange]);

  useEffect(() => {
    if (!selected) {
      setAddFlex(false);
      setAddAnytime(false);
      setAddFirst(false);
    }
  }, [selected]);

  return (
    <div style={styles.card}>
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

          <div style={styles.badges}>
            {isFastest && <span style={styles.green}>Fastest</span>}
            {stops === 0 && <span style={styles.blue}>Direct</span>}
          </div>
        </div>

        <div>
          {isCheapest && <div style={styles.green}>Cheapest</div>}
          <div style={styles.price}>£{total}</div>
        </div>
      </div>

      {/* VALIDITY */}
      <div style={styles.section}>
        <p>
          ✔ This fare is valid on this train only
        </p>
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
                setAddFlex(!addFlex);
                setAddAnytime(false);
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
                setAddAnytime(!addAnytime);
                setAddFlex(false);
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
      <button onClick={onSelect} style={styles.primary}>
        {selected ? "Selected ✓" : "Select"}
      </button>

      {/* POST SELECT */}
      {selected && (
        <div style={styles.section}>
          <button style={styles.secondary}>Add return</button>
          <button style={styles.secondary}>Add another journey</button>

          <button onClick={onContinue} style={styles.dark}>
            Continue to basket →
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "16px"
  },
  row: {
    display: "flex",
    justifyContent: "space-between"
  },
  time: { fontSize: "18px", fontWeight: "600" },
  route: { fontSize: "14px" },
  duration: { fontSize: "13px" },
  badges: { marginTop: "5px", display: "flex", gap: "6px" },
  green: { background: "#16a34a", color: "white", padding: "2px 6px", borderRadius: "5px" },
  blue: { background: "#2563eb", color: "white", padding: "2px 6px", borderRadius: "5px" },
  price: { fontSize: "22px", fontWeight: "700" },
  section: { marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px" },
  option: { display: "flex", gap: "8px", alignItems: "center" },
  primary: {
    marginTop: "12px",
    width: "100%",
    padding: "10px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px"
  },
  secondary: {
    padding: "8px",
    background: "#f3f4f6",
    border: "1px solid #ddd",
    borderRadius: "6px"
  },
  dark: {
    padding: "10px",
    background: "#111827",
    color: "white",
    border: "none",
    borderRadius: "6px",
    marginTop: "6px"
  }
};