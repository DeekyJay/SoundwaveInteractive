import React, { PropTypes } from 'react'

export class InfoGroup extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    text: PropTypes.string,
    className: PropTypes.string,
    isOrdered: PropTypes.bool,
    children: PropTypes.any
  }

  getClass = () => {
    const { className } = this.props
    let cName = 'info-section'
    if (className) cName + ' ' + className
    return cName
  }

  render () {
    const { title, text, isOrdered } = this.props
    return (
      <div className={this.getClass()}>
        <div className='info-section-title'>{title}</div>
        {text ? <div className='info-section-text'>{text}</div> : null}
        {isOrdered
          ? <ol>{this.props.children}</ol>
          : <ul>{this.props.children}</ul>}
      </div>
    )
  }
}

export default InfoGroup
