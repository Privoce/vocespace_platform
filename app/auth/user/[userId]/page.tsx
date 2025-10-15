import { UserProfile } from "./profile";

export default function UserPage({ params }: { params: { userId: string } }) {
  return <UserProfile userId={params.userId} />;
}
