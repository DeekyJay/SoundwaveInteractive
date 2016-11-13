import React, { PropTypes } from 'react'

export class InfoBullet extends React.Component {
  static propTypes = {
    text: PropTypes.string.isRequired
  }

  render () {
    const { text } = this.props
    return (
      <li className='info-bullet'>
        {text}
      </li>
    )
  }
}

export default InfoBullet
