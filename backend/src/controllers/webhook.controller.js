
import axios from "axios";
import db from "../config/database.js";

import {
    generateAIReply
} from "../services/aiReply.service.js";

// 1. Meta webhook verification
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

// 2. Receive Instagram DM and send AI-generated reply
export async function handleInstagramWebhook(req, res) {

    // Acknowledge Meta immediately
    res.sendStatus(200);

    try {
        const entries = req.body.entry ?? [];

        console.log("========== INSTAGRAM WEBHOOK ==========");
        console.log("Total Entries:", entries.length);

        for (const entry of entries) {

            const igUserId = String(entry.id);

            console.log("Webhook Instagram User ID:", igUserId);

            // Find the connected Instagram account
            const account = db.prepare(`
                SELECT ig_user_id, username, access_token
                FROM instagram_accounts
                WHERE ig_user_id = ?
                AND access_token IS NOT NULL
                LIMIT 1
            `).get(igUserId);

            if (!account) {
                console.error(
                    "No connected Instagram account found:",
                    igUserId
                );
                continue;
            }

            console.log("Matched Instagram Account:", account.username);

            for (const event of entry.messaging ?? []) {

                const message = event.message;
                const senderId = event.sender?.id;
                const text = message?.text?.trim();

                // Ignore empty messages and our own replies
                if (!text || !senderId || message.is_echo) {
                    continue;
                }

                console.log("Incoming Instagram DM:", text);
                console.log("Sender ID:", senderId);

                // Generate AI reply
                let aiReply;

                try {
                    aiReply = await generateAIReply(text);

                    console.log("AI reply generated successfully.");

                } catch (aiError) {
                    console.error(
                        "AI reply generation failed:",
                        aiError.message
                    );
                    continue;
                }

                // Send AI reply through Instagram API
                try {
                    const apiVersion = process.env.META_API_VERSION;

                    const response = await axios.post(
                        `https://graph.instagram.com/${apiVersion}/${account.ig_user_id}/messages`,
                        {
                            recipient: {
                                id: senderId
                            },
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

                    console.log(
                        `AI auto-reply sent successfully to ${account.username}:`,
                        response.data
                    );

                } catch (sendError) {
                    console.error(
                        "Instagram reply sending failed:",
                        sendError.response?.data ?? sendError.message
                    );
                }
            }
        }

        console.log("========== WEBHOOK PROCESSING COMPLETED ==========");

    } catch (error) {
        console.error(
            "Instagram webhook error:",
            error.response?.data ?? error.message
        );
    }
}
