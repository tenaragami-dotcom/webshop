import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <p className="text-xs tracking-wide-jp text-gold">LOGIN</p>
      <h1 className="font-display mt-2 text-2xl">マイページログイン</h1>
      <LoginForm callbackUrl={callbackUrl ?? "/account"} />
    </div>
  );
}
