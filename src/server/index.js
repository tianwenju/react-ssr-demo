import express from 'express'
import {render} from './utils'
import { matchRoutes } from 'react-router-config'
import routes from '../routes'
import store from '../store'
const app = new express();
app.use(express.static('public'))
app.get("*", (req, res) => {
  const matchedRoutes = matchRoutes(routes, req.path);
  const promises = [];
  matchedRoutes.forEach(item => {
      if (item.route.loadData) {
          promises.push(item.route.loadData(store));
      };
  });
  console.log(matchedRoutes)
  //等待所有异步结果执行完毕，服务端直出页面
  Promise.all(promises).then(_=>{
      res.send(render({
          req,
          store,
          routes
      }))

  })
})

app.listen(3004, () => {
  console.log("run server http://localhost:3004");
});
