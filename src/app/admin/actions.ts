"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

function slugify(name: string, id: number) {
  return `custom-${id}-${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}`;
}

async function nextProductSlugNumber() {
  const products = await prisma.product.findMany({ select: { slug: true } });
  const max = products.reduce((max, p) => {
    const match = p.slug.match(/^custom-(\d+)-/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return max + 1;
}

function extractImages(formData: FormData, fallbackBase: string) {
  const seeds = formData.getAll("imageSeed").map(String);
  const urls = formData.getAll("imageUrl").map(String);
  const images = seeds.map((seed, i) => ({ seed, url: urls[i] || null }));
  if (images.length === 0) {
    return [0, 1, 2].map((i) => ({ seed: `${fallbackBase}-${i}`, url: null }));
  }
  return images;
}

function extractRentalSettings(formData: FormData) {
  const rentalBaseDaysRaw = String(formData.get("rentalBaseDays") ?? "");
  const rentalExtensionPricePerDayRaw = String(formData.get("rentalExtensionPricePerDay") ?? "");
  const rentalMaxExtensionDaysRaw = String(formData.get("rentalMaxExtensionDays") ?? "");
  const tryOnPlanPriceRaw = String(formData.get("tryOnPlanPrice") ?? "");
  const tryOnPlanDaysRaw = String(formData.get("tryOnPlanDays") ?? "");

  return {
    rentalBaseDays: rentalBaseDaysRaw ? Number(rentalBaseDaysRaw) : 4,
    rentalExtensionPricePerDay: rentalExtensionPricePerDayRaw
      ? Number(rentalExtensionPricePerDayRaw)
      : null,
    rentalMaxExtensionDays: rentalMaxExtensionDaysRaw ? Number(rentalMaxExtensionDaysRaw) : 14,
    tryOnPlanPrice: tryOnPlanPriceRaw ? Number(tryOnPlanPriceRaw) : null,
    tryOnPlanDays: tryOnPlanDaysRaw ? Number(tryOnPlanDaysRaw) : 4,
  };
}

function extractVariants(formData: FormData) {
  const names = formData.getAll("variantName").map(String);
  const colors = formData.getAll("variantColorHex").map(String);
  const stocks = formData.getAll("variantStock").map(String);
  return names
    .map((name, i) => ({
      name: name.trim(),
      colorHex: colors[i] || null,
      stockQuantity: Math.max(0, Number(stocks[i]) || 0),
    }))
    .filter((v) => v.name);
}

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "").replace(/\r\n/g, "\n");
  const brandId = String(formData.get("brandId") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "");
  const priceSellRaw = String(formData.get("priceSell") ?? "");
  const priceRentalRaw = String(formData.get("priceRental") ?? "");
  const stockQuantity = Number(formData.get("stockQuantity") ?? 1);
  const status = String(formData.get("status") ?? "ACTIVE") as
    | "ACTIVE"
    | "SOLD_OUT"
    | "DRAFT";

  const priceSell = priceSellRaw ? Number(priceSellRaw) : null;
  const priceRental = priceRentalRaw ? Number(priceRentalRaw) : null;
  const rentalSettings = extractRentalSettings(formData);

  const nextId = await nextProductSlugNumber();
  const product = await prisma.product.create({
    data: {
      name,
      slug: slugify(name, nextId),
      description,
      brandId,
      categoryId,
      priceSell,
      priceRental,
      isSellable: priceSell !== null,
      isRentable: priceRental !== null,
      stockQuantity,
      status,
      ...rentalSettings,
    },
  });

  const images = extractImages(formData, product.slug);
  await prisma.productImage.createMany({
    data: images.map((img, i) => ({
      productId: product.id,
      seed: img.seed,
      url: img.url,
      order: i,
    })),
  });

  const variants = extractVariants(formData);
  if (variants.length > 0) {
    await prisma.productVariant.createMany({
      data: variants.map((v, i) => ({
        productId: product.id,
        name: v.name,
        colorHex: v.colorHex,
        stockQuantity: v.stockQuantity,
        order: i,
      })),
    });
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(productId: string, formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "").replace(/\r\n/g, "\n");
  const brandId = String(formData.get("brandId") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "");
  const priceSellRaw = String(formData.get("priceSell") ?? "");
  const priceRentalRaw = String(formData.get("priceRental") ?? "");
  const stockQuantity = Number(formData.get("stockQuantity") ?? 1);
  const status = String(formData.get("status") ?? "ACTIVE") as
    | "ACTIVE"
    | "SOLD_OUT"
    | "DRAFT";

  const priceSell = priceSellRaw ? Number(priceSellRaw) : null;
  const priceRental = priceRentalRaw ? Number(priceRentalRaw) : null;
  const rentalSettings = extractRentalSettings(formData);

  await prisma.product.update({
    where: { id: productId },
    data: {
      name,
      description,
      brandId,
      categoryId,
      priceSell,
      priceRental,
      isSellable: priceSell !== null,
      isRentable: priceRental !== null,
      stockQuantity,
      status,
      ...rentalSettings,
    },
  });

  const images = extractImages(formData, productId);
  await prisma.productImage.deleteMany({ where: { productId } });
  await prisma.productImage.createMany({
    data: images.map((img, i) => ({
      productId,
      seed: img.seed,
      url: img.url,
      order: i,
    })),
  });

  const variants = extractVariants(formData);
  await prisma.productVariant.deleteMany({ where: { productId } });
  if (variants.length > 0) {
    await prisma.productVariant.createMany({
      data: variants.map((v, i) => ({
        productId,
        name: v.name,
        colorHex: v.colorHex,
        stockQuantity: v.stockQuantity,
        order: i,
      })),
    });
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  await prisma.product.delete({ where: { id: productId } });
  revalidatePath("/admin/products");
}

function brandSlugify(name: string, id: number) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return base ? `${base}-${id}` : `brand-${id}`;
}

export async function createBrand(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "");
  const reading = String(formData.get("reading") ?? "").trim();
  const description = String(formData.get("description") ?? "").replace(/\r\n/g, "\n");
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const excludeFromCatalog = formData.get("excludeFromCatalog") === "on";

  const count = await prisma.brand.count();
  await prisma.brand.create({
    data: {
      name,
      reading: reading || null,
      slug: brandSlugify(name, count + 1),
      description,
      sortOrder,
      excludeFromCatalog,
    },
  });

  revalidatePath("/admin/brands");
  redirect("/admin/brands");
}

export async function updateBrand(brandId: string, formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "");
  const reading = String(formData.get("reading") ?? "").trim();
  const description = String(formData.get("description") ?? "").replace(/\r\n/g, "\n");
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const excludeFromCatalog = formData.get("excludeFromCatalog") === "on";

  await prisma.brand.update({
    where: { id: brandId },
    data: { name, reading: reading || null, description, sortOrder, excludeFromCatalog },
  });

  revalidatePath("/admin/brands");
  redirect("/admin/brands");
}

export async function deleteBrand(brandId: string) {
  await requireAdmin();
  const productCount = await prisma.product.count({ where: { brandId } });
  if (productCount > 0) {
    throw new Error("このブランドに紐づく商品があるため削除できません");
  }
  await prisma.brand.delete({ where: { id: brandId } });
  revalidatePath("/admin/brands");
}

function categorySlugify(name: string, id: number) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return base ? `${base}-${id}` : `category-${id}`;
}

export async function createCategory(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "");

  const count = await prisma.category.count();
  await prisma.category.create({
    data: {
      name,
      slug: categorySlugify(name, count + 1),
    },
  });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategory(categoryId: string, formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "");

  await prisma.category.update({
    where: { id: categoryId },
    data: { name },
  });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(categoryId: string) {
  await requireAdmin();
  const productCount = await prisma.product.count({ where: { categoryId } });
  if (productCount > 0) {
    throw new Error("このカテゴリーに紐づく商品があるため削除できません");
  }
  await prisma.category.delete({ where: { id: categoryId } });
  revalidatePath("/admin/categories");
}

function newsSlugify(title: string, id: number) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return base ? `${base}-${id}` : `news-${id}`;
}

export async function createNewsPost(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "");
  const body = String(formData.get("body") ?? "").replace(/\r\n/g, "\n");
  const category = String(formData.get("category") ?? "NEWS") as "NEWS" | "CAMPAIGN";
  const publishedAtRaw = String(formData.get("publishedAt") ?? "");

  const count = await prisma.newsPost.count();
  await prisma.newsPost.create({
    data: {
      title,
      slug: newsSlugify(title, count + 1),
      body,
      category,
      publishedAt: publishedAtRaw ? new Date(publishedAtRaw) : new Date(),
    },
  });

  revalidatePath("/admin/news");
  revalidatePath("/news");
  redirect("/admin/news");
}

export async function updateNewsPost(newsPostId: string, formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "");
  const body = String(formData.get("body") ?? "").replace(/\r\n/g, "\n");
  const category = String(formData.get("category") ?? "NEWS") as "NEWS" | "CAMPAIGN";
  const publishedAtRaw = String(formData.get("publishedAt") ?? "");

  await prisma.newsPost.update({
    where: { id: newsPostId },
    data: {
      title,
      body,
      category,
      publishedAt: publishedAtRaw ? new Date(publishedAtRaw) : undefined,
    },
  });

  revalidatePath("/admin/news");
  revalidatePath("/news");
  redirect("/admin/news");
}

export async function deleteNewsPost(newsPostId: string) {
  await requireAdmin();
  await prisma.newsPost.delete({ where: { id: newsPostId } });
  revalidatePath("/admin/news");
  revalidatePath("/news");
}

function journalSlugify(title: string, id: number) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return base ? `${base}-${id}` : `journal-${id}`;
}

export async function createJournalPost(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "");
  const body = String(formData.get("body") ?? "").replace(/\r\n/g, "\n");
  const publishedAtRaw = String(formData.get("publishedAt") ?? "");

  const count = await prisma.journalPost.count();
  await prisma.journalPost.create({
    data: {
      title,
      slug: journalSlugify(title, count + 1),
      body,
      publishedAt: publishedAtRaw ? new Date(publishedAtRaw) : new Date(),
    },
  });

  revalidatePath("/admin/journal");
  revalidatePath("/journal");
  redirect("/admin/journal");
}

export async function updateJournalPost(journalPostId: string, formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "");
  const body = String(formData.get("body") ?? "").replace(/\r\n/g, "\n");
  const publishedAtRaw = String(formData.get("publishedAt") ?? "");

  await prisma.journalPost.update({
    where: { id: journalPostId },
    data: {
      title,
      body,
      publishedAt: publishedAtRaw ? new Date(publishedAtRaw) : undefined,
    },
  });

  revalidatePath("/admin/journal");
  revalidatePath("/journal");
  redirect("/admin/journal");
}

export async function deleteJournalPost(journalPostId: string) {
  await requireAdmin();
  await prisma.journalPost.delete({ where: { id: journalPostId } });
  revalidatePath("/admin/journal");
  revalidatePath("/journal");
}

export async function updateOrderPaymentStatus(orderId: string, formData: FormData) {
  await requireAdmin();
  const paymentStatus = String(formData.get("paymentStatus")) as
    | "UNPAID"
    | "PAID"
    | "FAILED"
    | "REFUNDED";
  await prisma.order.update({ where: { id: orderId }, data: { paymentStatus } });
  revalidatePath("/admin/orders");
}

export async function updateBookingStatus(bookingId: string, formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status")) as
    | "PENDING"
    | "CONFIRMED"
    | "SHIPPED"
    | "RETURNED"
    | "CANCELLED";
  await prisma.rentalBooking.update({ where: { id: bookingId }, data: { status } });
  revalidatePath("/admin/bookings");
}

export async function updateContactStatus(contactId: string, formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status")) as "NEW" | "RESPONDED";
  await prisma.contactMessage.update({ where: { id: contactId }, data: { status } });
  revalidatePath("/admin/contact");
}

export async function deleteContactMessage(contactId: string) {
  await requireAdmin();
  await prisma.contactMessage.delete({ where: { id: contactId } });
  revalidatePath("/admin/contact");
}
