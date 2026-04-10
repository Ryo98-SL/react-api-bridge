import { defineConfig } from "vitepress";

const repoBase = "/react-api-bridge/";
const isGithubPages =
    process.env.GITHUB_ACTIONS === "true" || process.env.CI === "true";
const assetBase = isGithubPages ? repoBase : "/";

export default defineConfig({
    title: "React API Bridge",
    description: "Scoped imperative APIs for React",
    base: isGithubPages ? repoBase : "/",
    head: [
        ["link", { rel: "icon", type: "image/svg+xml", href: `${assetBase}react-api-bridge-logo.svg` }],
        ["link", { rel: "icon", type: "image/png", href: `${assetBase}react-api-bridge-logo.png` }],
        ["link", { rel: "apple-touch-icon", href: `${assetBase}react-api-bridge-logo.png` }],
    ],
    cleanUrls: true,
    lastUpdated: true,
    locales: {
        root: {
            label: "English",
            lang: "en-US",
            title: "React API Bridge",
            description: "Scoped imperative APIs for React",
            themeConfig: {
                nav: [],
                sidebar: [
                    {
                        text: "Overview",
                        items: [{ text: "Home", link: "/" }],
                    },
                    {
                        text: "Guide",
                        items: [
                            { text: "Getting Started", link: "/guide/getting-started" },
                            { text: "Why", link: "/guide/why" },
                            { text: "Core Concepts", link: "/guide/core-concepts" },
                            { text: "Comparison", link: "/guide/comparison" },
                            { text: "Use Cases", link: "/guide/use-cases" },
                        ],
                    },
                    {
                        text: "API Reference",
                        items: [{ text: "Overview", link: "/api/" }],
                    },
                ],
                outlineTitle: "On this page",
                lastUpdated: {
                    text: "Last updated",
                },
                docFooter: {
                    prev: "Previous page",
                    next: "Next page",
                },
            },
        },
        zh: {
            label: "简体中文",
            lang: "zh-CN",
            title: "React API Bridge",
            description: "React 的作用域命令式 API 桥",
            link: "/zh/",
            themeConfig: {
                nav: [],
                sidebar: [
                    {
                        text: "概览",
                        items: [{ text: "首页", link: "/zh/" }],
                    },
                    {
                        text: "指南",
                        items: [
                            { text: "快速开始", link: "/zh/guide/getting-started" },
                            { text: "为什么需要它", link: "/zh/guide/why" },
                            { text: "核心概念", link: "/zh/guide/core-concepts" },
                            { text: "对比", link: "/zh/guide/comparison" },
                            { text: "使用场景", link: "/zh/guide/use-cases" },
                        ],
                    },
                    {
                        text: "API 参考",
                        items: [{ text: "概览", link: "/zh/api/" }],
                    },
                ],
                outlineTitle: "本页内容",
                lastUpdated: {
                    text: "最后更新",
                },
                docFooter: {
                    prev: "上一页",
                    next: "下一页",
                },
                footer: {
                    message: "基于 MIT 协议发布",
                    copyright: "Copyright © Deliang Shu",
                },
            },
        },
    },
    themeConfig: {
        logo: "/react-api-bridge-logo.svg",
        siteTitle: "React API Bridge",
        socialLinks: [
            {
                icon: "github",
                link: "https://github.com/Ryo98-SL/react-api-bridge",
            },
        ],
        search: {
            provider: "local",
        },
        footer: {
            message: "MIT Licensed",
            copyright: "Copyright © Deliang Shu",
        },
    },
});
