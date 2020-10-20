//src/routes.js
import Home from './client/home'
import Person from './client/person'
export default [
    {
        path: "/",
        component: Home,
        exact: true,
        loadData: Home.loadData,//服务端获取异步数据的函数
        key: 'home'
    },
    {
        path: '/person',
        component: Person,
        exact: true,
        key: 'show'
    }
];
