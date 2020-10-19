### react-ssr 同构路由
#### 为什么要保持路由一致？
因为我们访问服务器。通过路由加载不同的组件，渲染完成给出Html.浏览器接管渲染后，也要通过路由，补充渲染，绑定事件，加载数据等。
#### 写法
> 前端路由使用方式不变，后端使用静态路由完成同构
1. 首次访问界面，服务端直出路由匹配到的组件
2. 之后的路由跳转皆由浏览器接管

src/routes.js
```
import React from "react";
import { Route } from "react-router-dom";
import Home from "./client/home";
import Person from "./client/person";
export default (
  <div>
    <Route exact path="/" component={Home} />
    <Route exact path="/person" component={Person} />
  </div>
);

```
src/client/index.js
```
import React from 'react';
import { hydrate } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import Routes from '../routes'
function App() {
    return (
        <BrowserRouter>
            {Routes}
        </BrowserRouter>
    )
}
hydrate(<App />, document.getElementById("root"))
```

服务端使用StaticRouter

src/server/utils.js
```
import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import Routes from '../routes' //服务端加载路由
export const render = (req) => {
    const content = renderToString(
        <StaticRouter location={req.path} >
            {Routes}
        </StaticRouter>
    )
    return `
        <html>
            <head>
                <title>react-ssr</title>
            </head>
            <body>
            <div id="root">${content}</div>
            </body>
            <script src="/index.js"></script>
        </html>
    `
}
```
src/server/index.js
```
import express from 'express'
import {render} from './utils'
const app = new express();
app.use(express.static('public'))
app.get("*", (req, res) => {
    res.send(render(req))
})

app.listen(3004, () => {
  console.log("run server http://localhost:3004");
});

```