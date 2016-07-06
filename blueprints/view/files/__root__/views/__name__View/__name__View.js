import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

export class <%= pascalEntityName %>View extends React.Component {

  static propTypes = {
  }

  render () {
    return (
      <div className='container'>
      </div>
    )
  }
}

/* istanbul ignore next */
const mapStateToProps = (state) => ({})

/* istanbul ignore next */
const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(<%= pascalEntityName %>View)
