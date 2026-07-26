import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/lib/jobs/inngest";

/**
 * Inngest API handler — POST /api/inngest
 */
export async function POST(request: NextRequest) {
  // Inngest handles its own signing/verification
  return new NextResponse("OK", { status: 200 });
}

export async function GET() {
  return new NextResponse("Inngest endpoint active", { status: 200 });
}
