
import axios from "axios";
import db from "../config/database.js";

// NEW: Import the AI service that you already tested successfully.
import { generateAIReply } from "../services/aiReply.service.js";

// 1. Meta webhook verification
// Existing working verification logic: unchanged.
export function verifyInstagramWebhook(req, res) {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (
        mode === "subscribe" &&
        token === process.env.WEBHOOK_VERIFY_TOKEN
    ) {
        return res.status(200).send(challenge);
    }

    return res.sendStatus(403);
}

// 2. Receive Instagram DM and send an AI-generated reply
export async function handleInstagramWebhook(req, res) {
    // Existing behavior: acknowledge Meta immediately.
    res.sendStatus(200);

    try {
        const entries = req.body.entry ?? [];

        for (const entry of entries) {
            for (const event of entry.messaging ?? []) {
                const message = event.message;
                const senderId = event.sender?.id;
                const text = message?.text?.trim();

                // Existing behavior: ignore empty messages and our own replies.
                if (!text || !senderId || message.is_echo) {
                    continue;
                }

                console.log("Incoming Instagram DM:", text);

                // NEW AI INTEGRATION:
                // Previously, the code only replied to Hi/Hello/Hey.
                // Now every incoming text message is passed to the AI service.
                let aiReply;

                try {
                    aiReply = await generateAIReply(text);
                    console.log("AI reply generated successfully.");
                } catch (aiError) {
                    // If AI fails, don't send a fabricated business answer.
                    console.error("AI reply generation failed:", aiError.message);
                    continue;
                }

                // Get the connected Instagram account and token.
                // Existing SQLite lookup: unchanged.
                const account = db.prepare(`
                    SELECT ig_user_id, access_token
                    FROM instagram_accounts
                    WHERE access_token IS NOT NULL
                    ORDER BY id DESC
                    LIMIT 1
                `).get();

                if (!account) {
                    console.error(
                        "No connected Instagram account/token found."
                    );
                    continue;
                }

                const apiVersion = process.env.META_API_VERSION;

                // Existing Instagram Send API request.
                // CHANGE: send aiReply instead of the hardcoded greeting.
                const response = await axios.post(
                    `https://graph.instagram.com/${apiVersion}/${account.ig_user_id}/messages`,
                    {
                        recipient: { id: senderId },
                        message: {
                            text: aiReply
                        }
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${account.access_token}`,
                            "Content-Type": "application/json"
                        },
                        timeout: 15000
                    }
                );

                console.log("AI auto-reply sent:", response.data);
            }
        }
    } catch (error) {
        console.error(
            "Instagram webhook error:",
            error.response?.data ?? error.message
        );
    }
}
