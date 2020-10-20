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
                state: ${JSON.stringify(store.getState())}
            }
        </script>
            <script src="/index.js"></script>
           
        </html>
    `;
};
