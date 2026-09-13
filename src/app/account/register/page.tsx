import { RegisterForm } from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <p className="text-xs tracking-wide-jp text-gold">REGISTER</p>
      <h1 className="font-display mt-2 text-2xl">新規会員登録</h1>
      <RegisterForm />
    </div>
  );
}
