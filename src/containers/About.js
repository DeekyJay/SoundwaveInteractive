import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions as uiActions } from '../redux/modules/UI'
import Changelog from './Changelog'
import Info from './Info'

export class About extends React.Component {

  static propTypes = {
    ui: PropTypes.object.isRequired,
    uiActions: PropTypes.object.isRequired
  }

  isActive = () => {
    return this.props.ui.active === 'about' ? ' active' : ''
  }

  render () {
    return (
      <div className={'content-container' + this.isActive() + ' about'}>
        <div className='content-header'>About</div>
        <div className='content-body'>
          <div className='about-left'>
            <Changelog />
          </div>
          <div className='about-right'>
            <Info />
          </div>
        </div>
      </div>
    )
  }
}

/* istanbul ignore next */
const mapStateToProps = (state) => ({
  ui: state.ui
})

/* istanbul ignore next */
const mapDispatchToProps = (dispatch) => ({
  uiActions: bindActionCreators(uiActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(About)
