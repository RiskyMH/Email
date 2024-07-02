/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        // ppr: true,
        useLightningcss: process.env.TURBOPACK === "1",
        outputFileTracingIncludes: {
            '/mail/[mailbox]/config': ['./public/cloudflare-worker.js'],
        },
        // optimizePackageImports: [
        //     'shiki',
        // ],
        // reactCompiler: !process.env.TURBOPACK
    },
    output: process.env.STANDALONE ? "standalone" : undefined,
    transpilePackages: [
        "shiki"
    ],
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
    async headers() {
        const domains = `https://riskymh.dev https://emailthing.xyz https://new.emailthing.xyz ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'} ${process.env.VERCEL_URL || ''} ${process.env.VERCEL_BRANCH_URL || ''}`;
        return [
            {
                source: '/mail/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: `img-src ${domains} https://www.gravatar.com; font-src ${domains} ${process.env.NODE_ENV === 'development' ? 'https://fonts.gstatic.com' : ''};`,
                    }

                ],
            },
            {
                source: '/_next/static/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: `public, max-age=31536000, immutable`,
                    }
                ],
            }
        ];
    },
    async rewrites() {
        return {
            beforeFiles: [
                {
                    source: "/",
                    destination: "/emailme",
                    has: [
                        {
                            type: 'host',
                            value: 'emailthing.me'
                        },
                    ],
                },
                {
                    source: "/",
                    destination: "/home",
                    missing: [
                        {
                            type: 'cookie',
                            key: 'mailboxId',
                        },
                    ],
                },
                {
                    source: "/(login|register|mail|pricing|docs|manifest|email)",
                    destination: "/emailme/404",
                    has: [
                        {
                            type: 'host',
                            value: 'emailthing.me'
                        },
                    ],
                },

            ],
            afterFiles: [
                {
                    source: "/:path*",
                    destination: "/emailme/:path*",
                    has: [
                        {
                            type: 'host',
                            value: 'emailthing.me'
                        },
                    ],
                },
            ],
            fallback: [],
        };
    },
    async redirects() {
        return [
            {
                source: '/mail/:mailbox/:email/raw',
                destination: '/mail/:mailbox/:email/email.eml',
                permanent: true,
            },
            {
                source: '/api/recieve-email',
                destination: '/api/v0/receive-email',
                permanent: true,
            },
            {
                source: '/api-docs',
                destination: '/docs/api',
                permanent: true,
            },
            {
                source: "/mail/:path*",
                destination: "/login?from=/mail/:path*",
                missing: [
                    {
                        type: 'cookie',
                        key: 'token',
                    },
                ],
                permanent: false,
            },
            {
                source: "/",
                destination: "/login",
                has: [
                    { type: 'cookie', key: 'mailboxId' },
                ],
                missing: [
                    { type: 'cookie', key: 'token' },
                ],
                permanent: false,
            },
            {
                source: '/(login|register|login\/reset)?',
                has: [
                    {
                        type: 'cookie',
                        key: 'token',
                    },
                    {
                        type: 'cookie',
                        key: 'mailboxId',
                        value: '(?<mailbox>.*)'
                    },
                ],
                missing: [
                    { type: 'query', key: 'from' }
                ],
                destination: '/mail/:mailbox',
                permanent: false,
            },
            {
                source: '/(login|register)',
                destination: '/:from?from=',
                permanent: false,
                has: [
                    { type: 'cookie', key: 'token' },
                    { type: 'query', key: 'from' }
                ]
            },
            {
                source: "/emailme",
                destination: "/",
                permanent: true,
                has: [
                    {
                        type: 'header',
                        key: 'Host',
                        value: 'emailthing.me'
                    },
                ],
            },
            {
                source: "/emailme/:path",
                destination: "https://emailthing.me/:path",
                permanent: false,
                has: [
                    {
                        type: 'host',
                        value: 'emailthing.xyz'
                    },
                ],
            },
            {
                source: "/emailme",
                destination: "https://emailthing.me",
                permanent: false,
                has: [
                    {
                        type: 'host',
                        value: 'emailthing.xyz'
                    },
                ],
            },
        ];
    }
};

module.exports = nextConfig;


// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  module.exports,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    org: "riskymh",
    project: "javascript-nextjs",

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: false, //true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  }
);
