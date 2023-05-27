const path = require('path');
const Koa = require('koa');
const historyApiFallback = require('koa-history-api-fallback');
const compress = require('koa-compress');
const app = new Koa();
const static = require('koa-static');
// 静态资源目录对于相对入口文件index.js的路径
const staticPath = './dist';
app.use(historyApiFallback());
app.use(compress({ threshold: 2048 }));
app.use(static(path.join(__dirname, staticPath)));
app.listen(process.env.PORT || 3000, () => {
  console.log('listen:', 3000);
});
