const path = require('path')

module.exports = {
  reactOptions: {
    fastRefresh: true,
  },
  webpackFinal: async (config) => {
    config.resolve.modules.push(path.resolve(__dirname, '../'))
    // config.resolve.alias['@styles'] = path.resolve(__dirname, '../src/styles')
    // config.resolve.alias['@components'] = path.resolve(__dirname, '../src/components')
    // config.resolve.alias['@shared'] = path.resolve(__dirname, '../src/shared')
    // config.resolve.alias['@services'] = path.resolve(__dirname, '../src/services')

    return config
  },
  stories: ['../src/components/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
}
