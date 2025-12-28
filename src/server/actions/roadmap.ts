"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { RoadmapService } from "~/server/logic/services/roadmap-service";

const createRoadmapSchema = z.object({
  topic: z.string().min(3),
  difficulty: z.coerce.number().min(1).max(3),
  hours: z.coerce.number().min(0.5).max(4),
  days: z.coerce.number().min(3).max(90),
});

export async function createRoadmapAction(topic: string, days: number, minutes: number) {
  // TODO: Get actual user ID from session/auth
  // For now using a dummy ID or getting from input if managing local user
  const userId = "user_default"; 

  if (!topic || !days || !minutes) {
    throw new Error("Missing required fields");
  }

  const service = new RoadmapService(db);
  const roadmapId = await service.createRoadmap(userId, topic, days, minutes);

  redirect(`/roadmap/${roadmapId}`);
}

export async function getUserRoadmapsAction() {
  // TODO: Get actual user ID from session/auth
  const userId = "user_default";
  
  const service = new RoadmapService(db);
  return service.getUserRoadmaps(userId);
}
