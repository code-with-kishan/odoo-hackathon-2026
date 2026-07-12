import { TripStatus } from "@prisma/client";

export const transitionMap: Record<TripStatus, TripStatus[]> = {
  DRAFT: [TripStatus.DISPATCHED, TripStatus.CANCELLED],
  DISPATCHED: [TripStatus.COMPLETED, TripStatus.CANCELLED],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransition(from: TripStatus, to: TripStatus) {
  return transitionMap[from].includes(to);
}
