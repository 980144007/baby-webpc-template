import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import requireTransform from 'vite-plugin-require-transform';
import mkcert from "vite-plugin-mkcert";
import legacyPlugin from '@vitejs/plugin-legacy';
import esbuild from 'rollup-plugin-esbuild';
const date = new Date();
const year = date.getFullYear();
const month = date.getMonth() + 1;
const day = date.getDate();
const outputDir = `dist/${year}-${month}-${day}/webAppTemplate`;
import path from 'path'
const https = false;
export default defineConfig({
  base: "./",  
  assetsPublicPath :'./',
  build: {
    outDir: outputDir,
  },
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    requireTransform({}),
    mkcert(),
    {
      ...esbuild({
          target: 'chrome70',
          include: /\.vue|.ts|.js$/,
          loaders: {
              '.vue': 'js'
          }
      }),
      enforce: 'post'
    },
    legacyPlugin({
      modernPolyfills: true,
      targets: ['ie >= 11', 'chrome <= 80'], // 需要兼容的目标列表，可以设置多个
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'], // 面向IE11时需要此插件
      renderLegacyChunks: true,
      polyfills: [
        'es.symbol',
        'es.array.filter',
        'es.promise',
        'es.promise.finally',
        'es/map',
        'es/set',
        'es.array.for-each',
        'es.object.define-properties',
        'es.object.define-property',
        'es.object.get-own-property-descriptor',
        'es.object.get-own-property-descriptors',
        'es.object.keys',
        'es.object.to-string',
        'web.dom-collections.for-each',
        'esnext.global-this',
        'esnext.string.match-all'
      ]
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "pages": path.resolve(__dirname, "src/pages"),
      "components": path.resolve(__dirname, "src/components"),
      "assets": path.resolve(__dirname, "src/assets"),
      "store": path.resolve(__dirname, "src/store"),
      "router": path.resolve(__dirname, "src/router"),
      "common": path.resolve(__dirname, "src/common"),
      "apis": path.resolve(__dirname, "src/apis"),
      "directives": path.resolve(__dirname, "src/directives"),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        additionalData: `@import "@/common/styles/public.less";`
      },
    },
  },
  server: {
    host: "0.0.0.0",
    https,
    port: https ? 443 : 80,//设置服务启动端口号，是一个可选项，不要设置为本机的端口号，可能会发生冲突
    // open:true,//是否自动打开浏览器，可选项
    cors: true,//允许跨域。
    // 设置代理
    proxy: {
      // 将请求代理到另一个服务器
      '/api': {
        target: 'https://hrtest.homa.cn/api',//这是你要跨域请求的地址前缀
        changeOrigin: true,//开启跨域
        rewrite: path => path.replace(/^\/api/, ''),//去除前缀api
      },
      '/fileHead': {
        target: 'https://hrtest.homa.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/fileHead': ''
        }
      }
    }
  },
});