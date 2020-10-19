import React from "react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <div>
      <Link to="/" style={{ marginRight: "30px" }}>
        Home
      </Link>

      <Link to="/person">Person</Link>
    </div>
  );
}
export default Header;
