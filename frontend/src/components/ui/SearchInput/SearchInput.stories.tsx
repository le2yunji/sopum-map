import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { SearchInput } from "./SearchInput";

const meta = {
  title: "Components/UI/SearchInput",
  component: SearchInput,

  parameters: {
    layout: "centered",
  },

  decorators: [
    (Story) => (
      <div className="w-100 p-5">
        <Story />
      </div>
    ),
  ],

  tags: ["autodocs"],

  argTypes: {
    value: {
      control: "text",
      description: "제어 컴포넌트로 사용할 때의 검색어",
    },

    defaultValue: {
      control: "text",
      description: "비제어 컴포넌트의 초기 검색어",
    },

    placeholder: {
      control: "text",
      description: "검색창 안내 문구",
    },

    size: {
      control: "select",
      options: ["small", "medium", "large"],
      description: "검색창 크기",
    },

    fullWidth: {
      control: "boolean",
      description: "부모 요소의 전체 너비 사용 여부",
    },

    isLoading: {
      control: "boolean",
      description: "검색 중 상태",
    },

    showClearButton: {
      control: "boolean",
      description: "검색어 초기화 버튼 표시 여부",
    },

    disabled: {
      control: "boolean",
      description: "검색창 비활성화 여부",
    },

    readOnly: {
      control: "boolean",
      description: "검색창 읽기 전용 여부",
    },

    onValueChange: {
      description: "검색어가 변경될 때 실행",
    },

    onSearch: {
      description: "Enter 입력 또는 검색 실행 시 호출",
    },

    onClear: {
      description: "검색어 초기화 시 호출",
    },
  },

  args: {
    placeholder: "소품샵이나 지역을 검색해 보세요",
    size: "medium",
    fullWidth: true,
    isLoading: false,
    showClearButton: true,
    disabled: false,
    readOnly: false,
    onValueChange: fn(),
    onSearch: fn(),
    onClear: fn(),
  },
} satisfies Meta<typeof SearchInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDefaultValue: Story = {
  args: {
    defaultValue: "성수 소품샵",
  },
};

export const Small: Story = {
  args: {
    size: "small",
  },
};

export const Large: Story = {
  args: {
    size: "large",
  },
};

export const Loading: Story = {
  args: {
    defaultValue: "홍대 굿즈샵",
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: "검색할 수 없습니다",
    disabled: true,
  },
};

export const ReadOnly: Story = {
  args: {
    defaultValue: "부산 소품샵",
    readOnly: true,
  },
};

export const WithoutClearButton: Story = {
  args: {
    defaultValue: "서면 소품샵",
    showClearButton: false,
  },
};

export const CustomWidth: Story = {
  args: {
    fullWidth: false,
  },

  decorators: [
    (Story) => (
      <div className="w-[500px]">
        <Story />
      </div>
    ),
  ],
};

function ControlledSearchInput(args: ComponentProps<typeof SearchInput>) {
  const [value, setValue] = useState("");

  const handleValueChange = (nextValue: string) => {
    setValue(nextValue);
    args.onValueChange?.(nextValue);
  };

  return (
    <div className="space-y-3">
      <SearchInput {...args} value={value} onValueChange={handleValueChange} />

      <p className="text-sm text-gray-500">현재 검색어: {value || "없음"}</p>
    </div>
  );
}

export const Controlled: Story = {
  render: (args) => <ControlledSearchInput {...args} />,
};

export const Interaction: Story = {
  args: {
    onSearch: fn(),
    onClear: fn(),
  },

  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const searchInput = canvas.getByRole("searchbox");

    await userEvent.type(searchInput, "성수 소품샵");
    await userEvent.keyboard("{Enter}");

    await expect(args.onSearch).toHaveBeenCalledWith("성수 소품샵");

    const clearButton = canvas.getByRole("button", {
      name: "검색어 지우기",
    });

    await userEvent.click(clearButton);

    await expect(searchInput).toHaveValue("");
    await expect(args.onClear).toHaveBeenCalled();
  },
};
