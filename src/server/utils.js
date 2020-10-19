//src/server/utils.js
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