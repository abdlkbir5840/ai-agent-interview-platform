import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { PREPARE_INTERVIEW_PROMPT } from "@/constants";
import { getRandomInterviewCover } from "@/lib/utils";
import { db } from "@/firebase/admin";
export async function GET() {
  return Response.json({ success: true, data: "THANK YOU" }, { status: 200 });
}

export async function POST(request: Request) {
  const { type, role, level, techstack, amount, userid } = await request.json();
  try {
    const prompt = PREPARE_INTERVIEW_PROMPT.replace("{role}", role)
      .replace("{level}", level)
      .replace("{techstack}", techstack)
      .replace("{type}", type)
      .replace("{amount}", amount);
    console.log(prompt);
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: prompt,
    });
    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(","),
      questions: JSON.parse(questions),
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };
    await db.collection("interviews").add(interview);
    return Response.json(
      { success: true, message: "Interview prepared successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return Response.json({ success: false, error: error }, { status: 500 });
  }
}
