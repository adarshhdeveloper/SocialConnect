
import axios from "axios";
import db from "../config/database.js";

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

// 2. Receive Instagram DM and send greeting
export async function handleInstagramWebhook(req, res) {
    // Meta ko jaldi confirmation bhejo
    res.sendStatus(200);

    try {
        const entries = req.body.entry ?? [];

        for (const entry of entries) {
            for (const event of entry.messaging ?? []) {
                const message = event.message;
                const senderId = event.sender?.id;
                const text = message?.text?.trim();

                // Ignore events without text and our own messages
                if (!text || !senderId || message.is_echo) {
                    continue;
                }

                console.log("Incoming Instagram DM:", text);

                // Reply only to greetings
                if (!/^(hi|hello|hey)\b[!. ]*$/i.test(text)) {
                    console.log("No greeting reply needed.");
                    continue;
                }

                // Get the connected Instagram account and token
                const account = db.prepare(`
                    SELECT ig_user_id, access_token
                    FROM instagram_accounts
                    WHERE access_token IS NOT NULL
                    ORDER BY id DESC
                    LIMIT 1
                `).get();

                if (!account) {
                    console.error("No connected Instagram account/token found.");
                    continue;
                }

                const apiVersion = process.env.META_API_VERSION;

                const response = await axios.post(
                    `https://graph.instagram.com/${apiVersion}/${account.ig_user_id}/messages`,
                    {
                        recipient: { id: senderId },
                        message: {
                            text: "Hey! kyu re mc "
                        }
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${account.access_token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );

                console.log("Auto-reply sent:", response.data);
            }
        }
    } catch (error) {
        console.error(
            "Instagram webhook error:",
            error.response?.data ?? error.message
        );
    }
}
