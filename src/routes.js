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
