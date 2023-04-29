import { Button } from '@mui/base';
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'

export default function AddBuyer() {
  const form = useForm({
    defaultValues: {
      companyName: '',
      ownerName: '',
      gstNo: '',
      number: '',
      email: '',
      address: '',
    }, mode: 'all'
  })

  const { register, formState, reset, handleSubmit, getValues } = form;
  const { errors, isSubmitSuccessful, isValid, isSubmitting } = formState;

  const onSubmit = () => {
    const data = getValues()
    console.log(data)
  }
  useEffect(() => {
    if (isSubmitSuccessful) {
      reset()
    }
  }, [isSubmitSuccessful, reset, handleSubmit])

  return (
    <form id='form' onSubmit={handleSubmit(onSubmit)}>
      <div className="form-control">
        <label htmlFor="companyName">Buyer Company Name:</label>
        <input type="text" id='companyName' {...register('companyName', {
          required: {
            value: true,
            message: 'This field is required',
          }
        })} />
        <p className='error'>{errors.companyName?.message}</p>
      </div>

      <div className="form-control">
        <label htmlFor="ownerName">Owner name:</label>
        <input type="text" id='ownerName' {...register('ownerName', {
        })} />
      </div>

      <div className="form-control">
        <label htmlFor="gstNo">GST number:</label>
        <input type="text" id='gstNo' {...register('gstNo', {
        })} />
      </div>

      <div className="form-control">
        <label htmlFor="number">Phone number:</label>
        <input type="text" id='number' {...register('number', {
        })} />
      </div>

      <div className="form-control">
        <label htmlFor="email">E-mail:</label>
        <input type="email" id='email' {...register('email', {
          pattern: {
            value: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
            message: 'Invalid email format'
          },
        })} />
        <p className='error'>{errors.email?.message}</p>
      </div>

      <div className="form-control">
        <div style={{display:'flex'}}>
          <label htmlFor="address">Address:</label>
          <textarea name="address" id="address" cols="30" rows="2" {...register('address', {
          })}></textarea>
        </div>
      </div>

      <br />
      <Button type='submit' variant="contained" disabled={!isValid || isSubmitting} color="success">
        Submit
      </Button>

    </form>
  )
}
