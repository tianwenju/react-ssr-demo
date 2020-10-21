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
