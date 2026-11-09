export type UserProfile = Readonly<{
  id: string;
  nickname: string;
  profileImage: string | null;
}>;

export type UpdateMyProfileRequest = Readonly<{
  nickname: string;
}>;
