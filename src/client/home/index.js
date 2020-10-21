import React, { Component } from "react";
import { connect } from "react-redux";
import Header from "../header";
import { getHomeList } from "./store/actionCreators";
import { Helmet } from "react-helmet";

class Home extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    // this.props.getHomeList();
  }

  static async getInitialProps(store) {
    await store.dispatch(getHomeList());
  }

  render() {
    return (
      <>
        <Helmet>
          <title>服务端渲染</title>
          <meta name="description" content="react ssr" />
        </Helmet>
        <Header></Header>
        {this.props.list.map((item) => (
          <div key={item.id}>{item.text}</div>
        ))}
      </>
    );
  }
}

//入参为服务端store,返回一个填充好数据的store,形式为promise
Home.loadData = (store) => {
  return store.dispatch(getHomeList());
};

const mapStateToProps = (state) => ({
  list: state.home.list,
});
const mapDispatchToProps = (dispatch) => ({
  // getHomeList() {
  //   dispatch(getHomeList());
  // },
});
export default connect(mapStateToProps, mapDispatchToProps)(Home);
