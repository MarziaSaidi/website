// Vercel Serverless Function — runs server-side, so the API key is never exposed.
// The React widget POSTs here; this calls Google Gemini (free tier) and returns the reply.
//
// SETUP: add an environment variable named GEMINI_API_KEY in your Vercel project
// (Settings → Environment Variables). Get a free key at https://aistudio.google.com/apikey

import { experience, education } from "../src/data/experience.js";
import { work } from "../src/data/work.js";
import { personalProjects } from "../src/data/personalProjects.js";
import { skillGroups } from "../src/data/skills.js";

// Free-tier Gemini models, tried in order. Whichever your API key allows on the
// free tier gets used. Reorder to set a preference.
const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];
const MAX_HISTORY = 12; // cap how much conversation we send, to keep it fast/cheap

function buildSystemPrompt() {
  const jobs = experience
    .map((e) => {
      const bullets = e.bullets?.length ? `\n  Highlights: ${e.bullets.join("; ")}` : "";
      const lesson = e.lesson ? `\n  Takeaway: ${e.lesson.text}` : "";
      return `- ${e.role} at ${e.company} (${e.location}, ${e.dates}).\n  ${e.intro}${bullets}${lesson}\n  Tech: ${e.tags.join(", ")}.`;
    })
    .join("\n");

  const skills = skillGroups
    .map((g) => `${g.label}: ${g.skills.map((s) => s.name).join(", ")}`)
    .join(" | ");

  const projects = work.map((p) => `- ${p.name}: ${p.description}`).join("\n");

  const flagship = personalProjects[0];
  const flagshipDetail = flagship
    ? `\n\n${flagship.label.toUpperCase()} SPOTLIGHT\n${flagship.intro} ${flagship.bullets.join(" ")} Tech: ${flagship.techStack.join(", ")}.`
    : "";

  return `You are a friendly, professional assistant embedded on Marzia Saidi's portfolio website. Your only job is to answer visitors' questions about Marzia — her background, experience, projects, and skills — to help recruiters and collaborators get to know her.

ABOUT MARZIA
Marzia Saidi is a Software Engineer who builds full-stack applications from idea to production. She combines engineering skills with product thinking — designing database systems and backend workflows, and creating interfaces that make software easier to use. She has shipped production features for startups across web and mobile.

EDUCATION
${education.title}, ${education.school} (${education.meta}). Relevant coursework: ${education.coursework}.

EXPERIENCE
${jobs}

FEATURED PROJECTS
${projects}${flagshipDetail}

SKILLS
${skills}

CONTACT
LinkedIn: https://www.linkedin.com/in/marzia-saidisoftwareengineer/ — encourage interested visitors to connect there or use the contact form on the site.

RULES
- Speak about Marzia in the third person, warmly and concisely (2–4 sentences is usually ideal).
- Only answer from the information above. If asked something you don't know (salary, availability specifics, personal details), say you don't have that and suggest they reach out via LinkedIn or the contact form.
- Never invent facts, experience, or projects. Don't discuss topics unrelated to Marzia's professional profile.
- Be encouraging and human, not robotic. No markdown headings — just clean, plain text.`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error:
        "The chatbot isn't configured yet. Add a GEMINI_API_KEY environment variable in Vercel.",
    });
  }

  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "No messages provided." });
  }

  // Map our {role, content} history to Gemini's format (assistant -> model).
  const contents = messages
    .slice(-MAX_HISTORY)
    .filter((m) => m && typeof m.content === "string" && m.content.trim())
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const requestBody = JSON.stringify({
    systemInstruction: { parts: [{ text: buildSystemPrompt() }] },
    contents,
    generationConfig: { temperature: 0.6, maxOutputTokens: 500 },
  });

  try {
    let data = null;
    const attempts = [];

    for (const model of MODELS) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const gemini = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody,
      });

      if (gemini.ok) {
        data = await gemini.json();
        attempts.push({ model, status: 200 });
        break;
      }

      const detail = await gemini.text();
      // Pull just Google's reason string so the debug stays short.
      let reason = detail.slice(0, 160);
      try {
        reason = JSON.parse(detail)?.error?.message?.slice(0, 160) || reason;
      } catch {}
      attempts.push({ model, status: gemini.status, reason });
      console.error(`Gemini error (${model}):`, gemini.status, detail.slice(0, 300));
    }

    if (!data) {
      return res.status(502).json({
        error: "The assistant is having trouble right now. Please try again.",
        debug: { attempts },
      });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";

    if (!reply.trim()) {
      return res.status(200).json({
        reply:
          "I'm not sure how to answer that — feel free to reach out to Marzia on LinkedIn or through the contact form.",
      });
    }

    return res.status(200).json({ reply: reply.trim() });
  } catch (err) {
    console.error("Chat handler error:", err);
    return res
      .status(500)
      .json({ error: "Something went wrong reaching the assistant. Please try again." });
  }
}
