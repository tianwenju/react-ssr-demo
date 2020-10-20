import { CHANGE_LIST } from "./actionTypes";

const changeList = (list) => ({ type: CHANGE_LIST, list });

import axios from "axios";
export const getHomeList = () => {
  return (dispatch) => {
    return axios
      .get("https://easy-mock.com/mock/5f8e7d03aed7a3476f0515a8/example/home")
      .then((res) => {
        const list = res.data.list;
        dispatch(changeList(list));
      })
      .catch((err) => {
        console.log(JSON.stringify(err));
      });
  };
};
