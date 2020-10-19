import React from 'react';
import Header from '../header'
const handleClick = () => {
    alert('click')
}
function Home() {
    return (
        <div>
            <Header/>
            <div onClick={handleClick}> 这是home </div>
        </div>
    )
}
export default Home