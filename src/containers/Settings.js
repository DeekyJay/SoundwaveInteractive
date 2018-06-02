import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions as uiActions } from '../redux/modules/UI'
import ClearData from './ClearData'
import Audio from './Audio'
import Cooldown from './Cooldown'

export class Settings extends React.Component {

  static propTypes = {
    ui: PropTypes.object.isRequired,
    uiActions: PropTypes.object.isRequired
  }

  isActive = () => {
    return this.props.ui.active === 'settings' ? ' active' : ''
  }

  render () {
    return (
      <div className={'content-container' + this.isActive() + ' settings'}>
        <div className='content-header'>Settings</div>
        <div className='content-body'>
          <div className='about-left'>
            <Audio />
            <Cooldown />
          </div>
          <div className='about-right'>
            <ClearData />
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

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
