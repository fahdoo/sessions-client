This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Webhook Setup

### ngrok
Follow instructions here: https://dashboard.ngrok.com/get-started/setup/macos

Static URL: https://content-hog-wise.ngrok-free.app/

```bash
ngrok http --url=content-hog-wise.ngrok-free.app 3000
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Remotion

```bash
remotion studio remotion/index.ts
```

Serve URL: https://remotionlambda-useast2-oyup9w55lg.s3.us-east-2.amazonaws.com/sites/sessional/index.html
Site name: sessional

ℹ️ Redeploy your site everytime you make changes to it. You can overwrite the existing site by running:

```bash

npx remotion lambda sites create index.ts --site-name=sessional 

npx remotion lambda functions deploy --site-name=sessional

# Get the site URL
npx remotion lambda sites ls

```

## Troubleshooting

### Peer dep issues
```bash
npm install --legacy-peer-deps
# or more permanently
npm config set legacy-peer-deps true
npm install
```

### Env issues

```bash
env -i NODE_ENV=development PATH=$PATH npm run dev
```
