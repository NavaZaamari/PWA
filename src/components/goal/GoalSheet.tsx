import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useSetGoal } from "@/hooks/api";
import { fa, t } from "@/i18n/fa";
import { faNum, toLatinDigits } from "@/lib/format";

export function GoalSheet({
  open,
  onOpenChange,
  uid,
  year,
  current,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  uid: string;
  year: number;
  current: number | null;
}) {
  const [value, setValue] = useState(String(current ?? 12));
  const setGoal = useSetGoal(uid);
  useEffect(() => {
    if (open) setValue(faNum(current ?? 12));
  }, [open, current]);

  const n = Number(toLatinDigits(value).replace(/\D/g, "")) || 0;
  const valid = n >= 1 && n <= 999;

  const save = () => {
    if (!valid) return;
    setGoal.mutate(
      { target: n, year },
      {
        onSuccess: () => {
          toast.success(fa.goal.saved);
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t(fa.goal.sheetTitle, { year: faNum(year) })}</DrawerTitle>
          <DrawerDescription>{fa.goal.sheetHint}</DrawerDescription>
        </DrawerHeader>
        <form
          className="flex items-center justify-center gap-4 px-5 py-6"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="یکی بیشتر"
            onClick={() => setValue(faNum(Math.min(999, n + 1)))}
          >
            <Plus />
          </Button>
          <label className="sr-only" htmlFor="goal-target">
            {fa.goal.label}
          </label>
          <input
            id="goal-target"
            inputMode="numeric"
            value={value}
            onChange={(e) => setValue(faNum(toLatinDigits(e.target.value).replace(/\D/g, "").slice(0, 3)))}
            className="h-20 w-32 rounded-2xl border border-input bg-straw text-center text-5xl font-extrabold text-pomegranate focus-visible:border-pomegranate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pomegranate/25"
          />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="یکی کمتر"
            onClick={() => setValue(faNum(Math.max(1, n - 1)))}
          >
            <Minus />
          </Button>
        </form>
        <DrawerFooter>
          <Button size="lg" disabled={!valid || setGoal.isPending} onClick={save}>
            {fa.common.save}
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {fa.common.cancel}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
