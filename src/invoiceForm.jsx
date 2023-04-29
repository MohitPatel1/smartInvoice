// react
import React, { useEffect, useState } from 'react'
// form
// import { useForm ,useFieldArray, useFormContext , Controller, useWatch, FormProvider} from 'react-hook-form';
import { useForm, FormProvider, useFormContext, useFieldArray } from "react-hook-form";
// pouchdb
import getMasterDB from './database/getMasterDB';
// material UI
import { Autocomplete, Button, TextField } from '@mui/material';
// react router dom
import { useNavigate } from "react-router-dom";

export default function InvoiceForm() {
  // let methods = useForm();
  const form = useForm({
    defaultValues: {
      product: [{
        image: '',
        id: '',
        name: '',
        quantity: 0,
        rate: 0,
        size: '',
        color: '',
        amount: 0,
      }
      ],
      total: 0,
    }
  });

  const { onChange } = useFormContext();

  const [masterDB, setMasterDB] = useState();
  const [reload, reloadPage] = useState()
  const { register, handleSubmit, formState, watch, reset, control, setValue, getValues } = form;
  const navigate = useNavigate();
  const { errors, isSubmitSuccessful, isValid, isSubmitting } = formState;
  console.log('errors', errors)


  const { fields, append, remove } = useFieldArray({
    name: 'product',
    control
  })

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
      values.product.image = image;
      newDataArray.push(values)
      console.log({ newDataArray })
      doc.dataArray = newDataArray
      // update masterDB
      await masterDB.put(doc)
    });
    setImage('')
  }

  const [image, setImage] = useState();

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file && file.type.includes('image/')) {
      setImage(file);
    } else {
      alert('Please select an image file.');
    }
  }

  const changeAmount = (e, index) => {
    const data = getValues()
    const { product } = data;
    const { quantity, rate } = product[index];
    setValue(`product.${index}.amount`, (quantity * rate))
    const total = data.product.reduce((total, current) => {
      return total += current.amount
    }, 0)
    setValue('total', total)
  }

  const handleRemove = (index) => {
    const data = getValues()
    const { product, total } = data;
    const { amount } = product[index];
    remove(index);
    let temp = total - amount;
    setValue('total', temp)
  }

  return (
    <form id='form' onSubmit={handleSubmit(onSubmit)} noValidate>
      <div id='buyer-select'>
        <Autocomplete className='search'
          id="grouped-demo"
          options={[]}
          groupBy={(option) => option.firstLetter}
          getOptionLabel={(option) => option.title}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Existing Buyers" />}

        />
        <Button className='addbuyer-button' id='addbuyer-button' variant="outlined" onClick={() => navigate("/addBuyer")}>
          Add Buyer
        </Button>
      </div>
      <div id='date'>
        <input style={{direction:'flex-end'}} type="date" />
      </div>
      <div className='products-container'>
        <h1>Products</h1>
        <div>
          {
            fields.map((field, index) => {
              return (
                <div className='product' key={field.id}>
                  <h3>Product {index + 1}</h3>

                  <div className="form-control">
                    <label id="imageUpload" htmlFor="imageUpload">Upload an image:</label>
                    <input
                      id="imageUpload"
                      type="file"
                      accept="image/*"                      
                      onChange={(e) => {
                        const fileReader = new FileReader();
                        fileReader.onload = () => {
                          if (fileReader.readyState === 2) {
                            setImage(fileReader.result);
                          }
                        };
                        fileReader.readAsDataURL(e.target.files[0]);
                      }}
                    />
                    {image ? (
                    <img                     
                      src={image}
                      alt="image"
                      width={'50px'}
                    />
                  ) : (
                    ""
                  )}
                  </div>


                  <div className="form-control">
                    <label htmlFor="productId">Id:</label>
                    <input type="text" id={`productId-${index}`} {...register(`product.${index}.id`, {
                      required: {
                        value: true,
                        message: 'Product Id is required',
                      }
                    })} />
                    <p className='error'>{errors.product && errors.product[index]?.id?.message}</p>
                  </div>

                  <div className="form-control">
                    <label htmlFor="productName">Name:</label>
                    <input type="text" id={`productName-${index}`} {...register(`product.${index}.name`, {
                    })} />
                  </div>

                  <div className="form-control">
                    <label htmlFor="productSize">Size:</label>
                    <select id={`productSize-${index}`} {...register(`product.${index}.size`, {
                    })}>
                      <option value="">-- Select Size --</option>
                      <option value="XS">28</option>
                      <option value="S">30</option>
                      <option value="M">32</option>
                      <option value="L">34</option>
                      <option value="XL">36</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label htmlFor="productColor">Color:</label>
                    <input type="text" id={`productColor-${index}`} {...register(`product.${index}.color`, {
                    })} />
                  </div>

                  <div className="form-control">
                    <label htmlFor="productQuantity">Quantity:</label>
                    <input type="number" name={`productQuantity-${index}`} id={`productQuantity-${index}`} {...register(`product.${index}.quantity`, {
                      valueAsNumber: true,
                      onChange: (e) => changeAmount(e, index),
                    })} />
                  </div>

                  <div className="form-control">
                    <label htmlFor="productRate">Rate:</label>
                    <input type="number" name={`productRate-${index}`} id={`productRate-${index}`} {...register(`product.${index}.rate`, {
                      valueAsNumber: true,
                      onChange: (e) => changeAmount(e, index),
                    })} />
                  </div>

                  <div className="form-control">
                    <label htmlFor="productAmount">Amount:</label>
                    <input type="number" name={`productAmount-${index}`} id={`productAmount-${index}`} {...register(`product.${index}.amount`, {
                      valueAsNumber: true,
                    })} />
                  </div>
                  <br />
                  {(index > 0 || fields.length > 1) && <Button variant="contained" onClick={() => handleRemove(index)} color="secondary">
                    Remove
                  </Button>}
                </div>
              )
            })
          }
          <Button variant="contained" onClick={() => append({
            id: '',
            name: '',
            quantity: 0,
            rate: 0,
            size: '',
            color: '',
            amount: 0,
          })}>Add product</Button>
        </div>
      </div>




      <div className="form-control">
        <label htmlFor="total">Total:</label>
        <input type="number" id='total' {...register('total', {
          valueAsNumber: true,
        })} />
      </div>
      <br />
      <Button type='submit' variant="contained" disabled={!isValid || isSubmitting} color="success">
        Submit
      </Button>
    </form>
  );
}