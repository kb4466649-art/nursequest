# NurseQuest — Notifications: setup & what's new

## One-time setup (free, no credit card)
1. Create a free account at https://onesignal.com
2. Create a new app → platform **Web Push** → point it at your deployed site URL.
3. In OneSignal: Settings → Keys & IDs → copy the **App ID** and **REST API Key**.
4. In NurseQuest: Admin → 🔔 Notifications → 📣 Open Notification Center → 🔧 Push Provider Keys → paste both → 💾 Save Keys.

That's it — push is live. Nothing else to deploy or configure server-side.

## What's new in this update

### 1. Automatic permission prompt
Users no longer have to open Chrome's site settings and manually flip notifications to "Allow." Shortly after a signed-in user opens the app (and again right after they install the PWA), NurseQuest now automatically triggers the browser's native "Allow / Block" popup. It only asks once per device — if someone dismisses or blocks it, the app won't nag them again, but they can still turn it on later from **Notification Settings → 🔔 Enable push notifications on this device**.

### 2. Four notification types (matching what you asked for)
The old generic toggles have been replaced with the ones you wanted, visible in each user's Notification Settings:
- 🆕 **New question added**
- 📝 **Test series**
- ⏰ **Reminder**
- 🏆 **Ranking updates**
- (plus 💬 Chat messages and 🎁 Promotional offers, unchanged)

These are automatically wired up:
- Publishing a new AI-generated/PYQ question already fires a "New questions added" push — it now also respects the new "New question added" toggle.
- Creating a **public Test Series** (Admin/Manage → 🧪 Test Series) now automatically pushes "📝 New Test Series is live!" to everyone who has that toggle on.
- The existing daily/inactivity engagement nudges are gated by the "Reminder" toggle; rank-related nudges are gated by the "Ranking" toggle.
- Existing users' old preferences (if any) are migrated automatically — nobody's settings silently reset.

### 3. Admin on/off switch
Admin → 🔔 Notifications card has a master **Feature: ON/OFF** switch. Turning it off disables all push sending, the auto-permission prompt, and hides the notification bell for every user — no code changes needed.

### 4. Quick Templates (preloaded, ready-to-send notifications)
Inside 📣 Notification Center → **📋 Quick Templates**, you'll find 10 ready-made notifications covering new questions, test series, reminders, ranking, chat, and promos:
- **Use** — loads the template into the composer so you can tweak it, then send.
- **⏱️ Schedule** — loads it and jumps straight to picking a date/time.
- **⭐ Save current draft as a template** — turns whatever you've typed in the composer into a new reusable template (kept alongside the defaults, up to 10 custom ones).

### 5. Custom / one-off & scheduled notifications
The existing Compose panel is unchanged and still lets you:
- Write any custom title, message, and optional image.
- Target **all users**, a specific **exam category**, or **hand-picked users**.
- **Send now** or **schedule** for a future date/time (fires automatically once any signed-in device — admin or user — has the app open at/after that time; there's no paid backend running a cron job).

### 6. Chat notifications
Direct messages already push to the recipient (respecting their "Chat messages" toggle) — unchanged, just confirming it's covered.

## Notes
- The OneSignal REST key lives in Firestore and is used client-side from the admin screen only — same trust model this app already uses for its other shared API keys. Don't share that key publicly.
- Scheduled sends aren't guaranteed to the exact second (no paid server), but fire as soon as any open tab notices the time has passed (checked every 60s). Use "Send now" at the exact time if you need precision.
