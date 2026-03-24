export function validatePartySize(
  partySize: number,
  minPeople: number | undefined,
  maxPeople: number | undefined,
  availablePlaces: number
): number {
  const effectiveMin = minPeople ?? 1;
  const effectiveMax = Math.min(maxPeople ?? Infinity, availablePlaces);
  
  if (partySize < effectiveMin) {
    return effectiveMin;
  }
  if (partySize > effectiveMax) {
    return effectiveMax;
  }
  return partySize;
}
