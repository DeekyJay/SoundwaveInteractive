import React, { PropTypes } from 'react'

export class InfoText extends React.Component {
  static propTypes = {
    text: PropTypes.string.isRequired
  }

  render () {
    const { text } = this.props
    return (
      <div className='info-text'>
        {text}
      </div>
    )
  }
}

export default InfoText
