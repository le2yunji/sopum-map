"use client";

import { FilterChipGroup } from "@/components/ui/FilterChipGroup/FilterChipGroup";

import { MAP_REGIONS, type MapRegion } from "../_constants/map.constants";

type MapRegionChipsProps = Readonly<{
  selectedRegion: MapRegion;
  onRegionChange: (region: MapRegion) => void;
}>;

export function MapRegionChips({
  selectedRegion,
  onRegionChange,
}: MapRegionChipsProps) {
  const items = MAP_REGIONS.map((region) => ({
    value: region.value,
    label: region.label,
  }));

  const handleValueChange = (value: string) => {
    onRegionChange(value as MapRegion);
  };

  return (
    <FilterChipGroup
      items={items}
      selectedValue={selectedRegion}
      ariaLabel="지역 선택"
      onValueChange={handleValueChange}
    />
  );
}
