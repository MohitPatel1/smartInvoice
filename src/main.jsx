import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import Trial from './Trial.jsx'
import DemoInvoice from './DemoInvoice.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* <Trial /> */}
    <DemoInvoice />
  </React.StrictMode>,
)
