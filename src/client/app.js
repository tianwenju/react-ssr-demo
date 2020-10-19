import React from "react";
const handleClick = () => {
  alert("click");
};
function App1() {
  return (
    <button onClick={handleClick}>react-ssr1( 同构渲染（混合渲染）) </button>
  );
}
export default App1;
