import { UserButton } from "@clerk/nextjs";

export default async function Home() {
  return (
    <h1 className="text-red-500">
      <UserButton />
    </h1>
  );
}
