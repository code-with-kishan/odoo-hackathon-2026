import type { TripStatus } from "@/lib/domain/enums";

export const transitionMap: Record<TripStatus, TripStatus[]> = {
  DRAFT: ["DISPATCHED", "CANCELLED"],
  DISPATCHED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransition(from: TripStatus, to: TripStatus) {
  return transitionMap[from]?.includes(to) ?? false;
}
