import React, { Component } from "react";
import { connect } from "react-redux";
import Header from "../header";
import { getHomeList } from "./store/actionCreators";

class Home extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.props.getHomeList();
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
