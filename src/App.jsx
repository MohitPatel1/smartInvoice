import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import getMasterDB from './database/getMasterDB'
import InvoiceForm from './invoiceForm'

function App() {
  const [count, setCount] = useState(0)
  const handleCountOnClick = async (e) => {
    console.log(getMasterDB())
    const oldCount = await getMasterDB().get('clickCount')
    console.log(oldCount)
    getMasterDB().put({
      ...oldCount,
      _id: 'clickCount', 
      count: (oldCount?.count || 0) + 1
    })
  }

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={handleCountOnClick}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <InvoiceForm/>
    </>
  )
}

export default App
