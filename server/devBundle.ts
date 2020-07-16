// import { Express } from "express";
// import webpack from "webpack"
// import webpackMiddleware from "webpack-dev-middleware"
// import webpackHotMiddleware from "webpack-hot-middleware"
// import webpackConfig from "../webpack.config.client.ts";

// const compile = (app: Express) => {
//  if(process.env.NODE_ENV == "development"){
//   const compiler = webpack(webpackConfig)
//   const middleware = webpackMiddleware(compiler, {
//    publicPath: webpackConfig.output.publicPath
//   })
//   app.use(middleware)
//   app.use(webpackHotMiddleware(compiler))
//  }
// }

// export default {
//  compile
// }
