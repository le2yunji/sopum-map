import { AuthGuard } from "@/components/auth/AuthGuard";

import { PicksScreen } from "./_components/PicksScreen";

export default function Page() {
  return (
    <AuthGuard returnTo="/picks">
      <PicksScreen />
    </AuthGuard>
  );
}
