import { fa } from "@/i18n/fa";

/** Gentle encouragement based on progress ratio. */
export function goalMessage(read: number, target: number | null): string {
  if (!target) return fa.goal.none;
  if (read >= target) return fa.goal.msgDone;
  const r = read / target;
  if (read === 0) return fa.goal.msgStart;
  if (r < 0.4) return fa.goal.msgEarly;
  if (r < 0.8) return fa.goal.msgMid;
  return fa.goal.msgLate;
}
