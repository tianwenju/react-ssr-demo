//src/server/index.js
import express from "express";
import React from "react";
import { renderToString } from "react-dom/server";
import { hydrate } from "react-dom";
import { matchRoutes } from "react-router-config";
import { render } from "./utils";
import routes from "../routes";
import store from "../store";
import App from "../client/app";

const app = new express();
app.use(express.static("public"));

// function Content() {
//   return <p>this is content</p>;
// }
app.get("/", (req, res) => {
  // const content = renderToString(<Content />);
  const root = renderToString(<App />);
  res.send(` <html>
    <head>
        <title>hello world</title>
    </head>
    <body>
    <div id="root">${root}</div>
    <script src ='./index.js'>
    </script>
    </body>
</html>`);
});

// app.get("*", (req, res) => {
//     // 根据路由的路径，来往store里面加数据
//     const matchedRoutes = matchRoutes(routes, req.path);
//     const promises = [];
//     matchedRoutes.forEach(item => {
//         if (item.route.loadData) {
//             promises.push(item.route.loadData(store))
//         };
//     });
//     //等待所有异步结果执行完毕，服务端直出页面
//     Promise.all(promises).then(_ => {

//       const context={css:[]}
//         res.send(render({
//             req,
//             store,
//             routes,
//             context
//         }))

//     })
// })

app.listen(3004, () => {
  console.log("run server http://localhost:3004");
});
