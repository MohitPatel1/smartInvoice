import React, { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form';
// import { Button } from '@mui/material'

export default function InvoiceForm() {

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
        color: '',
        amount: 0,
      }],
      total: 0,
    },
    mode: 'all',
  })

  const { register, handleSubmit, formState, watch, reset, control, setValue, getValues } = form;
  const { errors, isSubmitSuccessful, isValid, isSubmitting } = formState;
  // const watchForm = watch();

  const { fields, append, remove } = useFieldArray({
    name: 'product',
    control
  })

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset()
    }
  }, [isSubmitSuccessful, reset])

  const onSubmit = data => console.log(data);

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

      <div className="form-control">
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