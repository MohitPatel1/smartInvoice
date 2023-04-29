import { Autocomplete, Button, TextField } from '@mui/material';
import React, { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form';

export default function InvoiceForm() {

  const form = useForm({
    defaultValues: {
      product: [{
        id: '',
        name: '',
        quantity: 0,
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

  const { fields, append, remove } = useFieldArray({
    name: 'product',
    control
  })

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset()
    }
  }, [isSubmitSuccessful, reset])

  const onSubmit = data => console.log(data)

  const changeAmount = (e, index) => {
    const data = getValues()
    const { product } = data;
    const { quantity, rate } = product[index];
    setValue(`product.${index}.amount`, quantity * rate)
    const total = data.product.reduce((total , current) => {
      return total += current.amount
    },0)
    setValue('total',total)
  }

  const handleRemove = (index) => {
    remove(index);
    changeTotal()
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
      <Button className='addbuyer-button'id='addbuyer-button' variant="outlined">Add Buyer</Button>
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
                    })} />
                  </div>

                  <div className="form-control">
                    <label htmlFor="productSize">Size:</label>
                    <select id={`productSize-${index}`} {...register(`product.${index}.size`, {
                    })}>
                      <option value="">-- Select Size --</option>
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
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
                  {index > 0 && <Button variant="contained" onClick={()=>handleRemove(index)} color="secondary">
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
          disabled: true,
        })} />
      </div>
      <br />
      <Button type='submit' variant="contained" disabled={!isValid || isSubmitting} color="success">
        Submit
      </Button>
    </form>
  );
}