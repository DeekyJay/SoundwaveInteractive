import React, { PropTypes } from 'react'
import { reduxForm } from 'redux-form'

export const fields = []

export const validate = (values) => {
  const errors = {}
  return errors
}

class <%= pascalEntityName %> extends React.Component {

  static propTypes = {
  }

  render () {
    const { fields, handleSubmit } = this.props

    return (
      <form onSubmit={handleSubmit}>
      </form>
    )
  }
}

export { <%= pascalEntityName %>, validate }
export default reduxForm({
  form: '<%= pascalEntityName %>',
  fields,
  validate
})(<%= pascalEntityName %>)
