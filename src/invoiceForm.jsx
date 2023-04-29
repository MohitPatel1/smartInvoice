import React, { useEffect, useState } from 'react'
import { useForm, useFieldArray, useFormContext, FormProvider } from 'react-hook-form';
import getMasterDB from './database/getMasterDB';
// import { Button } from '@mui/material'

export default function InvoiceForm() {
  // let methods = useForm();
  const form = useForm({
    defaultValues: {
      customer: {
        name: '',
        number: '',
      },
      product: {
        id: '',
        name: '',
        quantity: 0,
        price: 0,
        size: '',
        color: '',
      },
      subtotal: 0,
    }
  });

  const { onChange } = useFormContext();
  const [masterDB, setMasterDB] = useState();
  const [reload, reloadPage] = useState()
  const { register, handleSubmit, formState, watch, reset, getValues, setValue } = form;
  // const { onChange, onBlur, name, ref } = register('quantity'); 
  const { errors, isSubmitSuccessful } = formState;
  // const watchForm = watch();
  // register('product.quantity')
  console.log('errors', errors)

  useEffect(() => {
    if (isSubmitSuccessful) {
      reloadPage()
      reset()
    }
  }, [isSubmitSuccessful, reset])

  useEffect(() => {
    const getData = async () => {
      // if master database is not created, create one and store it in masterDB
      if (!masterDB) {
        let tempMasterDB = await getMasterDB();
        console.log('getting masterDB');
        setMasterDB(tempMasterDB);
      }
      // if database exists
      if (masterDB) {
        await masterDB.allDocs().then(async (doc) => {
          console.log({ doc });
          // if database is empty, set data to empty array in invoice _id
          if (doc.total_rows == 0) {
            await masterDB
              .put({
                _id: 'invoice',
                dataArray: [],
              }).then((data) => {
                console.log({ data });
              });
          };
        })
        // if database have one invoice in it, get all docs
        await masterDB.get('invoice').then((doc) => {
          console.log(doc)
          let invoiceArray = doc.dataArray;
          console.log({ invoiceArray });
        })
      }
    }
    getData();
  }, [masterDB, reload])

  // when form is submitted, append data to pouchDB
  const onSubmit = async (values) => {
    console.log({ values });
    console.log('%c', { values }, 'background: #222; color: #bada55');
    await masterDB.get('invoice').then(async (doc) => {
      // previous data 
      console.log({ doc })
      let newDataArray = doc.dataArray;
      // appending new values to previous data array
      newDataArray.push(values)
      console.log({ newDataArray })
      // update masterDB
      await masterDB.put(doc)
    })
  }

  // onChange functions of forms
  const handleQuantityChange = () => {
    const data = getValues();
    const { product: { quantity, price } } = data;
    console.log({ quantity, price })
    setValue('subtotal', quantity * price)
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-control">
          <label htmlFor="customerName">Customer Name:</label>
          <input type="text" id='customerName' {...register('customer.name', {
            required: {
              value: true,
              message: 'Customer name is required',
            }
          })} />
          <p className='error'>{errors.customer?.name?.message}</p>
        </div>

        <div className="form-control">
          <label htmlFor="customerNumber">Customer Number:</label>
          <input type="text" id='customerNumber' {...register('customer.number', {
            disabled: watch('customer.name') === "",
            required: {
              value: true,
              message: 'Customer number is required',
            }
          })} />
          <p className='error'>{errors?.customer?.number?.message}</p>
        </div>

        <div className="form-control">
          <label htmlFor="productId">Product Id:</label>
          <input type="text" id='productId' {...register('product.id', {
            required: {
              value: true,
              message: 'Product Id is required',
            },
          },
          )} />
          <p className='error'>{errors?.product?.id?.message}</p>
        </div>

        <div className="form-control">
          <label htmlFor="productName">Product name:</label>
          <input type="text" id='productName' {...register('product.name', {
            disabled: watch('product.id') === "",
            required: {
              value: true,
              message: 'Product name is required',
            }
          })} />
          <p className='error'>{errors?.product?.name?.message}</p>
        </div>

        {/* Quantity */}
        <div className="form-control">
          <label htmlFor="productQuantity">Product quantity:</label>
          <input
            type="number"
            id='productQuantity'
            name='productQuantity'
            {...register('product.quantity', {
              disabled: watch('product.id') === "",
              valueAsNumber: true,
              onChange: () => handleQuantityChange(),
              required: {
                value: true,
                message: 'Product quantity is required',
              }
            })} />
          <p className='error'>{errors?.product?.quantity?.message}</p>
        </div>

        {/* Price */}
        <div className="form-control">
          <label htmlFor="productPrice">Product price:</label>
          <input type="number" id='productPrice' name='productPrice' {...register('product.price', {
            disabled: watch('product.id') === "",
            onChange: () => handleQuantityChange(),
            valueAsNumber: true,
            required: {
              value: true,
              message: 'Product price is required',
            },
            // onChange: {handleAmmountChange}
          })} />
          <p className='error'>{errors?.product?.price?.message}</p>
        </div>

        <div className="form-control">
          <label htmlFor="productSize">Product size:</label>
          <input type="text" id='productSize' {...register('product.size', {
            disabled: watch('product.id') === "",
            required: {
              value: true,
              message: 'Product size is required',
            }
          })} />
          <p className='error'>{errors?.product?.size?.message}</p>
        </div>

        <div className="form-control">
          <label htmlFor="productColor">Product color:</label>
          <input type="text" id='productColor' {...register('product.color', {
            disabled: watch('product.id') === "",
            required: {
              value: true,
              message: 'Product color is required',
            }
          })} />
          <p className='error'>{errors?.product?.color?.message}</p>
        </div>

        <div className="form-control">
          <label htmlFor="subtotal">Subtotal:</label>
          <input type="number" id='subtotal' {...register('subtotal', {
            valueAsNumber: true,
            disabled: true,
          })} />
          <p className='error'>{errors?.subtotal?.message}</p>
        </div>

        <button>Submit</button>
        <button type='button' onClick={() => reset()}>Reset</button>

        {/* <Button type='submit' variant='contained' color='primary' >
        Submit
      </Button> */}
      </form>
    </FormProvider>
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