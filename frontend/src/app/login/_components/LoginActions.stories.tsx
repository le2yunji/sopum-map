import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { LoginActions } from "./LoginActions";

const meta = {
  title: "Pages/Login/LoginActions",
  component: LoginActions,
} satisfies Meta<typeof LoginActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AuthRequired: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/login",
        query: {
          returnTo: "/picks",
          reason: "auth-required",
        },
      },
    },
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("status"),
    ).toHaveTextContent("로그인이 필요합니다.");
  },
};

export const NormalEntry: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/login",
        query: {},
      },
    },
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByRole("status"),
    ).not.toBeInTheDocument();
  },
};
