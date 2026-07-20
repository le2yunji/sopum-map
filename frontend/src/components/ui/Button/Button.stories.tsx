import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "./Button";

const meta = {
  title: "Components/UI/Button",
  component: Button,

  parameters: {
    layout: "centered",
  },

  tags: ["autodocs"],

  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "ghost"],
      description: "버튼의 시각적 형태",
    },

    size: {
      control: "select",
      options: ["small", "medium", "large"],
      description: "버튼 크기",
    },

    fullWidth: {
      control: "boolean",
      description: "부모 요소의 전체 너비 사용 여부",
    },

    isLoading: {
      control: "boolean",
      description: "로딩 상태",
    },

    iconOnly: {
      control: "boolean",
      description: "텍스트 없이 아이콘만 표시하는 원형 버튼 여부",
    },

    disabled: {
      control: "boolean",
      description: "비활성 상태",
    },

    leftIcon: {
      control: false,
      description: "버튼 텍스트 왼쪽에 표시할 아이콘",
    },

    rightIcon: {
      control: false,
      description: "버튼 텍스트 오른쪽에 표시할 아이콘",
    },

    onClick: {
      action: "clicked",
    },
  },

  args: {
    children: "지도 둘러보기",
    variant: "primary",
    size: "medium",
    fullWidth: false,
    isLoading: false,
    iconOnly: false,
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "지도 둘러보기",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "내 픽 확인하기",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "취소",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "다음에 하기",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "선택할 수 없음",
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    children: "저장하기",
  },
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: "로그인",
  },

  parameters: {
    layout: "fullscreen",
  },

  decorators: [
    (Story) => (
      <div className="w-full max-w-97.5 bg-background p-5">
        <Story />
      </div>
    ),
  ],
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <Button size="small">Small 버튼</Button>
      <Button size="medium">Medium 버튼</Button>
      <Button size="large">Large 버튼</Button>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <Button leftIcon={<span>📍</span>}>지도에서 보기</Button>

      <Button variant="outline" rightIcon={<span>›</span>}>
        상세 정보
      </Button>
    </div>
  ),
};

export const IconOnly: Story = {
  args: {
    iconOnly: true,
    variant: "ghost",
    size: "medium",
    children: <span className="text-20">×</span>,
    "aria-label": "검색어 삭제",
  },
};

export const IconOnlySizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button
        iconOnly
        size="small"
        variant="outline"
        aria-label="작은 검색 버튼"
      >
        <span className="text-14">⌕</span>
      </Button>

      <Button
        iconOnly
        size="medium"
        variant="secondary"
        aria-label="현재 위치로 이동"
      >
        <span className="text-16">◎</span>
      </Button>

      <Button iconOnly size="large" variant="primary" aria-label="좋아요">
        <span className="text-18">♥</span>
      </Button>
    </div>
  ),
};

export const IconOnlyVariants: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button iconOnly variant="primary" aria-label="Primary 아이콘 버튼">
        <span>♥</span>
      </Button>

      <Button iconOnly variant="secondary" aria-label="Secondary 아이콘 버튼">
        <span>♥</span>
      </Button>

      <Button iconOnly variant="outline" aria-label="Outline 아이콘 버튼">
        <span>♥</span>
      </Button>

      <Button iconOnly variant="ghost" aria-label="Ghost 아이콘 버튼">
        <span>♥</span>
      </Button>
    </div>
  ),
};

export const IconOnlyLoading: Story = {
  args: {
    iconOnly: true,
    isLoading: true,
    variant: "primary",
    "aria-label": "처리 중",
  },
};
