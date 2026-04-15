"use client";

import { useState } from "react";
import data from "../data/journeys.json";
import JourneyCard from "../components/JourneyCard";
import { getCheapestFare } from "../lib/pricing";

function getDurationMinutes(dep, arr) {
  const [dh, dm] = dep.split(":").map(Number);
  const [ah, am] = arr.split(":").map(Number);
  return (ah * 60 + am) - (dh * 60 + dm);
}

export default function Home() {
  const [selectedJourney, setSelectedJourney] = useState(null);
  const [total, setTotal] = useState(0);

  const cheapestPrice = Math.min(
    ...data.journeys.map(j => getCheapestFare(j.fares).price)
  );

  const fastestDuration = Math.min(
    ...data.journeys.map(j =>
      getDurationMinutes(j.departure, j.arrival)
    )
  );

  return (
    <div style={styles.container}>
      <h1>MPR Team UI Prototype</h1>

      {data.journeys.map(journey => {
        const basePrice = getCheapestFare(journey.fares).price;

        return (
          <JourneyCard
            key={journey.id}
            journey={journey}
            selected={selectedJourney?.id === journey.id}
            isCheapest={basePrice === cheapestPrice}
            fastestDuration={fastestDuration}
            onSelect={() => {
              setSelectedJourney(journey);
              setTotal(basePrice);
            }}
            onPriceChange={(p) => setTotal(p.total)}
          />
        );
      })}

      {selectedJourney && (
        <div style={styles.summary}>
          Total: £{total}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "20px", background: "#f5f5f5" },
  summary: { marginTop: "20px", padding: "16px", background: "#fff", fontSize: "22px" }
};