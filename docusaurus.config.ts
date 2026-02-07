import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "Frontend Tauji",
  tagline:
    "Comprehensive guide for senior-level frontend engineering interviews",
  favicon: "img/favicon.ico",

  url: "https://frontend-guide-tau.vercel.app",
  baseUrl: "/",

  projectName: "interview-prep-docs",

  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: "./sidebars.ts",
          editUrl: undefined,
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/docusaurus-social-card.jpg",
    navbar: {
      title: "<Frontend Tauji />",
      items: [
        {
          type: "docSidebar",
          sidebarId: "tutorialSidebar",
          position: "left",
          label: "Topics",
        },
        {
          type: "search",
          position: "left",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Core Topics",
          items: [
            {
              label: "JavaScript",
              to: "/javascript/core/execution-context-and-call-stack",
            },
            {
              label: "React",
              to: "/react/core/components",
            },
          ],
        },
        {
          title: "Advanced Topics",
          items: [
            {
              label: "Performance",
              to: "/performance/optimization/lazy-loading",
            },
            {
              label: "Security",
              to: "/security/xss-csrf-clickjacking",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Frontend Tauji. Built by siddharthmourya.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: [
        "typescript",
        "javascript",
        "jsx",
        "tsx",
        "bash",
        "json",
      ],
    },
  } satisfies Preset.ThemeConfig,

  themes: [
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        hashed: true,
        language: ["en"],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        docsRouteBasePath: "/",
      },
    ],
  ],
};

export default config;
