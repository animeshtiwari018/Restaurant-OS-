import React from 'react';

export function DishCardSkeleton() {
  return (
    <div className="bg-surface-lowest rounded-2xl p-4 shadow-sm border border-hairline flex flex-col gap-3 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        {/* Left Info Column */}
        <div className="flex-1 min-w-0">
          {/* Dietary Indicator & Name skeleton */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded-sm bg-surface-container" />
            <div className="h-3 w-16 rounded-full bg-surface-container" />
          </div>

          {/* Dish Name */}
          <div className="h-5 w-4/5 rounded-lg bg-surface-container mb-2" />

          {/* Description lines */}
          <div className="space-y-1.5 mt-1">
            <div className="h-3 w-full rounded bg-surface-container" />
            <div className="h-3 w-3/4 rounded bg-surface-container" />
          </div>

          {/* Price */}
          <div className="mt-3 flex items-center gap-2">
            <div className="h-5 w-20 rounded-md bg-surface-container" />
            <div className="h-3 w-14 rounded bg-surface-container" />
          </div>
        </div>

        {/* Right Thumbnail Image Skeleton */}
        <div className="w-24 h-24 rounded-xl bg-surface-container flex-shrink-0" />
      </div>

      {/* Nutritional Pill Skeleton */}
      <div className="bg-surface-container/50 rounded-xl p-2 grid grid-cols-4 gap-1">
        <div className="h-7 rounded-lg bg-surface-lowest" />
        <div className="h-7 rounded-lg bg-surface-lowest" />
        <div className="h-7 rounded-lg bg-surface-lowest" />
        <div className="h-7 rounded-lg bg-surface-lowest" />
      </div>

      {/* Bottom Bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="h-4 w-28 rounded bg-surface-container" />
        <div className="h-9 w-20 rounded-full bg-surface-container" />
      </div>
    </div>
  );
}

export default function MenuSkeleton() {
  return (
    <div className="px-4 flex flex-col gap-3 mt-3 animate-pulse">
      {/* Search Input Bar Skeleton */}
      <div className="w-full h-11 rounded-2xl bg-surface-lowest border border-hairline flex items-center px-3.5 gap-2.5">
        <div className="w-5 h-5 rounded-full bg-surface-container" />
        <div className="h-3.5 w-48 rounded bg-surface-container" />
      </div>

      {/* Dietary Micro-Toggles Skeleton */}
      <div className="flex items-center gap-2 overflow-x-hidden py-1">
        <div className="h-8 w-20 rounded-full bg-surface-lowest border border-hairline flex-shrink-0" />
        <div className="h-8 w-24 rounded-full bg-surface-lowest border border-hairline flex-shrink-0" />
        <div className="h-8 w-24 rounded-full bg-surface-lowest border border-hairline flex-shrink-0" />
        <div className="h-8 w-28 rounded-full bg-surface-lowest border border-hairline flex-shrink-0" />
      </div>

      {/* Category Pills Skeleton */}
      <div className="flex items-center gap-2 overflow-x-hidden py-1 border-b border-hairline pb-2">
        <div className="h-7 w-20 rounded-xl bg-primary/20 flex-shrink-0" />
        <div className="h-7 w-20 rounded-xl bg-surface-container flex-shrink-0" />
        <div className="h-7 w-28 rounded-xl bg-surface-container flex-shrink-0" />
        <div className="h-7 w-24 rounded-xl bg-surface-container flex-shrink-0" />
      </div>

      {/* Dishes Feed Skeletons */}
      <div className="flex flex-col gap-3.5 pt-1">
        <DishCardSkeleton />
        <DishCardSkeleton />
        <DishCardSkeleton />
      </div>
    </div>
  );
}
