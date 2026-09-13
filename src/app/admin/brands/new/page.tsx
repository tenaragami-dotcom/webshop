import { BrandForm } from "@/components/admin/BrandForm";
import { createBrand } from "@/app/admin/actions";

export default function NewBrandPage() {
  return (
    <div>
      <h1 className="font-display text-2xl">新規ブランド登録</h1>
      <BrandForm action={createBrand} />
    </div>
  );
}
