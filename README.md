Here is the complete README.md content you can copy directly into your GitHub repository. It includes all the setup steps, commands, and code snippets (for wrangler.jsonc, vercel.json, etc.) in a single, ready‑to‑use Markdown file.

---

```markdown
# DaemonXRD Setup Guide

This comprehensive guide covers setting up your Cloudflare Workers KV database, configuring secret environment variables, and rewriting routes using Vercel.

---

## 1. Set Up Cloudflare Workers KV (Database)

1. Log into your **Cloudflare Dashboard**.
2. Navigate to **Storage & Databases** → **Workers KV**.
3. Create a new KV Namespace named **daemonxrd**.
4. Inside the namespace, click **Add Entry** and set:
   - **Key:** `services`
   - **Type:** `JSON`
   - **Value:** Add your services list using the format below:

   ```json
   [
     {
       "title": "Service Name",
       "description": "Service details go here..."
     }
   ]
```

5. Click Save.
6. Copy the Namespace ID generated for daemonxrd.

---

2. Configure wrangler.jsonc

Open your local wrangler.jsonc file and update the name and kv_namespaces fields with your Worker name and KV Namespace ID:

```jsonc
{
  "name": "daemonxrd",
  "main": "src/index.ts",
  "compatibility_date": "2025-02-04",
  "assets": {
    "directory": "./"
  },
  "kv_namespaces": [
    {
      "binding": "KV",
      "id": "YOUR_CLOUDFLARE_KV_NAMESPACE_ID"
    }
  ]
}
```

---

3. Add Environment Variables & Secrets (Cloudflare Dashboard)

1. Open your Cloudflare Worker project dashboard.
2. Go to Settings → Variables and Secrets.
3. Click Add under the Secrets section.
4. Add the following two secrets:
   · Secret 1:
     · Type: Secret
     · Name: ADMIN_2FA
     · Value: Your 2FA Secret Key (also add this key into your Authenticator App with a recognizable name)
   · Secret 2:
     · Type: Secret
     · Name: ADMIN_PASSWORD
     · Value: Your Admin Password
5. Click Save and Deploy.

---

4. Configure Vercel URL Redirection

To route traffic from your Vercel deployment to your Cloudflare Worker sub‑domain:

1. Create a file named vercel.json in the root directory of your project.
2. Add the following rewrite rule (replace the destination URL with your actual Cloudflare Worker sub‑domain):
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "https://daemonxrd.daemonxrdlegoin.workers.dev/$1"
       }
     ]
   }
   ```
3. Commit and push all your files (wrangler.jsonc, vercel.json, etc.) to your GitHub repository.
4. Go to Vercel, import your GitHub repository, and click Deploy.

---

Additional Notes

· Use Control + Shift + M to toggle the Tab key moving focus. Alternatively, use Esc then Tab to move to the next interactive element on the page.
· Attach files by dragging & dropping, selecting, or pasting them.

```

---

Just copy everything inside the code block above, paste it into your `README.md` file on GitHub, and commit. That’s all you need for the Markdown file. If you also need the separate code files (`wrangler.jsonc`, `vercel.json`), they are already included as snippets inside the guide. Happy deploying! 🚀
