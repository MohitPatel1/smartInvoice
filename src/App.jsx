import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import getMasterDB from './database/getMasterDB'
import InvoiceForm from './invoiceForm'
import { FormProvider } from 'react-hook-form'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AddBuyer from './AddBuyer'

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route exact path="/" element={<FormProvider><InvoiceForm/></FormProvider>} />
          <Route exact path="/addBuyer" element={<AddBuyer />} />          
        </Routes>
        {/* <ToastContainer /> */}
      </Router>
    </>
  )
}

export default App
