import React from 'react';
import { hydrate } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import Routes from '../routes'
function App() {
    return (
        <BrowserRouter>
            {Routes}
        </BrowserRouter>
    )
}
hydrate(<App />, document.getElementById("root"))