import React from 'react';
import { useEffect, useState } from "react";
import { useForm } from 'react-hook-form';
import getMasterDB from './database/getMasterDB'

export default function InvoiceForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [ masterDB , setMasterDB ] = useState(null)
  const [ reload , reloadPage ] = useState()
  const [count, setCount] = useState()


  const onSubmit = async (e) => {  
    console.log({e})
    // get documents array from masterDB
    // const currentOrders = await getMasterDB().get('orders')

    await getMasterDB().put({
      // ...currentOrders,
      _id: 'orders',
      orderId: '546',
      ordersList : 'lhjh'
    })
    console.log({currentOrders})
    // if currentOrders don't have data array in it create one
    // await (!currentOrders?.data) && (currentOrders.data = [])
    // console.log(currentOrders.data)
    // // new order appended to orders array
    // const newOrders = currentOrders.push(e)
    // console.log({newOrders})
    // // updated value set in database
    // await getMasterDB().put(newOrders)
    // reloadPage({});
  }

  console.log(errors);
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="text" placeholder="First name" {...register("First name", {required: true, maxLength: 80})} />
      <input type="text" placeholder="Last name" {...register("Last name", {required: true, maxLength: 100})} />
      <input type="text" placeholder="Email" {...register("Email", {required: true, pattern: /^\S+@\S+$/i})} />
      <input type="tel" placeholder="Mobile number" {...register("Mobile number", {required: true, minLength: 6, maxLength: 12})} />    
      <input type="submit" />
    </form>
  );
}
// useEffect(() => {
//   const getData = async () => {
//     if (!masterDB) {
//       let tempMasterDB = await getMasterDB();
//       console.log("getting masterDB");
//       setMasterDB(tempMasterDB);
//     }
//     if (masterDB) {
//       console.log("got masterdb");
//       await masterDB.allDocs().then(async (doc) => {
//         console.log(doc);
//         if (doc.total_rows == 0) {
//           await masterDB
//             .put({
//               _id: "invoiceBills",
//               data: [],
//             })
//             .then((data) => {
//               console.log(data);
//             });
//         }
//       });
//       await masterDB.get("invoiceBills").then((doc) => {
//         let contentData = doc.data;
//         console.log(contentData);
//         if (contentData) {
//           function groupBy(arr, key) {
//             return arr.reduce((acc, el) => {
//               acc[el[key]] = [...(acc[el[key]] || []), el];
//               return acc;
//             }, []);
//           }
//           const result = groupBy(contentData, "Date");
//           setContent(result);
//         }
//       });
//     }
//   };
//   getData();
// }, [masterDB, reload]);