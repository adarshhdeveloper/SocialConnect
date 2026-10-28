
import "dotenv/config";
import { generateAIReply } from "./src/services/aiReply.service.js";

const message = process.argv.slice(2).join(" ") ||
    "Bhai, tumhari business services kya hain?";

try {
    console.time("AI response time");

    const reply = await generateAIReply(message);

    console.timeEnd("AI response time");
    console.log("\nUser message:", message);
    console.log("Gemini AI reply:\n", reply);
} catch (error) {
    console.timeEnd("AI response time");
    console.error("AI test failed:", error.message);
    console.error("Error cause:", error.cause?.message ?? error.cause ?? "No additional details");
}
