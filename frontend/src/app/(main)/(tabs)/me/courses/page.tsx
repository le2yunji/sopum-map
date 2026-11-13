import { AuthGuard } from "@/components/auth/AuthGuard";

import { MyCoursesScreen } from "./_components/MyCoursesScreen";

export default function Page() {
  return (
    <AuthGuard returnTo="/me/courses">
      <MyCoursesScreen />
    </AuthGuard>
  );
}
