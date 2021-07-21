const { description } = require('../../package')

module.exports = {
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#title
   */
  title: 'Vocdoni',
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#description
   */
  description: description,

  /**
   * Extra tags to be injected to the page HTML `<head>`
   *
   * ref：https://v1.vuepress.vuejs.org/config/#head
   */
  head: [
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }]
  ],

  /**
   * Theme configuration, here is the default theme configuration for VuePress.
   *
   * ref：https://v1.vuepress.vuejs.org/theme/default-theme-config.html
   */
  themeConfig: {
    repo: '',
    editLinks: false,
    docsDir: '',
    editLinkText: '',
    lastUpdated: true,
    nav: [
      {
        text: 'Architecture',
        link: '/architecture/general',
      },
      {
        text: 'Blog',
        link: 'https://blog.vocdoni.io/'
      },
      {
        text: 'About us',
        link: '/about-us/vision'
      },
      {
        text: 'Discord',
        link: 'https://discord.gg/sQCxgYs'
      }
    ],
    sidebar: [
      {
        title: 'Architecture',
        path: "/architecture/general",
        collapsable: false,
        children: [
          '/architecture/general',
          '/architecture/process-overview',
          '/architecture/census-overview',
          '/architecture/components',
          {
            title: 'Smart Contracts',
            collapsible: false,
            path: '/architecture/smart-contracts/entity-resolver',
            children: [
              '/architecture/smart-contracts/entity-resolver',
              '/architecture/smart-contracts/process',
              '/architecture/smart-contracts/genesis',
              '/architecture/smart-contracts/namespace',
              '/architecture/smart-contracts/results',
              '/architecture/smart-contracts/storage-proofs',
            ]
          },
          {
            title: 'Services',
            collapsible: false,
            path: '/architecture/services/gateway',
            children: [
              '/architecture/services/gateway',
              {
                title: 'Vochain',
                collapsible: false,
                path: '/architecture/services/vochain',
                children: [
                  '/architecture/services/vochain',
                  '/architecture/services/vochain/indexer'
                ]
              },
              '/architecture/services/census-service',
              '/architecture/services/bootnode',
            ]
          },
          {
            title: 'Data Schemes',
            collapsible: false,
            path: '/architecture/data-schemes/entity-metadata',
            children: [
              '/architecture/data-schemes/entity-metadata',
              '/architecture/data-schemes/process',
              '/architecture/data-schemes/ballot-protocol',
            ]
          },
          {
            title: 'Protocol',
            collapsible: false,
            path: '/architecture/protocol/json-api',
            children: [
              '/architecture/protocol/json-api',
              {
                title: 'Anonymous voting',
                collapsible: false,
                path: '/architecture/protocol/anonymous-voting/anonymous-voting',
                children: [
                  '/architecture/protocol/anonymous-voting/zk-census-proof',
                  '/architecture/protocol/anonymous-voting/blind-signatures',
                ]
              },
              '/architecture/protocol/rollup',
              '/architecture/protocol/data-origins',
            ]
          },
          '/architecture/component-interaction',
          '/architecture/libraries-tooling',
        ]
      },
      // {
      //   title: 'Organization Manager',
      //   path: "/manager/overview",
      //   collapsable: false,
      //   children: [
      //     '/manager/overview',
      //     '/manager/manager-api',
      //     '/manager/registry-api',
      //     '/manager/push-notifications-api',
      //   ]
      // },
      {
        title: 'Integration',
        path: "/integration/overview",
        collapsable: false,
        children: [
          '/integration/overview',
          '/integration/voting-as-a-service',
          '/integration/registry-token-api',
        ]
      },
      {
        title: 'Deployment',
        path: '/deployment/gateway',
        collapsable: false,
        children: [
          '/deployment/gateway',
          '/deployment/miner',
          '/deployment/oracle',
          '/deployment/custom-vochain',
        ]
      },
      {
        title: "Development",
        children: [
          ["https://docs-staging.aragon.org/contributors-guide", "Contributor's Guide"]
        ]
      },
      {
        title: 'About',
        path: '/about-us/vision',
        collapsable: false,
        children: [
          '/about-us/vision',
          '/about-us/how-we-work',
          '/about-us/development-guidelines',
        ],
      },
    ]
  },

  /**
   * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
   */
  plugins: [
    '@vuepress/plugin-back-to-top',
    '@vuepress/plugin-medium-zoom',
    '@vuepress/last-updated',
    '@vuepress/active-header-links',
    '@vuepress/nprogress',
    [
      'vuepress-plugin-container',
      {
        type: 'tip',
        defaultTitle: {
          '/': '',
        },
      },
    ],
    ['mermaidjs', {
      theme: 'default',
      logLevel: 5, // corresponds with "fatal"
      securityLevel: 'loose',
      startOnLoad: true,
      arrowMarkerAbsolute: false,
      sequence: {
        diagramMarginX: 0,
        diagramMarginY: 20,
        actorMargin: 30,
        boxMargin: 5,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35,
        messageAlign: 'center',
        mirrorActors: true,
        wrap: true,
        rightAngles: false,
        showSequenceNumbers: false,
      },
    }
    ]
  ]
}
