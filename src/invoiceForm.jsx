import React, { useEffect } from 'react'
import { useForm ,useFieldArray} from 'react-hook-form';
// import { Button } from '@mui/material'

export default function InvoiceForm() {

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
        color:'',
      },
      subtotal: 0,
    }
  })

  const { register, handleSubmit, formState, watch, reset } = form;
  const { errors,isSubmitSuccessful } = formState;
  // const watchForm = watch();

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset()
    }
  }, [isSubmitSuccessful, reset])

  const onSubmit = data => console.log(data);
  // console.log(errors);

  return (
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
        <p className='error'>{errors.customer?.number?.message}</p>
      </div>

      <div className="form-control">
        <label htmlFor="productId">Product Id:</label>
        <input type="text" id='productId' {...register('product.id', {
          required: {
            value: true,
            message: 'Product Id is required',
          }
        })} />
        <p className='error'>{errors.product?.id?.message}</p>
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
        <p className='error'>{errors.product?.name?.message}</p>
      </div>

      <div className="form-control">
        <label htmlFor="productQuantity">Product quantity:</label>
        <input type="number" id='productQuantity' {...register('product.quantity', {
          disabled: watch('product.id') === "",
          valueAsNumber: true,
          required: {
            value: true,
            message: 'Product quantity is required',
          }
        })} />
        <p className='error'>{errors.product?.quantity?.message}</p>
      </div>

      <div className="form-control">
        <label htmlFor="productPrice">Product price:</label>
        <input type="number" id='productPrice' {...register('product.price', {
          disabled: watch('product.id') === "",
          valueAsNumber: true,
          required: {
            value: true,
            message: 'Product price is required',
          }
        })} />
        <p className='error'>{errors.product?.price?.message}</p>
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
        <p className='error'>{errors.product?.size?.message}</p>
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
        <p className='error'>{errors.product?.color?.message}</p>
      </div>

      <div className="form-control">
        <label htmlFor="subtotal">Subtotal:</label>
        <input type="number" id='subtotal' {...register('subtotal', {
          valueAsNumber: true,
          disabled: true,
        })} />
        <p className='error'>{errors.subtotal?.message}</p>
      </div>

      <button>Submit</button>
      <button type='button' onClick={() => reset()}>Reset</button>
      
      {/* <Button type='submit' variant='contained' color='primary' >
        Submit
      </Button> */}

    </form>
  );
}