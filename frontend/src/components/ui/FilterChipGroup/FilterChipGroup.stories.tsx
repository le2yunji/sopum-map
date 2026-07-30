import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { fn } from "storybook/test";

import { FilterChipGroup } from "./FilterChipGroup";
import type { FilterChipGroupProps } from "./FilterChipGroup.types";

const regionItems = [
  { label: "전체", value: "all" },
  { label: "서울", value: "seoul" },
  { label: "경기", value: "gyeonggi" },
  { label: "인천", value: "incheon" },
  { label: "부산", value: "busan" },
  { label: "대구", value: "daegu" },
  { label: "광주", value: "gwangju" },
  { label: "대전", value: "daejeon" },
];

const tagItems = [
  { label: "빈티지", value: "vintage" },
  { label: "캐릭터", value: "character" },
  { label: "문구", value: "stationery" },
  { label: "인테리어", value: "interior" },
  { label: "핸드메이드", value: "handmade" },
  { label: "가챠", value: "gacha" },
  { label: "굿즈", value: "goods" },
];

const ControlledFilterChipGroup = (args: FilterChipGroupProps) => {
  const [selectedValue, setSelectedValue] = useState(args.selectedValue);

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    args.onValueChange(value);
  };

  return (
    <FilterChipGroup
      {...args}
      selectedValue={selectedValue}
      onValueChange={handleValueChange}
    />
  );
};

const meta = {
  title: "Components/UI/FilterChipGroup",
  component: FilterChipGroup,

  parameters: {
    layout: "centered",
  },

  tags: ["autodocs"],

  argTypes: {
    items: {
      control: "object",
      description: "메뉴에 표시할 항목 목록",
    },

    selectedValue: {
      control: "text",
      description: "현재 선택된 항목의 value",
    },

    ariaLabel: {
      control: "text",
      description: "버튼 그룹의 접근성 이름",
    },

    onValueChange: {
      description: "항목을 선택했을 때 실행되는 함수",
    },

    className: {
      control: "text",
      description: "외부에서 추가할 클래스 이름",
    },
  },

  args: {
    items: regionItems,
    selectedValue: "all",
    ariaLabel: "지역 선택",
    onValueChange: fn(),
  },

  render: (args) => (
    <div className="w-[375px]">
      <ControlledFilterChipGroup {...args} />
    </div>
  ),
} satisfies Meta<typeof FilterChipGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Region: Story = {
  args: {
    items: regionItems,
    selectedValue: "seoul",
    ariaLabel: "지역 선택",
  },
};

export const Tag: Story = {
  args: {
    items: tagItems,
    selectedValue: "character",
    ariaLabel: "태그 선택",
  },
};

export const NoSelectedItem: Story = {
  args: {
    items: tagItems,
    selectedValue: "",
    ariaLabel: "태그 선택",
  },
};

export const LongScrollableList: Story = {
  args: {
    items: [
      ...regionItems,
      { label: "울산", value: "ulsan" },
      { label: "세종", value: "sejong" },
      { label: "강원", value: "gangwon" },
      { label: "충북", value: "chungbuk" },
      { label: "충남", value: "chungnam" },
      { label: "전북", value: "jeonbuk" },
      { label: "전남", value: "jeonnam" },
      { label: "경북", value: "gyeongbuk" },
      { label: "경남", value: "gyeongnam" },
      { label: "제주", value: "jeju" },
    ],
    selectedValue: "all",
    ariaLabel: "전체 지역 선택",
  },
};
