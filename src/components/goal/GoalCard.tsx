import { useQuery } from "@tanstack/react-query";
import { Pencil, Target } from "lucide-react";
import { useEffect, useState } from "react";

import { OliveBranch } from "@/components/brand/doodles";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { goalQuery } from "@/hooks/api";
import { fa, t } from "@/i18n/fa";
import { faNum, jalaliYear } from "@/lib/format";
import { Celebration } from "./Celebration";
import { GoalSheet } from "./GoalSheet";
import { goalMessage } from "./goal-logic";
import { ProgressRing } from "./ProgressRing";

const celebratedKey = (uid: string, year: number, target: number) =>
  `yoin:celebrated:${uid}:${year}:${target}`;

export function GoalCard({ uid }: { uid: string }) {
  const year = jalaliYear();
  const { data, isLoading } = useQuery(goalQuery(uid, year));
  const [open, setOpen] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const done = !!data?.target && data.read >= data.target;
  useEffect(() => {
    if (!done || !data?.target) return;
    const key = celebratedKey(uid, year, data.target);
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, "1");
      setCelebrate(true);
    }
  }, [done, data?.target, uid, year]);

  if (isLoading || !data) {
    return <Skeleton className="h-44 w-full rounded-3xl" />;
  }

  return (
    <section
      aria-labelledby="goal-title"
      className="relative overflow-hidden rounded-3xl border border-border bg-straw p-5 shadow-soft"
    >
      <OliveBranch className="pointer-events-none absolute -end-3 -top-2 h-9 w-auto opacity-50" />
      <div className="flex items-center gap-5">
        <ProgressRing
          value={data.target ? data.read / data.target : 0}
          label={fa.goal.title}
          className="shrink-0"
        >
          <span className="text-3xl font-extrabold leading-none text-pomegranate">{faNum(data.read)}</span>
          {data.target && (
            <span className="mt-1 text-xs text-olive-dark">
              {fa.common.of} {faNum(data.target)}
            </span>
          )}
        </ProgressRing>
        <div className="min-w-0 flex-1">
          <h2 id="goal-title" className="text-base font-bold">
            {t(fa.home.goalTitle, { year: faNum(year) })}
          </h2>
          {data.target ? (
            <p className="mt-1 text-sm font-semibold text-night">
              {t(fa.goal.progress, { x: faNum(data.read), y: faNum(data.target) })}
            </p>
          ) : null}
          <p className="mt-1 text-sm text-olive-dark">{goalMessage(data.read, data.target)}</p>
          <Button
            variant={data.target ? "ghost" : "default"}
            size="sm"
            className="mt-3 -ms-2"
            onClick={() => setOpen(true)}
          >
            {data.target ? <Pencil /> : <Target />}
            {data.target ? fa.goal.edit : fa.goal.set}
          </Button>
        </div>
      </div>
      {(celebrate || done) && (
        <div className="mt-4 border-t border-border pt-4">
          <Celebration burst={celebrate} label={fa.goal.celebrate} />
        </div>
      )}
      <GoalSheet open={open} onOpenChange={setOpen} uid={uid} year={year} current={data.target} />
    </section>
  );
}
