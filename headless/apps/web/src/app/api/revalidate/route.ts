import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * On-Demand Revalidation Webhook
 *
 * Called by WordPress (headless-core plugin) when content changes.
 * Busts the ISR cache for affected paths so fresh data is served.
 *
 * POST /api/revalidate
 * Headers: x-revalidate-secret: <shared secret>
 * Body: { paths?: string[], all?: boolean }
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "REVALIDATE_SECRET not configured" },
      { status: 500 }
    );
  }

  const requestSecret = request.headers.get("x-revalidate-secret");
  if (requestSecret !== secret) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const paths: string[] = body.paths || [];
    const all: boolean = body.all || false;

    if (all) {
      // Revalidate the entire site
      revalidatePath("/", "layout");
      return NextResponse.json({ revalidated: true, scope: "all" });
    }

    if (paths.length === 0) {
      return NextResponse.json(
        { error: "No paths provided" },
        { status: 400 }
      );
    }

    for (const path of paths) {
      revalidatePath(path);
    }

    return NextResponse.json({ revalidated: true, paths });
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      { error: "Revalidation failed" },
      { status: 500 }
    );
  }
}
