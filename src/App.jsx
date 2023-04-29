import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import getMasterDB from './database/getMasterDB'

import InvoiceForm from './invoiceForm'
import { FormProvider } from 'react-hook-form'


function App() {
  const [count, setCount] = useState(0)
  const handleCountOnClick = async (e) => {
    console.log(getMasterDB())
    // const oldCount = await getMasterDB().get('clickCount')
    // console.log(oldCount)
    getMasterDB().put({
      // ...oldCount,
      _id: 'clickCount', 
      // count: (oldCount?.count || 0) + 1
      count: 1
    })
  }

  return (
    <>
      <FormProvider>
        <InvoiceForm/>
      </FormProvider>
    </>
  )
}

export default App
