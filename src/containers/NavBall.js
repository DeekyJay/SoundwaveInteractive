import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions as uiActions } from '../redux/modules/UI'

export class NavBall extends React.Component {

  static propTypes = {
    uiActions: PropTypes.object.isRequired
  }

  render () {
    const { uiActions: { navigate } } = this.props
    // Setup Navigation
    const navigateSoundboard = navigate.bind(this, 'soundboard')
    const navigateSettings = navigate.bind(this, 'settings')
    const navigateAbout = navigate.bind(this, 'about')
    return (
      <div className='navball-container'>
        <div className='navball'>
          <div className='nav-item board' onClick={navigateSoundboard}>
            <span className='sicon-piano'></span>
            <div className='nav-item-text'>Soundboard</div>
          </div>
          <div className='nav-item settings' onClick={navigateSettings}>
            <span className='sicon-controls'></span>
            <div className='nav-item-text'>Settings</div>
          </div>
          <div className='nav-item about' onClick={navigateAbout}>
            <span className='sicon-info'></span>
            <div className='nav-item-text'>About</div>
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

export default connect(mapStateToProps, mapDispatchToProps)(NavBall)
