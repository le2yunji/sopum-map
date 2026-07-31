import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CourseListItem } from "./CourseListItem";

const DEFAULT_SHOP_IMAGE = "/images/profiles/shop_default.webp";

const DEFAULT_IMAGE_URLS = Array.from({ length: 4 }, () => DEFAULT_SHOP_IMAGE);

const meta = {
  title: "Components/UI/CourseListItem",
  component: CourseListItem,

  parameters: {
    layout: "centered",
  },

  decorators: [
    (Story) => {
      return (
        <div className="w-[390px] max-w-full bg-white px-4">
          <Story />
        </div>
      );
    },
  ],

  tags: ["autodocs"],

  argTypes: {
    id: {
      control: "text",
      description: "코스 고유 ID",
    },

    title: {
      control: "text",
      description: "코스 이름",
    },

    description: {
      control: "text",
      description: "코스에 포함된 매장 또는 이동 경로 설명",
    },

    imageUrls: {
      control: "object",
      description:
        "썸네일에 표시할 이미지 목록입니다. 최대 4개까지 표시합니다.",
    },

    tags: {
      control: "object",
      description: "코스의 특징을 나타내는 태그 목록입니다.",
    },
  },

  args: {
    id: "course-1",
    title: "망원동 소품샵 투어",
    description: "모모 소품샵 → 미미네 선물가게 → 키치 소품",
    imageUrls: DEFAULT_IMAGE_URLS,
    tags: ["컬러풀", "문구", "소품"],
  },
} satisfies Meta<typeof CourseListItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongTitle: Story = {
  args: {
    title: "성수동에서 발견하는 감성 인테리어 소품샵 산책 투어",
  },
};

export const LongDescription: Story = {
  args: {
    description:
      "오브젝트 성수 → 포인트오브뷰 → 모나미 스토어 → 대림창고 → 서울숲",
  },
};

export const OneImage: Story = {
  args: {
    imageUrls: [DEFAULT_SHOP_IMAGE],
  },
};

export const WithoutImages: Story = {
  args: {
    imageUrls: [],
  },
};

export const WithoutTags: Story = {
  args: {
    tags: [],
  },
};

export const ManyTags: Story = {
  args: {
    tags: ["미니멀", "인테리어", "문구", "캐릭터", "데이트", "소품"],
  },
};

export const InList: Story = {
  render: () => {
    const courses = [
      {
        id: "course-1",
        title: "망원동 소품샵 투어",
        description: "모모 소품샵 → 미미네 선물가게 → 키치 소품",
        imageUrls: DEFAULT_IMAGE_URLS,
        tags: ["컬러풀", "문구", "소품"],
      },
      {
        id: "course-2",
        title: "성수동 인테리어 소품 투어",
        description: "오브젝트 성수 → 포인트오브뷰 → 대림창고",
        imageUrls: DEFAULT_IMAGE_URLS,
        tags: ["미니멀", "인테리어", "소품"],
      },
      {
        id: "course-3",
        title: "서울숲 가챠 투어",
        description: "가챠가챠 → 모모가챠 → 가챠노리",
        imageUrls: DEFAULT_IMAGE_URLS,
        tags: ["캐릭터", "가챠", "소품"],
      },
    ];

    return (
      <ul aria-label="추천 산책 코스">
        {courses.map((course) => {
          return (
            <li key={course.id}>
              <CourseListItem {...course} />
            </li>
          );
        })}
      </ul>
    );
  },
};
