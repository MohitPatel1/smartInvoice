import { PDFDownloadLink } from "@react-pdf/renderer";
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import getMasterDB from './database/getMasterDB'

import InvoiceForm from './invoiceForm'
import { FormProvider } from 'react-hook-form'
import InvoicePdf from "./InviocePdf";


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
    <div className = "App">
    <PDFDownloadLink Document={<InvoicePdf />} filename = "Invoice"> 
    <button>Download</button>
    </PDFDownloadLink>
    <InvoicePdf />
  </div>
      {/* <FormProvider>
        <InvoiceForm/>
      </FormProvider> */}
    </>
  )
}

export default App
