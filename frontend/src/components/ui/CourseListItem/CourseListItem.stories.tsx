import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { PublicCourseListItem } from "@sopum-map/shared";
import { expect, within } from "storybook/test";

import { DEFAULT_IMAGES } from "@/constants/image.constants";

import { CourseListItem } from "./CourseListItem";

const createImageUrls = (count: number) => {
  return Array.from({ length: count }, (_, index) => {
    return `${DEFAULT_IMAGES.shop}?course-image=${index}`;
  });
};

const baseCourse = {
  id: "course-1",
  courseType: "user_created",
  title: "망원동 소품샵 투어",
  description: "천천히 걷기 좋은 소품샵 코스",
  regionGroup: "mangwon",
  imageUrls: createImageUrls(4),
  representativeTagKeys: ["stationery", "cute"],
  author: {
    id: "user-1",
    displayName: "소품산책가",
    profileImageUrl: null,
    isService: false,
  },
  likeCount: 28,
  isOfficialPick: false,
  createdAt: "2026-11-13T00:00:00.000Z",
} satisfies PublicCourseListItem;

const meta = {
  title: "Components/UI/CourseListItem",
  component: CourseListItem,
  decorators: [
    (Story) => {
      return (
        <div data-testid="course-story" className="w-full bg-white px-4">
          <Story />
        </div>
      );
    },
  ],
  args: {
    course: baseCourse,
    imageLoading: "eager",
  },
} satisfies Meta<typeof CourseListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UserCourse: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("by 소품산책가")).toBeVisible();
    await expect(canvas.queryByText("소품지도 Pick")).not.toBeInTheDocument();
    await expect(canvas.getByLabelText("좋아요 28개")).toBeVisible();

    for (const image of canvas.getAllByRole("img")) {
      await expect(image).toHaveAttribute("loading", "eager");
    }
  },
};

export const OneImage: Story = {
  args: {
    course: {
      ...baseCourse,
      imageUrls: createImageUrls(1),
    },
  },
};

export const TwoImages: Story = {
  args: {
    course: {
      ...baseCourse,
      imageUrls: createImageUrls(2),
    },
  },
};

export const ThreeImages: Story = {
  args: {
    course: {
      ...baseCourse,
      imageUrls: createImageUrls(3),
    },
  },
};

export const FourImages: Story = {
  args: {
    course: {
      ...baseCourse,
      imageUrls: createImageUrls(4),
    },
  },
};

export const RecommendedCourse: Story = {
  args: {
    course: {
      ...baseCourse,
      courseType: "recommended",
      author: {
        id: null,
        displayName: "소품지도",
        profileImageUrl: null,
        isService: true,
      },
      isOfficialPick: true,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("by 소품지도")).toBeVisible();
    await expect(canvas.queryByText("소품지도 Pick")).not.toBeInTheDocument();
  },
};

export const OfficialPickCourse: Story = {
  args: {
    course: {
      ...baseCourse,
      isOfficialPick: true,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("소품지도 Pick")).toBeVisible();
  },
};

export const LimitsImagesAndTags: Story = {
  args: {
    course: {
      ...baseCourse,
      imageUrls: createImageUrls(5),
      representativeTagKeys: ["stationery", "cute", "vintage"],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByRole("img")).toHaveLength(4);
    await expect(canvas.getByText("문구")).toBeVisible();
    await expect(canvas.getByText("아기자기")).toBeVisible();
    await expect(canvas.queryByText("빈티지")).not.toBeInTheDocument();
  },
};

export const WithoutDescription: Story = {
  args: {
    course: {
      ...baseCourse,
      description: null,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("by 소품산책가")).toBeVisible();
    await expect(canvas.queryByText("·")).not.toBeInTheDocument();
  },
};

export const WithoutImagesAndTags: Story = {
  args: {
    course: {
      ...baseCourse,
      imageUrls: [],
      representativeTagKeys: [],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByRole("img")).toHaveLength(1);
    await expect(canvas.getByText("망원")).toBeVisible();
  },
};

export const LongContentAt320: Story = {
  globals: {
    viewport: {
      value: "sopumSmall",
      isRotated: false,
    },
  },
  args: {
    course: {
      ...baseCourse,
      title:
        "망원동 골목을 천천히 걸으며 오래 기억하고 싶은 소품을 발견하는 산책 코스",
      description:
        "작은 상점을 하나씩 둘러보며 문구와 인테리어 소품을 발견하는 긴 설명입니다.",
      author: {
        ...baseCourse.author,
        displayName: "매우긴닉네임을사용하는소품산책가",
      },
      isOfficialPick: true,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const story = canvas.getByTestId("course-story");

    await expect(story.scrollWidth).toBeLessThanOrEqual(story.clientWidth);
  },
};
