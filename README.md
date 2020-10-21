### SSR介绍
Server Slide Rendering  服务端渲染
### 为什么使用服务器端渲染(SSR)？
1. 更好的搜索引擎优化（Search-Engine-Optimization，SEO）
    * 大部分网站都希望自己能够出现在搜索引擎的搜索页前列，这个前提就是网页内容要能够被搜索引擎的爬虫正确抓取到。虽然 Google 这样的搜索引擎已经可以检索浏览器端渲染的网页，但毕竟不是全部搜索引擎都能做到，如果搜索引擎的爬虫只能拿到服务器端渲染的内容，完全浏览器端渲染就行不通了
2.  可以缩短“第一有意义渲染时间”（First-Meaningful-Paint-Time）解决首屏白屏问题
    * 如果完全依赖于浏览器端渲染，那么服务器端返回的 HTML 就是一个空荡荡的框架和对 JavaScript 的应用，然后浏览器下载 JavaScript，再根据 JavaScript 中的 AJAX 调用获取服务器端数据，再渲染出 DOM 来填充网页内容，总共需要三个 HTTP 或 HTTPS 请求。
    * 如果使用服务器端渲染，第一个 HTTP/HTTPS 请求返回的 HTML 里就包含可以渲染的内容了，这样用户第一时间就会感觉到“有东西画出来了”，这样的感知性能更好。
### SSR+SPA 体验升级
只实现 SSR 其实没啥意义，技术上没有任何发展和进步，否则 SPA 技术就不会出现。

但是单纯的 SPA又不够完美，所以最好的方案就是这两种体验和技术的结合，第一次访问页面是服务端渲染，基于第一次访问后续的交互就是 SPA 的效果和体验，还不影响 SEO 效果，这就有点完美了。

单纯实现 ssr 很简单，毕竟这是传统技术，也不分语言，随便用 php 、jsp、asp、node 等都可以实现。

但是要实现两种技术的结合，同时可以最大限度的重用代码（同构），减少开发维护成本，那就需要采用 react 或者 vue 等前端框架相结合 node(ssr) 来实现。

本文主要说 ReactSSR技术 ,当然 vue 也一样，只是技术栈不同而已
### 核心原理(基于React+Express)
如下图：
![image](http://5b0988e595225.cdn.sohucs.com/images/20190919/745b23c1ac124d31a8b4af5cc8134b89.jpeg)

整体来说 react 服务端渲染原理不复杂，其中最核心的内容就是同构。

node server 接收客户端请求，得到当前的 req url path,然后在已有的路由表内查找到对应的组件，拿到需要请求的数据，将数据作为 props 、 context或者 store 形式传入组件，然后基于 react 内置的服务端渲染api renderToString()orrenderToNodeStream() 把组件渲染为 html字符串或者 stream流, 在把最终的 html 进行输出前需要将数据注入到浏览器端(注水)，server 输出(response)后浏览器端可以得到数据(脱水)，浏览器开始进行渲染和节点对比，然后执行组件的 componentDidMount 完成组件内事件绑定和一些交互，浏览器重用了服务端输出的 html节点，整个流程结束。

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

[代码传送门](https://github.com/tianwenju/react-ssr-demo/tree/ssr-demo1)


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
[代码传送门](https://github.com/tianwenju/react-ssr-demo/tree/ssr-demo2)
### react-ssr 数据同构

#### 写法
> 前端使用redux方式不变，后端需要给你静态路由的Provider提供一份store


1. 创建共用store,前后端共用一份store.
```
//src/store/index.js

import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk'
import reducer from './reducer'
const store = createStore(reducer, applyMiddleware(thunk));
export default store;


//src/store/reducer.js

import { combineReducers } from 'redux'
import { homeReducer } from '../client/home/store'
export default combineReducers({
    home: homeReducer,
})

```
2. Home组件Store维护
```
//src/client/home/store/index.js
import homeReducer from './reducer';
import * as actionCreators from './actionCreators';
import * as actionTypes from './actionTypes';
export { homeReducer, actionCreators, actionTypes };


//src/client/home/store/reducer.js
import { CHANGE_LIST } from "./actionTypes";
const defaultState = {
    list: []
}

export default (state = defaultState, action) => {
    switch (action.type) {
        case CHANGE_LIST:
            return { 
                ...state, 
                list:action.list
             }
        default:
            return state;
    }
}

//src/client/home/store/actionTypes.js
export const CHANGE_LIST = 'HOME/CHANGE_LIST';

//src/client/home/store/actionCreators.js
import { CHANGE_LIST } from "./actionTypes";

const changeList = (list) => ({ type: CHANGE_LIST, list });

import axios from "axios";
export const getHomeList = () => {
  return (dispatch) => {
    return axios
      .get("ttps://lengyuexin.github.io/json/text.json")
      .then((res) => {
        const list = res.data.list;
        dispatch(changeList(list));
      })
      .catch((err) => {
        console.log(JSON.stringify(err));
      });
  };
};
```
3. Home组件 获取数据
```
import React, { Component } from "react";
import { connect } from "react-redux";
import Header from "../header";
import { getHomeList } from "./store/actionCreators";

class Home extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.props.getHomeList(); // 此处发起网络请求获取数据。
  }
  render() {
    return (
      <>
        <Header></Header>
        {this.props.list.map((item) => (
          <div key={item.id}>{item.text}</div>
        ))}
      </>
    );
  }
}
const mapStateToProps = (state) => ({
  list: state.home.list,
});
const mapDispatchToProps = (dispatch) => ({
  getHomeList() {
    dispatch(getHomeList());
  },
});
export default connect(mapStateToProps, mapDispatchToProps)(Home);

```
4. 前端路由设置Store
```
//src/client/index.js
import React from 'react';
import { hydrate } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import Routes from '../routes'
import { Provider } from 'react-redux'
import store from '../store'
function App() {
    return (
        <Provider store={store}>
            <BrowserRouter>
                {Routes}
            </BrowserRouter>
        </Provider>
    )
}
hydrate(<App />, document.getElementById("root"))s
```
5. 后端路由设置Store

```
//src/server/index.js
import express from 'express'
import {render} from './utils'
const app = new express();
app.use(express.static('public'))
app.get("*", (req, res) => {
    res.send(render(req))
})

app.listen(3000, () => {
    console.log('run server 3000')
})

//src/server/utils
import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import Routes from '../routes'
import store from '../store'
import { Provider } from 'react-redux'
export const render = (req) => {
    const content = renderToString(
        <Provider store={store}>
            <StaticRouter location={req.path} >
                {Routes}
            </StaticRouter>
        </Provider>
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
6. 运行效果如下：

![图片](http://chuantu.xyz/t6/741/1603178882x1033347913.png)

[代码传送门](https://github.com/tianwenju/react-ssr-demo/tree/ssr-demo3)
#### 存在的问题
我们看下返回的Html结构：
```
        <html>
            <head>
                <title>react-ssr</title>
            </head>
            <body>
            <div id="root"><div><div><a style="margin-right:30px" href="/">Home</a><a href="/person">Person</a></div></div></div>
            </body>
            <script src="/index.js"></script>
        </html>
    
```
没有我们想要的效果图上的dom节点。还是通过脚本
<script src="/index.js"></script>浏览器渲染的。那问题出现在哪里？
问题出现在Home组件的写法里，我们看下Home组件
```
class Home extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.props.getHomeList(); // 此处发起网络请求获取数据。
  }
  render() {
    return (
      <>
        <Header></Header>
        {this.props.list.map((item) => (
          <div key={item.id}>{item.text}</div>
        ))}
      </>
    );
  }
}
const mapStateToProps = (state) => ({
  list: state.home.list,
});
const mapDispatchToProps = (dispatch) => ({
  getHomeList() {
    dispatch(getHomeList());
  },
});
export default connect(mapStateToProps, mapDispatchToProps)(Home);
```
我们是在组件挂载的时候发起网络请求的，在服务器端是无法执行组件挂载的方法的，那在服务器端数据就会没有，相应的
```
 {this.props.list.map((item) => (
          <div key={item.id}>{item.text}</div>
        ))}
```
的div节点也不会渲染出来。

那界面显示的数据来源来自哪里？
其实是来自客户端执行组件挂载请求数据，得来的，显然不是我们想要的效果。
那该怎么办呢?这需要我们在服务器端请求完数据，进行预加载，然后客户端拿到数据进行渲染。
#### 数据预加载
1. 我们定一个路由表维护关系，方便我们管理。
```
//src/routes.js
import Home from './client/home'
import Person from './client/person'
export default [
    {
        path: "/",
        component: Home,
        exact: true,
       // loadData: // Home.loadData,// 另一种通过loadData写法，服务端获取异步数据的函数
        key: 'home'
    },
    {
        path: '/person',
        component: Person,
        exact: true,
        key: 'show'
    }
];

```
2. 重新改造前端路由。将映射关系传入Router
```
//src/clict/index.js
import React from 'react';
import { hydrate } from 'react-dom'
import { BrowserRouter,Route } from 'react-router-dom'
import Routes from '../routes'
import { Provider } from 'react-redux'
import store from '../store'
function App() {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <div>
                    {
                        // 将配置属性逐一传入
                        Routes.map(route => {
                           return <Route {...route} />
                        })
                    }
                </div>
            </BrowserRouter>
        </Provider>
    )
}
hydrate(<App />, document.getElementById("root"))
```
3. 重新改造后端路由,将映射关系传入后端路由
```
//src/server/utils.js
import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter,Route } from 'react-router-dom'
import Routes from '../routes'
import store from '../store'
import { Provider } from 'react-redux'
export const render = (req) => {
    const content = renderToString(
        <Provider store={store}>
            <StaticRouter location={req.path} >
                <div>
                    {
                        Routes.map(route => {
                            return <Route {...route} />
                        })
                    }
                </div>
            </StaticRouter>
        </Provider>
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
4. 前端Home组件改造

我们设想有服务器请求数据，那么就可以去掉
客户端加载数据的地方。
```
import React, { Component } from "react";
import { connect } from "react-redux";
import Header from "../header";
import { getHomeList } from "./store/actionCreators";

class Home extends Component {
  constructor(props) {
    super(props);
  }
  //componentDidMount() {
    // this.props.getHomeList();    去除 挂载时候加载数据
  //}
  
  static async getInitialProps(store) {
    await store.dispatch(getHomeList());
  }
  render() {
    return (
      <>
        <Header></Header>
        {this.props.list.map((item) => (
          <div key={item.id}>{item.text}</div>
        ))}
      </>
    );
  }
}

<!--// 另一种LoadData写法，入参为服务端store,返回一个填充好数据的store,形式为promise-->
<!--Home.loadData=(store)=>{-->
<!--  return store.dispatch(getHomeList())-->
<!--}-->

const mapStateToProps = (state) => ({
  list: state.home.list,
});
const mapDispatchToProps = (dispatch) => ({
  // getHomeList() { // 去除
  //   dispatch(getHomeList());
  // },
});
export default connect(mapStateToProps, mapDispatchToProps)(Home);

```
5. 服务端根据路由匹配相应的组件加载数据
```
import express from "express";
import { render } from "./utils";
import { matchRoutes } from "react-router-config";
import routes from "../routes";
import store from "../store";
const app = new express();
app.use(express.static("public"));
app.get("*", (req, res) => {
  const matchedRoutes = matchRoutes(routes, req.path);

  matchedRoutes.forEach((item) => {
    if (item.route.component.getInitialProps) {
      console.log(item.route.component.getInitialProps);
      item.route.component.getInitialProps(store);
    }
  });
  res.send(
    render({
      req,
      store,
      routes,
    })
  );

  // 另一种通过loadData的实现方式
  // const promises = [];
  // matchedRoutes.forEach(item => {
  //     if (item.route.loadData) {
  //         promises.push(item.route.loadData(store));
  //     };
  // });

  //等待所有异步结果执行完毕，服务端直出页面
  // Promise.all(promises).then((_) => {
  //   res.send(
  //     render({
  //       req,
  //       store,
  //       routes,
  //     })
  //   );
  // });
});

app.listen(3004, () => {
  console.log("run server http://localhost:3004");
});


```
运行时候发现，客户端数据为null,why?

客户端再次执行js的时候会重新重置Store，导致数据清空，这时候该怎么办？

服务器获取数据完成后，利用window对象存储数据，在执行js的时候，再重新把数据给Store.这也就是数据注水和脱水。

#### 数据注水和脱水
在服务端直出带数据的页面时，将store存储在全局变量中，为前端store数据获取做准备的过程叫做数据注水。
```
//src/server/utils.js
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter, Route } from "react-router-dom";
import Routes from "../routes";
import store from "../store";
import { Provider } from "react-redux";
export const render = (req) => {
  const content = renderToString(
    <Provider store={store}>
      <StaticRouter location={req.path}>
        <div>
          {Routes.map((config) => {
            return <Route {...config} />;
          })}
        </div>
      </StaticRouter>
    </Provider>
  );
  return `
        <html>
            <head>
                <title>react-ssr</title>
            </head>
            <body>
            <div id="root">${content}</div>
            </body>
            <script>
            window.context = {
                state: ${JSON.stringify(store.getState())} // 存储起来
            }
        </script>
            <script src="/index.js"></script>
           
        </html>
    `;
};


```
前端获取来自全局变量中的数据并填充自身，用于页面数据渲染的过程叫数据脱水。

```
export const getClientStore = () => {
  const defaultState = window.context ? window.context.state : {};
  return createStore(reducer, defaultState, applyMiddleware(thunk));
};
function App() {
  return (
    <Provider store={getClientStore()}> //重新填充Store.
      <BrowserRouter>
        <div>
          {
            // 将配置属性逐一传入
            Routes.map((route) => {
              return <Route {...route} />;
            })
          }
        </div>
      </BrowserRouter>
    </Provider>
  );
}
hydrate(<App />, document.getElementById("root"));
```
#### SEO
使用react-helmet完成seo,需要前端编写seo相关代码，服务端获取后直出

前端代码
```
import { Helmet } from 'react-helmet';

//...

render(){
    return (
        //...
      <Helmet>
        <title>服务端渲染</title>
        <meta name="description" content="react ssr" />
      </Helmet>
      //...
    )
}

//...
```
服务端代码
```
import { Helmet } from 'react-helmet';
//该方法放在renderToString之后
 const helmet = Helmet.renderStatic();

 //直出代码
//...
  `<head>
    <title>react-ssr</title>
    ${helmet.title.toString()}
    ${helmet.meta.toString()}
 </head>`
//...
```
[代码传送门](https://github.com/tianwenju/react-ssr-demo/tree/ssr-demo4)