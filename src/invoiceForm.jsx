// react
import React, { useEffect , useState } from 'react'
// form
// import { useForm ,useFieldArray, useFormContext , Controller, useWatch, FormProvider} from 'react-hook-form';
import { useForm, FormProvider, useFormContext, useFieldArray } from "react-hook-form";
// pouchdb
import getMasterDB from './database/getMasterDB';

export default function InvoiceForm() {
  // let methods = useForm();
  const form = useForm({
    defaultValues: {
      buyer: {
        name: '',
        address: '',
        contact: {
          number: '',
          email: ''
        }
      },
      product: [{
        id: '',
        name: '',
        quantity: 1,
        rate: 0,
        size: '',
        color:'',
        subtotal: 0,
      },
    ]
    }
  });

  const { onChange } = useFormContext();

  const [ masterDB , setMasterDB ] = useState();
  const [ reload , reloadPage ] = useState()  
  const { register, handleSubmit, formState, watch, reset, control, setValue, getValues } = form;
  // const { onChange, onBlur, name, ref } = register('quantity'); 
  const { errors, isSubmitSuccessful, isValid, isSubmitting } = formState;
  // const watchForm = watch();
  // register('product.quantity')
  console.log('errors',errors)
  
       

  // const watchForm = watch();

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
  
  useEffect( () => {
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
          console.log({doc});
          // if database is empty, set data to empty array in invoice _id
          if (doc.total_rows == 0){
            await masterDB
            .put({
              _id: 'invoice',
              dataArray: [],
            }).then((data) => {
              console.log({data});
            });
          };
        })
        // if database have one invoice in it, get all docs
        await masterDB.get('invoice').then((doc) => {
          console.log(doc)
          let invoiceArray = doc.dataArray;
          console.log({invoiceArray});        
        })
      }
    }
    getData();
  }, [masterDB , reload])

  // when form is submitted, append data to pouchDB
  const onSubmit = async (values) => {
    console.log({values});
    console.log('%c', {values}, 'background: #222; color: #bada55');
    await masterDB.get('invoice').then(async (doc) => {
      // previous data 
      console.log({doc})
      let newDataArray = doc.dataArray;
      // appending new values to previous data array
      newDataArray.push(values)
      console.log({newDataArray})
      // update masterDB
      await masterDB.put(doc)
    })
  }

  // onChange functions of forms
  const handleQuantityChange = () => {
    const quantity = getValues('productQuantity');
    console.log({quantity});
  }

  const changeAmount = (e,index) => {
    const data = getValues()
    const {product}=data;
    const {quantity,rate}=product[index]
    setValue(`product.${index}.amount`,quantity*rate)
    // console.log({quantity,rate})
  }

  return (
    <form id='form' onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-control">
        <label htmlFor="buyerName">Buyer:</label>
        <input type="text" id='buyerName' {...register('buyer.name', {
          required: {
            value: true,
            message: 'Buyer name is required',
          }
        })} />
        <p className='error'>{errors.buyer?.name?.message}</p>
      </div>

      <div className="form-control">
        <label htmlFor="buyerAddress">Buyer's address:</label>
        <input type="text" id='buyerAddress' {...register('buyer.address', {
          disabled: watch('buyer.name') === "",
          required: {
            value: true,
            message: 'Buyer\'s address is required',
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
        <p className='error'>{errors.buyer?.address?.message}</p>
      </div>

      <div className="form-control">
        <label htmlFor="buyerNumber">Buyer's number:</label>
        <input type="text" id='buyerNumber' {...register('buyer.contact.number', {
          disabled: watch('buyer.name') === "",
        })} />
        <p className='error'>{errors.buyer?.contact?.number?.message}</p>
      </div>

      <div className="form-control">
        <label htmlFor="buyerEmail">Buyer's email:</label>
        <input type="email" id='buyerEmail' {...register('buyer.contact.email', {
          disabled: watch('buyer.name') === "",
          pattern: {
            value: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
            message: 'Invalid email format'
          }
        })} />
        <p className='error'>{errors?.product?.name?.message}</p>
        <p className='error'>{errors.buyer?.contact?.email?.message}</p>
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
                    <label id='imageUpload' htmlFor="imageUpload">Upload an image:</label>
                    <input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      {...register('image')}
                    />
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
                      disabled: watch(`product.${index}.id`) === "",
                      required: {
                        value: true,
                        message: 'Product name is required',
                      }
                    })} />
                    <p className='error'>{errors.product && errors.product[index]?.name?.message}</p>
                  </div>

                  <div className="form-control">
                    <label htmlFor="productSize">Size:</label>
                    <select id={`productSize-${index}`} {...register(`product.${index}.size`, {
                      disabled: watch(`product.${index}.id`) === "",
                      required: {
                        value: true,
                        message: 'Product size is required',
                      }
                    })}>
                      <option value="">-- Select Size --</option>
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                    </select>

                    <p className='error'>{errors.product && errors.product[index]?.size?.message}</p>
                  </div>

                  <div className="form-control">
                    <label htmlFor="productColor">Color:</label>
                    <input type="text" id={`productColor-${index}`} {...register(`product.${index}.color`, {
                      disabled: watch(`product.${index}.id`) === "",
                      required: {
                        value: true,
                        message: 'Product color is required',
                      }
                    })} />
                    <p className='error'>{errors.product && errors.product[index]?.color?.message}</p>
                  </div>

                  <div className="form-control">
                    <label htmlFor="productQuantity">Quantity:</label>
                    <input type="number" name={`productQuantity-${index}`} id={`productQuantity-${index}`} {...register(`product.${index}.quantity`, {
                      disabled: watch(`product.${index}.id`) === "",
                      valueAsNumber: true,
                      onChange:(e)=>changeAmount(e,index),
                      required: {
                        value: true,
                        message: 'Product quantity is required',
                      }
                    })} />
                    <p className='error'>{errors.product && errors.product[index]?.quantity?.message}</p>
                  </div>

                  <div className="form-control">
                    <label htmlFor="productRate">Rate:</label>
                    <input type="number" name={`productRate-${index}`} id={`productRate-${index}`} onBlur={() => changeAmount()} {...register(`product.${index}.rate`, {
                      disabled: watch(`product.${index}.id`) === "",
                      valueAsNumber: true,
                      onChange:(e)=>changeAmount(e,index),
                      required: {
                        value: true,
                        message: 'Product rate is required',
                      }
                    })} />
                    <p className='error'>{errors.product && errors.product[index]?.rate?.message}</p>
                  </div>

                  <div className="form-control">
                    <label htmlFor="productAmount">Amount:</label>
                    <input type="number" name={`productAmount-${index}`} id={`productAmount-${index}`} {...register(`product.${index}.amount`, {
                      disabled: true,
                      valueAsNumber: true,
                    })} />
                  </div>

                  {index > 0 && <button type='button' onClick={() => remove(index)}>Remove</button>}
                </div>
              )
            })
          }
          <button type='button' onClick={() => append({
            id: '',
            name: '',
            quantity: 1,
            rate: 0,
            size: '',
            color: '',
            amount: 0,
          })}>Add product</button>
        </div>
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
        <label htmlFor="total">Total:</label>
        <input type="number" id='total' {...register('total', {
          valueAsNumber: true,
          disabled: true,
        })} />
      </div>

      <button disabled={!isValid || isSubmitting}>Submit</button>
      <button type='button' onClick={() => reset()}>Reset</button>

      {/* <Button type='submit' variant='contained' color='primary' >
        Submit
      </Button> */}
      </form>
  );
}