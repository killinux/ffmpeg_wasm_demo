import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  publicPath: './',
  proxy: {
    '/ai': {
      target: 'http://localhost:5001/',
      changeOrigin: true,
      pathRewrite: {
        '^/ai': '',
      },
    },
  },
});
