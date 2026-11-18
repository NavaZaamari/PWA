import { Check, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useRemoveFromShelf, useSetShelf } from "@/hooks/api";
import { fa, t } from "@/i18n/fa";
import { SHELVES, type Book, type ShelfId } from "@/lib/api";
import { cn } from "@/lib/utils";
import { SHELF_META } from "./shelf-meta";

/** Single control to place a book on exactly one of the 4 shelves. */
export function ShelfSheet({
  book,
  uid,
  current,
  trigger,
  open,
  onOpenChange,
}: {
  book: Book;
  uid: string;
  current: ShelfId | null;
  trigger?: ReactNode;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const setShelf = useSetShelf(uid);
  const remove = useRemoveFromShelf(uid);

  const choose = (shelf: ShelfId, close: () => void) => {
    if (shelf === current) return close();
    setShelf.mutate(
      { bookId: book.id, shelf },
      {
        onSuccess: () => {
          toast.success(t(fa.shelves.moved, { shelf: SHELF_META[shelf].label }));
          close();
        },
      },
    );
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{fa.book.chooseShelf}</DrawerTitle>
          <DrawerDescription>{book.titleFa}</DrawerDescription>
        </DrawerHeader>
        <ShelfOptions
          current={current}
          pending={setShelf.isPending || remove.isPending}
          onChoose={(s) => choose(s, () => onOpenChange(false))}
          onRemove={
            current
              ? () =>
                  remove.mutate(book.id, {
                    onSuccess: () => {
                      toast(fa.shelves.removed);
                      onOpenChange(false);
                    },
                  })
              : undefined
          }
        />
      </DrawerContent>
    </Drawer>
  );
}

function ShelfOptions({
  current,
  pending,
  onChoose,
  onRemove,
}: {
  current: ShelfId | null;
  pending: boolean;
  onChoose: (s: ShelfId) => void;
  onRemove?: (() => void) | undefined;
}) {
  return (
    <div className="space-y-2 px-5 pb-6 pt-2" role="radiogroup" aria-label={fa.book.chooseShelf}>
      {SHELVES.map((s) => {
        const { label, icon: Icon } = SHELF_META[s];
        const active = s === current;
        return (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={pending}
            onClick={() => onChoose(s)}
            className={cn(
              "tap flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-start font-semibold transition-colors",
              active
                ? "border-pomegranate bg-pomegranate/8 text-pomegranate"
                : "border-border bg-straw/60 text-night hover:bg-straw",
            )}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden />
            <span className="flex-1">{label}</span>
            {active && <Check className="h-5 w-5" aria-hidden />}
          </button>
        );
      })}
      {onRemove && (
        <Button variant="ghost" className="w-full text-rose hover:text-rose" disabled={pending} onClick={onRemove}>
          <Trash2 />
          {fa.book.removeFromShelf}
        </Button>
      )}
    </div>
  );
}
