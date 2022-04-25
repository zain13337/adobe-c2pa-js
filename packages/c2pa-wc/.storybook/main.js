const litSvg = require('../etc/rollup/plugins/lit-svg');

module.exports = {
  framework: '@storybook/web-components',
  stories: ['../stories/**/*.stories.mdx', '../stories/**/*.stories.@(js|ts)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-links',
  ],
  core: {
    builder: 'storybook-builder-vite',
  },
  async viteFinal(config) {
    config.plugins.push(litSvg());
    return config;
  },
};
