# SocialConnect — Instagram API, Webhooks & AI Auto-Reply

SocialConnect is a Node.js + Express backend that connects an Instagram Professional account through Instagram Login, publishes image posts, stores data in SQLite, and supports Instagram DM webhooks with Gemini AI-powered replies.

## Features

- Instagram Login using OAuth 2.0
- Instagram Professional account connection
- Long-lived access-token handling
- SQLite database persistence
- Instagram image publishing and post history
- Instagram DM webhook verification
- Incoming DM event handling
- Gemini AI-generated replies
- Natural-language support for English, Hindi, Hinglish, and other supported languages
- Business-specific AI instructions and configurable FAQs
- Duplicate-post protection and request validation

## Technology Stack

- Node.js (ES Modules)
- Express.js
- SQLite (`better-sqlite3`)
- Axios
- `express-session`
- `dotenv`
- ngrok
- Google Gemini API (`@google/genai`)

## Prerequisites

Before starting, install or prepare:

1. Node.js and npm
2. Git
3. Meta for Developers account
4. Instagram Professional account (Business or Creator)
5. A separate Instagram account for testing
6. ngrok account and installation
7. Google AI Studio account for Gemini AI replies

Useful links:

- Meta Developers: https://developers.facebook.com/
- Meta Apps: https://developers.facebook.com/apps/
- ngrok: https://ngrok.com/
- Google AI Studio: https://aistudio.google.com/
- Gemini API documentation: https://ai.google.dev/gemini-api/docs

## Project Structure

```text
SocialConnect/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── business.config.js
│   │   ├── controllers/
│   │   │   ├── instaConnect.controller.js
│   │   │   └── instagramWebhook.controller.js
│   │   ├── routes/
│   │   │   └── instagram.routes.js
│   │   ├── services/
│   │   │   └── aiReply.service.js
│   │   └── app.js
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
└── README.md
```

This is the expected structure for the relevant backend features. Check your actual repository before creating or replacing files.

## 1. Clone the Repository

```bash
git clone https://github.com/adarshhdeveloper/SocialConnect.git
cd SocialConnect/backend
```

Install dependencies:

```bash
npm install
```

Install the Gemini SDK if it is not already installed:

```bash
npm install @google/genai
```

## 2. Create a Meta Developer App

1. Visit https://developers.facebook.com/apps/
2. Click **Create App**.
3. Follow the current dashboard steps to create the app.
4. Select the Instagram-related use case that supports **Instagram API with Instagram Login**.
5. Complete the app name and contact details.
6. Open the app dashboard.
7. Open the Instagram use case and configure **API setup with Instagram Login**.
8. Keep your App ID and App Secret private.

Meta may change dashboard labels, so follow the current Instagram Login setup flow.

### Required Permissions

Check which permissions your OAuth code requests and which ones your app needs:

- `instagram_business_basic` — access basic Instagram Professional account information.
- `instagram_business_content_publish` — publish Instagram content.
- `instagram_business_manage_messages` — receive and respond to Instagram messages.

The messaging permission is required for the DM auto-reply feature. Permission status such as **Ready for testing** does not mean that Advanced Access has been approved for public use.

## 3. Prepare Your Instagram Account

1. Use an Instagram Professional account (Business or Creator) for the account that will receive messages.
2. Make sure you can log into the account.
3. Keep another Instagram account available for testing.
4. During development, add eligible accounts as Instagram testers if required.
5. Accept the tester invitation from the invited Instagram account.

See [Add Instagram Testers](#8-add-instagram-testers-and-accept-invitations).

## 4. Configure Environment Variables

Create `backend/.env` using `backend/.env.example` as a reference.

Example:

```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=replace_with_a_long_random_secret

META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_API_VERSION=v26.0
META_REDIRECT_URI=https://YOUR-NGROK-HOST.ngrok-free.dev/api/instagram/callback

WEBHOOK_VERIFY_TOKEN=your_own_random_verify_token

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_supported_gemini_model
```

Replace all placeholder values with your own configuration.

Important:

- `META_APP_ID` and `META_APP_SECRET` come from your Meta app settings.
- `META_REDIRECT_URI` must exactly match the OAuth redirect URI configured in Meta.
- `WEBHOOK_VERIFY_TOKEN` is a secret string you choose yourself.
- The webhook verify token must match the value entered in Meta Webhooks.
- The webhook verify token is not the same as the Meta App Secret.
- `GEMINI_API_KEY` is required only if you use Gemini AI.
- `GEMINI_MODEL` must be a model currently available to your API project.
- Do not upload `.env` to GitHub.
- Keep `.env.example` free of real credentials.

## 5. Start the Backend

Open a terminal in the backend folder:

```bash
npm run dev
```

If the project does not have a `dev` script, inspect `backend/package.json` and use its configured start command, such as:

```bash
node server.js
```

Confirm that the backend starts successfully and listens on port `3000`.

Test the health endpoint:

```http
GET http://localhost:3000/health
```

Expected response, if the existing health route matches:

```json
{
  "success": true,
  "message": "SocialConnect API is running"
}
```

## 6. Start ngrok

Keep the backend running in the first terminal.

Open a second terminal and run:

```bash
ngrok http 3000
```

Copy the HTTPS forwarding URL shown by ngrok.

Example:

```text
https://YOUR-NGROK-HOST.ngrok-free.dev
```

Your actual URL will be different. Do not use the example hostname literally.

Keep ngrok running while testing. If the hostname changes, update all Meta settings that use it.

## 7. Configure the Instagram OAuth Redirect URI

In the Meta app dashboard:

1. Open your Instagram use case.
2. Find **API setup with Instagram Login** or the Instagram Login settings.
3. Find **Valid OAuth Redirect URIs**.
4. Add your exact callback URL:

```text
https://YOUR-NGROK-HOST.ngrok-free.dev/api/instagram/callback
```

5. Save the setting.
6. Add the same URL to `META_REDIRECT_URI` in `backend/.env`.
7. Restart the backend if you changed `.env`.

**Important:** The OAuth callback and webhook callback are different URLs.

- OAuth callback: `/api/instagram/callback`
- Webhook callback: `/api/instagram/webhook`

Do not use the OAuth callback URL as your webhook URL.

## 8. Add Instagram Testers and Accept Invitations

While testing in development mode, use accounts allowed by Meta's current testing rules.

1. Open https://developers.facebook.com/apps/
2. Select your app.
3. Open **App Roles**, **Roles**, or the Instagram tester section.
4. Choose the option to add a person or tester.
5. Select **Instagram Tester** where available.
6. Enter the Instagram username of the account you want to use for testing.
7. Send the invitation.
8. Log in to Instagram using that invited account.
9. Open Instagram settings and look for:

   **Settings → Website permissions → Apps and websites → Tester invites**

   The exact labels may vary with the Instagram app version.

10. Accept the invitation.
11. Return to the Meta dashboard and confirm the invitation is no longer pending, if its status is displayed.
12. Use the accepted tester account to send a DM to your connected Professional account.

Sending an invitation is not the same as accepting it. Do not add random public customers as testers.

## 9. Configure the Instagram Webhook

The existing backend is expected to expose these routes:

- `GET /api/instagram/webhook` — verify the webhook.
- `POST /api/instagram/webhook` — receive Instagram webhook events.

Confirm that the routes are mounted correctly in your actual `instagram.routes.js` and `app.js`.

### Step 1: Open the Webhooks Configuration

1. Visit https://developers.facebook.com/apps/
2. Select your Meta app.
3. Open the Instagram use case or Instagram API setup.
4. Find **Webhooks** or **Configure webhooks**.
5. Select the Instagram object if the dashboard asks you to choose one.

Depending on the current dashboard, Webhooks may be inside the Instagram use case rather than a separate left-side menu item.

### Step 2: Enter the Callback URL

Use your current ngrok HTTPS hostname:

```text
https://YOUR-NGROK-HOST.ngrok-free.dev/api/instagram/webhook
```

Do not copy the placeholder hostname literally.

### Step 3: Enter the Verify Token

Enter the exact value configured in your backend `.env`:

```env
WEBHOOK_VERIFY_TOKEN=your_own_random_verify_token
```

The value in Meta must exactly match `WEBHOOK_VERIFY_TOKEN` in the backend environment.

Do not use your Meta App Secret as the verify token.

### Step 4: Verify and Save

1. Ensure the backend is running.
2. Ensure ngrok is running.
3. Enter the callback URL and verify token in Meta.
4. Click **Verify and Save**.
5. Meta sends a GET verification request to your backend.
6. The backend checks the mode and verify token.
7. If the token matches, the backend returns the challenge.
8. Meta should confirm that the callback has been verified.

If verification fails, check:

- Is the backend running?
- Is ngrok forwarding to the correct port?
- Is the callback URL exact?
- Does the verify token match character-for-character?
- Is `GET /api/instagram/webhook` mounted correctly?
- Are there errors in the backend or ngrok logs?

### Step 5: Subscribe to the `messages` Field

After verification:

1. Find the list of Instagram webhook fields.
2. Find the field named `messages`.
3. Click **Subscribe** or enable the corresponding toggle.
4. Confirm that the field shows **Subscribed**.

The `messages` field is essential for receiving DM events. Subscribing to other fields does not replace it.

### Step 6: Check Account-Level Webhook Subscription

Some Instagram Login setup screens also display a webhook subscription control for the connected Instagram account.

If your dashboard shows this option:

1. Connect the intended Professional account using Instagram Login.
2. Find the account's webhook subscription setting.
3. Enable it if required.
4. Save the changes.

App-level subscription to the `messages` field and an account-level subscription are distinct settings where Meta exposes both. Check both if available.

### Step 7: Confirm Delivery

Send a real Instagram DM from an eligible test account to the connected Professional account.

Watch the backend terminal and ngrok request log.

The existing handler may log something like:

```text
Incoming Instagram DM: Hi
```

If no event arrives, check the callback URL, `messages` subscription, account-level subscription if shown, tester invitation status, and the app's publishing/access requirements.

Webhook verification alone does not prove that live DM events will be delivered.

## 10. Connect the Instagram Professional Account

1. Start the backend.
2. Start ngrok.
3. Open the OAuth connect endpoint in your browser:

```text
http://localhost:3000/api/instagram/connect
```

4. Log in with the intended Instagram Professional account.
5. Review and grant the requested permissions.
6. Complete the OAuth flow.
7. Confirm that the callback succeeds and the account is saved to SQLite.
8. Check the connected profile endpoint:

```http
GET http://localhost:3000/api/instagram/me
```

The response should identify the connected account, depending on the implementation.

Keep access tokens on the backend. Never expose them in frontend responses, public screenshots, logs, or GitHub commits.

## 11. Configure Gemini AI

### Step 1: Create a Gemini API Key

1. Open https://aistudio.google.com/
2. Open the API key section.
3. Create an API key for your project.
4. Add it to `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_supported_gemini_model
```

Gemini API free-tier availability, rate limits, supported models, and data-use terms can change. Check the current Google documentation. Free access does not mean unlimited usage.

### Step 2: Install the SDK

From the backend directory:

```bash
npm install @google/genai
```

### Step 3: Configure Business Information

The business configuration file is expected at:

```text
backend/src/config/business.config.js
```

Add verified information such as:

- Business name and description
- Actual products and services
- Product specifications
- Confirmed prices or quotation rules
- Working hours
- Contact details
- Frequently asked questions
- Reply style and language rules

Remove placeholders such as `Service 1` and `Service 2` before using the agent with real customers.

Do not invent prices, products, certifications, delivery dates, or company policies.

### Step 4: Check the AI Service

The AI service is expected at:

```text
backend/src/services/aiReply.service.js
```

It should export:

```js
generateAIReply(message)
```

The service should:

- Read the Gemini API key from the environment.
- Use the configured business information.
- Understand natural-language questions, including informal and mixed-language messages.
- Reply in the customer's language where possible.
- Ask a short clarification when the request is unclear.
- Avoid guessing when business information is missing.

Confirm the actual filename and export before connecting it to the webhook.

## 12. Test the Webhook and AI Replies

### Test 1: Backend Health

Open:

```text
http://localhost:3000/health
```

Confirm that the backend responds successfully.

### Test 2: Webhook Verification

Use **Verify and Save** in the Meta dashboard.

If verification fails, check the callback URL, verify token, backend route, and ngrok status.

Do not expose the real verify token in screenshots or public logs.

### Test 3: Send a Real Instagram DM

1. Keep the backend and ngrok running.
2. Use the accepted tester account to message the connected Professional account.
3. Try messages such as:

```text
Hi
What products do you offer?
Bhai tum log kya banate ho?
Price kya hai?
I need packaging for 5000 pieces
How much?
```

4. Watch the backend terminal.
5. Confirm that the incoming event is received.
6. Confirm that Gemini generates a response.
7. Confirm that the Instagram Send API succeeds.
8. Confirm that the reply appears in the Instagram DM conversation.

The exact AI wording will vary.

Expected behavior:

- Natural questions should not require exact keywords.
- The AI should answer from the configured business information.
- Ambiguous questions should trigger a short clarification.
- Missing prices or specifications should not be invented.

### Test 4: Diagnose Failures Separately

If Gemini works in a local test but no Instagram reply arrives, troubleshoot webhook delivery and the Instagram Send API separately.

Never share API keys, access tokens, or full secret environment files when asking for help.

## 13. App Publishing, App Review, and Public Users

Webhook verification, webhook field subscription, app publishing, and Advanced Access are separate requirements.

- **Webhook verification** checks that Meta can verify the callback URL.
- **`messages` subscription** configures the event field.
- **App publishing** changes the app's mode/status.
- **Advanced Access / App Review** allows the requested permissions to be used beyond the development/testing restrictions, subject to Meta's requirements.

For public customers, check the actual access status of `instagram_business_manage_messages` and any required dependency permissions in the Meta dashboard.

Meta may also require business verification, privacy information, and data-handling details.

Typical App Review preparation includes:

1. A valid privacy policy URL.
2. Data-deletion instructions or callback configuration, as requested by Meta.
3. A clear explanation of how Instagram messaging is used.
4. A review screencast showing Instagram login, permission grant, receiving a DM, and sending a reply.
5. Working test instructions and test account details if requested.
6. Completion of any business verification requirements shown by Meta.

Do not assume public messaging is approved just because the app is published or a permission says **Ready for testing**. Check the current access status in the dashboard.

Instagram messaging policies and messaging windows still apply. This app cannot freely message arbitrary users who have never interacted with the Professional account.

## Existing REST API Endpoints

Verify these endpoints against your current `instagram.routes.js` before relying on them.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Check backend status |
| GET | `/api/instagram/connect` | Start Instagram OAuth |
| GET | `/api/instagram/callback` | OAuth callback |
| GET | `/api/instagram/me` | Get connected Instagram identity |
| POST | `/api/instagram/posts` | Publish an image post |
| GET | `/api/instagram/posts` | List publishing history |
| GET | `/api/instagram/posts/:id` | Get one post record |
| DELETE | `/api/instagram/posts/:id` | Delete a local post record |
| GET | `/api/instagram/accounts` | List connected accounts |
| DELETE | `/api/instagram/accounts/:igUserId` | Remove a connected account record |
| GET | `/api/instagram/webhook` | Verify Meta webhook |
| POST | `/api/instagram/webhook` | Receive webhook events |

### Publish Post Example

```http
POST http://localhost:3000/api/instagram/posts
Content-Type: application/json
```

```json
{
  "imageUrl": "https://example.com/public-image.jpg",
  "caption": "Testing SocialConnect"
}
```

Use a real, publicly accessible HTTPS image URL that meets Meta's media requirements. The example domain is only a placeholder.

## Troubleshooting

### Meta Says Callback Verification Failed

Check:

- The backend is running.
- Ngrok forwards to the correct port.
- The callback URL is exact.
- The verify token matches the `.env` value.
- The GET webhook route is mounted.
- The backend returns the `hub.challenge` when the token matches.

### Instagram DMs Do Not Appear in the Backend

Check:

- `messages` shows **Subscribed**.
- The account-level subscription is enabled if the dashboard provides one.
- The callback URL ends in `/api/instagram/webhook`.
- The app meets Meta's current publishing requirements.
- The sender is eligible under the current testing/access rules.
- The tester invitation has been accepted.
- Ngrok logs show whether Meta is reaching your server.
- The webhook handler parses the expected event format.

### Incoming DM Appears but No Reply Is Sent

Check:

- A connected Instagram account and access token exist in SQLite.
- The token is valid and has the required permissions.
- `META_API_VERSION` is supported.
- `instagram_business_manage_messages` has the required access.
- The recipient is eligible under Meta's messaging rules.
- The Instagram Send API error response in backend logs.

### AI Uses Placeholder Business Information

- Update `business.config.js` with real products, prices, and FAQs.
- Remove placeholder entries.
- Tell the AI never to guess.
- Ask for human confirmation when verified information is missing.

### Gemini API Request Fails

- Confirm `GEMINI_API_KEY` exists in `.env`.
- Restart the backend after changing `.env`.
- Confirm `@google/genai` is installed.
- Confirm the configured model is available to your API project.
- Check network access, quota, rate limits, and the error response.
- Never print the API key in logs.

### Ngrok Error

If you see `ERR_NGROK_8012` or another tunnel error:

1. Start the backend.
2. Run `ngrok http 3000` in a separate terminal.
3. Confirm the server listens on port 3000.
4. If the ngrok hostname changes, update both the OAuth redirect URI and webhook callback URL.

## Security Checklist

- [ ] `.env` is ignored by Git.
- [ ] `.env.example` contains placeholders only.
- [ ] Meta secrets, Instagram tokens, and Gemini API keys remain private.
- [ ] Access tokens are never returned by public API endpoints.
- [ ] AI treats customer messages as untrusted input.
- [ ] AI does not invent business prices or policies.
- [ ] Conversation data is limited to what the application needs.
- [ ] Logs do not expose credentials or unnecessary customer information.
- [ ] Duplicate webhook events are handled before production use.
- [ ] Rate limits, retries, and per-user message ordering are considered before handling higher traffic.
- [ ] Privacy and data-deletion instructions accurately describe stored data.

## Official References

- Meta for Developers: https://developers.facebook.com/
- Meta Apps Dashboard: https://developers.facebook.com/apps/
- Instagram API documentation collection: https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api
- Google AI Studio: https://aistudio.google.com/
- Gemini API documentation: https://ai.google.dev/gemini-api/docs
- ngrok: https://ngrok.com/

---

**Important reminder:** The OAuth callback (`/api/instagram/callback`) and webhook callback (`/api/instagram/webhook`) are different endpoints. Ensure the correct webhook field is subscribed, the intended Instagram account is connected, and the required messaging permission has the appropriate access level for your intended audience.