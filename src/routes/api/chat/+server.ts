import { json, type RequestHandler } from "@sveltejs/kit";
import { Ollama } from "ollama";

export const POST: RequestHandler = async ({ request }) => {
    const ollama = new Ollama({ host: "http://localhost:11434" });

    try {
        const { chat } = await request.json();
        if (!chat || chat.trim() === "") {
            return json({ reply: "Please provide a message." });
        }

        // User preferences (contextual details)
        const user = {
            name: "Henric Matthew E. Delrosario",
            likes: ["NBA", "WWE", "Netflix"],
            hobbies: ["Basketball", "Running", "Working Out"],
            home: "#25 D Fontaine 18th St. EBB OC",
            country: "Philippines",
            state: "Zambales",
            city: "Olongapo City",
            age: "21 years old",
            status: "Student",
            study: "Bachelor of Science in Computer Science",
            school: "Gordon College",
            gender: "Male",
        };

        // Construct a concise prompt
        const prompt = `You are an AI. Answer the following directly without unnecessary explanations:
        - Name: ${user.name}
        - Likes: ${user.likes.join(", ")}
        - Hobbies: ${user.hobbies.join(", ")}
        - Home: ${user.home}
        - Country: ${user.country}
        - State: ${user.state}
        - City: ${user.city}
        - Age: ${user.age}
        - Status: ${user.status}
        - Studying: ${user.study}
        - School: ${user.school}
        - Gender: ${user.gender}
        
        User's Message: "${chat}"`;

        const response = await ollama.chat({
            model: "deepseek-r1:1.5b",
            messages: [{ role: "user", content: prompt }]
        });

        // Process the AI response
        let reply = response?.message?.content || "No response received.";

        // Remove <think> sections, bold formatting, Chinese characters, and ##
        reply = reply
            .replace(/<think>.*?<\/think>/gs, "") // Remove <think> tags
            .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold formatting (**text** → text)
            .replace(/[\u4e00-\u9fff]/g, "") // Remove Chinese characters
            .replace(/##+/g, "") // Remove Markdown headers (## Heading)
            .trim();

        return json({ reply });
    } catch (error) {
        console.error("Chat API Error:", error);
        return json({ reply: "An error occurred while processing your request." });
    }
};
