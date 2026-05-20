import { DAVAO_HOSPITALS, Hospital } from "./hospitals";

export function findNearestHospitals(barangay: string, limit = 3): Hospital[] {
  if (!barangay) return DAVAO_HOSPITALS.slice(0, limit);

  const scored = DAVAO_HOSPITALS.map((h) => {
    const inNearest = h.nearestBarangays.some(
      (b) => b.toLowerCase() === barangay.toLowerCase()
    );
    return { hospital: h, score: inNearest ? 1 : 0 };
  });

  const matched = scored.filter((s) => s.score > 0).map((s) => s.hospital);

  if (matched.length >= limit) {
    const spmc = matched.find((h) => h.id === 1);
    const others = matched.filter((h) => h.id !== 1);
    const combined = spmc ? [spmc, ...others] : matched;
    return combined.slice(0, limit);
  }

  const fallback = DAVAO_HOSPITALS.filter(
    (h) => !matched.find((m) => m.id === h.id)
  );
  const spmc = DAVAO_HOSPITALS.find((h) => h.id === 1)!;
  const result = matched.includes(spmc)
    ? [...matched, ...fallback]
    : [spmc, ...matched, ...fallback];

  return result.slice(0, limit);
}

export type { Hospital };
