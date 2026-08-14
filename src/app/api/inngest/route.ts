import { serve } from "inngest/next";
import { inngest, sendReminder, handleNoShows } from "@/lib/jobs/inngest";

/**
 * Inngest API handler — POST /api/inngest
 * Connects Inngest to your functions for background jobs.
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [sendReminder, handleNoShows],
});
