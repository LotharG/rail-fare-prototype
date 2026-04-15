export function getCheapestFare(fares) {
  return fares.reduce((min, fare) =>
    fare.price < min.price ? fare : min
  );
}

export function getStandardFares(fares) {
  return fares.filter(f => f.class === "standard");
}

export function getFirstClassFare(fares) {
  return fares.find(f => f.class === "first" && f.type === "advance");
}

export function buildFlexibilityLadder(fares) {
  const order = ["advance", "off_peak", "anytime"];

  const standard = getStandardFares(fares);

  const sorted = order
    .map(type => standard.find(f => f.type === type))
    .filter(Boolean);

  return sorted.map((fare, i) => {
    if (i === 0) return { ...fare, delta: 0 };

    const delta = fare.price - sorted[0].price;
    return { ...fare, delta };
  });
}