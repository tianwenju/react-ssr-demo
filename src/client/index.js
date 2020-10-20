//src/clict/index.js
import React from "react";
import { hydrate } from "react-dom";
import { BrowserRouter, Route } from "react-router-dom";
import Routes from "../routes";
import { Provider } from "react-redux";
import { getClientStore } from "../store";
function App() {
  return (
    <Provider store={getClientStore()}>
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
