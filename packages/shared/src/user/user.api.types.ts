export type UserProfile = Readonly<{
  id: string;
  nickname: string;
  profileImage: string | null;
}>;

export type UpdateMyProfileRequest = Readonly<{
  nickname: string;
}>;

/** 로그인 사용자의 마이페이지 활동 집계입니다. */
export type MyActivitySummaryData = Readonly<{
  createdCourseCount: number;
  visitLogCount: number;
  visitedShopCount: number;
}>;
