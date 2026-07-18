import { NextResponse } from "next/server";
import { validateDiscountCode } from "@/lib/discount-data";

export async function POST(request: Request) {
  const { code } = (await request.json()) as { code?: string };
  const result = await validateDiscountCode(code ?? "");
  return NextResponse.json(result);
}
