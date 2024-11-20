
# Integrating Remotion Lambda with Next.js for Audiogram Rendering

## 1. Set Up Remotion in Your Project

### Install Remotion Dependencies (DONE)
Navigate to your project’s root directory and install the required Remotion packages:
```bash
npm install --save-exact remotion @remotion/cli @remotion/lambda
```

### Set Up a Dedicated Remotion Folder (DONE)
Create a directory structure for your Remotion compositions:
```
remotion/
├── templates/
│   ├── audiogram-basic/
│   │   ├── public/
│   │   ├── src/
│   │   ├── Composition.tsx
│   │   ├── Root.tsx
│   │   └── index.ts
├── index.ts
├── remotion.config.ts
├── tsconfig.json
```

In this folder, you’ll configure the **Audiogram template** from the [Remotion Audio Template GitHub](https://uithub.com/remotion-dev/template-audiogram).

### Add a `remotion/package.json` @package.json


---

## 2. Env Variables (DONE)

AWS_REGION
AWS_S3_BUCKET
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
REMOTION_SITE_NAME
REMOTION_SITE_URL
REMOTION_FUNCTION_NAME

---

## 3. Fetch User Assets in Your Next.js App (DONE)

### API Route for Triggering Video Renders
Add an API route in your Next.js app (`pages/api/render.ts`) to fetch user data and trigger a render on **Remotion Lambda**:
```typescript
import { renderMediaOnLambda } from "@remotion/lambda/client";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Only POST requests allowed" });
    return;
  }

  const { audioUrl, avatarUrl, username, transcript } = req.body;

  // Call Remotion Lambda
  try {
    const renderId = await renderMediaOnLambda({
      functionName: "remotion-render", // Replace with your Lambda function name
      region: "us-east-2", // Replace with your Lambda region
      serveUrl: "https://<your-remotion-site-url>", // Deployed Remotion site
      composition: "Audiogram",
      inputProps: {
        audioUrl,
        avatarUrl,
        username,
        transcript,
      },
      codec: "h264",
      outputLocation: `s3://<your-bucket-name>/renders/${Date.now()}.mp4`,
    });

    res.status(200).json({ renderId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Render failed", error: err });
  }
}
```

---

## 4. Handle Rendering Results (DONE)

### Configure Webhooks
Set up a webhook to receive rendering updates:
1. Add a webhook endpoint in your Next.js app (`app/api/webhooks/remotion.ts`):
   ```typescript
   export default async function handler(req, res) {
     const { type, renderId, bucketName, outputFile } = req.body;

     if (type === "render.completed") {
       console.log(`Render ${renderId} completed!`);
       console.log(`File available at: s3://${bucketName}/${outputFile}`);
     }

     res.status(200).end();
   }
   ```

2. Configure the webhook URL in your Lambda site settings. (DONE)

---

## 5. Workflow Overview
1. User uploads audio and provides details (avatar, username, transcript).
2. Next.js fetches assets from S3 and triggers the Remotion Lambda via the `/api/render` endpoint.
3. Lambda renders the video using the customized Audiogram template.
4. Webhook notifies your app when the render is complete.

---

## Reference Links
- [Remotion GitHub](https://uithub.com/remotion-dev/remotion)
- [Remotion Audiogram Template](https://uithub.com/remotion-dev/template-audiogram)
- [Remotion Lambda API](https://www.remotion.dev/docs/lambda/api)
- [Remotion Lambda How it Works](https://www.remotion.dev/docs/lambda/how-lambda-works)
- [Remotion Webhooks](https://www.remotion.dev/docs/lambda/webhooks)
- [Remotion Player API](https://www.remotion.dev/docs/player/player)
- [Remotion Player Integration](https://www.remotion.dev/docs/player/integration)
- [Remotion Player Examples](https://www.remotion.dev/docs/player/examples)
- [Remotion Next.js Template](https://uithub.com/remotion-dev/remotion/tree/main/packages/template-next-app)

This setup ensures modularity, scalability, and seamless integration of Remotion into your Next.js application.