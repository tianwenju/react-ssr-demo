### SSR介绍
Server Slide Rendering  服务端渲染
### 为什么使用服务器端渲染(SSR)？
1. 更好的搜索引擎优化（Search-Engine-Optimization，SEO）
    * 大部分网站都希望自己能够出现在搜索引擎的搜索页前列，这个前提就是网页内容要能够被搜索引擎的爬虫正确抓取到。虽然 Google 这样的搜索引擎已经可以检索浏览器端渲染的网页，但毕竟不是全部搜索引擎都能做到，如果搜索引擎的爬虫只能拿到服务器端渲染的内容，完全浏览器端渲染就行不通了
2.  可以缩短“第一有意义渲染时间”（First-Meaningful-Paint-Time）解决首屏白屏问题
    * 如果完全依赖于浏览器端渲染，那么服务器端返回的 HTML 就是一个空荡荡的框架和对 JavaScript 的应用，然后浏览器下载 JavaScript，再根据 JavaScript 中的 AJAX 调用获取服务器端数据，再渲染出 DOM 来填充网页内容，总共需要三个 HTTP 或 HTTPS 请求。
    * 如果使用服务器端渲染，第一个 HTTP/HTTPS 请求返回的 HTML 里就包含可以渲染的内容了，这样用户第一时间就会感觉到“有东西画出来了”，这样的感知性能更好。
### 核心原理(基于React)
如下图：
![image](http://5b0988e595225.cdn.sohucs.com/images/20190919/745b23c1ac124d31a8b4af5cc8134b89.jpeg)

1. 服务端直接给出Html
```
import express from "express";
import React from "react";
import { renderToString } from "react-dom/server";
import App from "../client/app";
const app = new express();
app.use(express.static("public"));

app.get("/", (req, res) => {
  const App = renderToString(<App />);
  res.send(` <html>
    <head>
        <title>hello world</title>
    </head>
    <body>
    <div>${App}</div>
    </script>
    </body>
</html>`);
});
```
```
import React from "react";
const handleClick = () => {
  alert("click");
};
function App() {
  return <button onClick={handleClick}>hello ssr </button>;
}
export default App;
```
浏览器访问返回的结构
``` 
 <html>
    <head>
        <title>hello world</title>
        
    </head>
    <body>
    
    <div id="root"><button data-reactroot="">hello ssr </button></div>
    </script>
    </body>
</html>
```
此种情况下,并没有完成事件绑定呢？接下来就要用到如下
2. 同构渲染（混合渲染）
> * 同构指的是一套代码在服务端和客户端运行，服务端输出html结构，数据，js，客户端接管页面进行补充渲染，填充数据，绑定事件等~
> * 一句话：数据和Html骨架有服务端给出,客户端补充渲染。
* 核心代码(server)
``` 
import App from "../client/app";
const app = new express();
app.use(express.static("public"));

function Content() {
  return <p>this is content</p>;
}
app.get("/", (req, res) => {
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
```
* index.js(client)
```
import React from 'react';
import { hydrate } from 'react-dom'
hydrate(<APP />,document.getElementById("root"))
```
```
import React from "react";
const handleClick = () => {
  alert("click");
};
function App() {
  return <button onClick={handleClick}>hello ssr </button>;
}
export default App;
```
浏览器访问返回的结构
```
 <html>
    <head>
        <title>hello world</title>
        
    </head>
    <body>
    
    <div id="root"><button data-reactroot="">hello ssr </button></div>
    <script src ='./index.js'>
    </script>
    </body>
</html>
```
其中关键点在于
```

1. const root = renderToString(<App />);
2. <div id="root">${root}</div>
3. <script src ='./index.js'>

```

通过 1和2,其实服务端已完成渲染，返回给我们html，但是我们还没有事件绑定，我们需要通过引用的脚本文件就是 hydrate(<APP />,document.getElementById("root"))。 交给浏览器完成事件绑定。

那假如我们写成如下可以么？
```
1. <div id="root"></div>
2. <script src ='./index.js'>
```
去掉 renderToString的root常量可以么？浏览器访问返回的html如下：
```
 <html>
    <head>
        <title>hello world</title>
    </head>
    <body>
    <div id="root"></div>
    <script src ='./index.js'>
    </script>
    </body>
</html>
```
此种情况下能够正常运行，但是这种情况下。生成的dom结构。通过hydrate(<APP />,document.getElementById("root"))也交给浏览器完成。显然此种，并不利于SEO优化。我们希望返回给浏览器的是比较完整dom结构，方便浏览器引擎爬虫。


==* hydrate 描述的是 ReactDOM 复用 ReactDOMServer 服务端渲染的内容时尽可能保留结构，并补充事件绑定等 Client 特有内容的过程==。


