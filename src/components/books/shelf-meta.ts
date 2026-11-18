import { BookCheck, BookHeart, BookOpen, BookX, type LucideIcon } from "lucide-react";

import type { ShelfId } from "@/lib/api";
import { fa } from "@/i18n/fa";

export const SHELF_META: Record<ShelfId, { label: string; icon: LucideIcon }> = {
  want: { label: fa.shelves.want, icon: BookHeart },
  reading: { label: fa.shelves.reading, icon: BookOpen },
  read: { label: fa.shelves.read, icon: BookCheck },
  dnf: { label: fa.shelves.dnf, icon: BookX },
};
