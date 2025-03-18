import { ChangeEvent, useState } from 'react'
import { Checkbox, FormControlLabel, Grid } from '@material-ui/core'

import SelectWithLoading from '../DropDown/SelectWithLoading'
import FormButtons from '../FormButtons/FormButtons'
import TextFieldWithValidation from '../TextField/TextFieldWithValidation'

import { UserRole } from '../../shared/entities'

export interface UserFormProps {
  availableRoles: UserRole[]
}

export default function UserForm({
  availableRoles,
}: UserFormProps): JSX.Element {
  const [name] = useState('')
  const [lastName] = useState('')
  const [email] = useState('')
  const [role] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  const handleNameChanged = () => {}

  const handleRequiredBlurred = () => {}

  const handleIsAdminChanged = (e: ChangeEvent<HTMLInputElement>) => {
    setIsAdmin(e.target.checked)
  }

  const handleSubmitButton = () => {}

  const handleCancelButton = () => {}

  return (
    <>
      <Grid container>
        <Grid item xs={12} sm={12}>
          <TextFieldWithValidation
            id="name"
            name="name"
            label="Name"
            value={name}
            required={true}
            error={false}
            helperText={''}
            onChange={handleNameChanged}
            onBlur={handleRequiredBlurred}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <TextFieldWithValidation
            id="lastName"
            name="lastName"
            label="Last Name"
            value={lastName}
            required={true}
            error={false}
            helperText={''}
            onChange={handleNameChanged}
            onBlur={handleRequiredBlurred}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <TextFieldWithValidation
            id="email"
            name="email"
            label="Email"
            value={email}
            required={true}
            error={false}
            helperText={''}
            onChange={handleNameChanged}
            onBlur={handleRequiredBlurred}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <SelectWithLoading
            attributeValue={role ? role : ''}
            attributeRequired={true}
            attributeOptions={availableRoles}
            attributeName="role"
            attributeLabel="Role"
            error={false}
            errorMessage={''}
            isLoading={false}
            onChange={() => {}}
            onBlur={() => {}}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <FormControlLabel
            control={
              <Checkbox checked={isAdmin} onChange={handleIsAdminChanged} />
            }
            label="Is Admin"
          />
        </Grid>
      </Grid>
      <FormButtons
        disableMainButton={false}
        onSubmit={handleSubmitButton}
        onCancel={handleCancelButton}
      />
    </>
  )
}
