import type { ShopBusinessDay, ShopBusinessHour } from "@sopum-map/shared";

const BUSINESS_DAY_LABELS: Record<ShopBusinessDay, string> = {
  monday: "월",
  tuesday: "화",
  wednesday: "수",
  thursday: "목",
  friday: "금",
  saturday: "토",
  sunday: "일",
};

export type BusinessHourGroup = Readonly<{
  days: ShopBusinessDay[];
  dayLabel: string;
  isClosed: boolean;
  periods: ShopBusinessHour["periods"];
}>;

/** 두 영업시간이 동일한지 비교합니다. */
function isSameBusinessHour(a: ShopBusinessHour, b: ShopBusinessHour): boolean {
  if (a.isClosed !== b.isClosed) {
    return false;
  }

  if (a.periods.length !== b.periods.length) {
    return false;
  }

  return a.periods.every((period, index) => {
    const otherPeriod = b.periods[index];

    return (
      otherPeriod !== undefined &&
      period.open === otherPeriod.open &&
      period.close === otherPeriod.close
    );
  });
}

/** 연속된 동일 영업시간의 요일을 하나의 그룹으로 묶습니다. */
export function groupBusinessHours(
  businessHours: readonly ShopBusinessHour[],
): BusinessHourGroup[] {
  if (businessHours.length === 0) {
    return [];
  }

  const groups: ShopBusinessHour[][] = [];

  for (const businessHour of businessHours) {
    const currentGroup = groups.at(-1);
    const previousHour = currentGroup?.at(-1);

    if (
      currentGroup &&
      previousHour &&
      isSameBusinessHour(previousHour, businessHour)
    ) {
      currentGroup.push(businessHour);
      continue;
    }

    groups.push([businessHour]);
  }

  return groups.map((group) => {
    const first = group[0];
    const last = group.at(-1);

    if (!first || !last) {
      throw new Error("영업시간 그룹이 비어 있습니다.");
    }

    const firstLabel = BUSINESS_DAY_LABELS[first.day];
    const lastLabel = BUSINESS_DAY_LABELS[last.day];

    return {
      days: group.map(({ day }) => day),

      dayLabel:
        group.length === 1
          ? firstLabel
          : `${firstLabel}요일 ~ ${lastLabel}요일`,

      isClosed: first.isClosed,
      periods: first.periods,
    };
  });
}

export function formatBusinessPeriods(group: BusinessHourGroup): string {
  if (group.isClosed) {
    return "휴무";
  }

  if (
    group.periods.length === 1 &&
    group.periods[0]?.open === "00:00" &&
    group.periods[0]?.close === "24:00"
  ) {
    return "24시간";
  }

  return group.periods
    .map(({ open, close }) => `${open} - ${close}`)
    .join(" / ");
}

export function formatClosedDays(
  businessHours: readonly ShopBusinessHour[],
): string {
  const closedDays = businessHours
    .filter((businessHour) => businessHour.isClosed)
    .map((businessHour) => businessHour.day);

  if (closedDays.length === 0) {
    return "없음";
  }

  const groups: ShopBusinessDay[][] = [];

  for (const day of closedDays) {
    const currentGroup = groups.at(-1);

    if (!currentGroup) {
      groups.push([day]);
      continue;
    }

    const previousDay = currentGroup.at(-1);

    if (!previousDay) {
      groups.push([day]);
      continue;
    }

    const dayOrder: ShopBusinessDay[] = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    const previousIndex = dayOrder.indexOf(previousDay);
    const currentIndex = dayOrder.indexOf(day);

    if (currentIndex === previousIndex + 1) {
      currentGroup.push(day);
    } else {
      groups.push([day]);
    }
  }

  return groups
    .map((group) => {
      const first = group[0];
      const last = group.at(-1);

      if (!first || !last) {
        return "";
      }

      if (group.length === 1) {
        return `${BUSINESS_DAY_LABELS[first]}요일`;
      }

      return `${BUSINESS_DAY_LABELS[first]}요일 ~ ${BUSINESS_DAY_LABELS[last]}요일`;
    })
    .filter(Boolean)
    .join(", ");
}
