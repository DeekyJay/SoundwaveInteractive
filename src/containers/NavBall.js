import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions as uiActions } from '../redux/modules/UI'
import Ink from '../components/Ink'
import ReactToolTip from 'react-tooltip'
import { shell } from 'electron'
export class NavBall extends React.Component {

  static propTypes = {
    uiActions: PropTypes.object.isRequired
  }

  link = (e) => {
    const name = e.target.className.split(' ')[1]
    switch (name) {
      case 'twitter':
        shell.openExternal('https://twitter.com/DeekyJay')
        break
      case 'discord':
        shell.openExternal('https://discord.gg/QfeWGyc')
        break
      case 'github':
        shell.openExternal('https://github.com/DeekyJay')
        break
      case 'paypal':
        shell.openExternal('https://www.paypal.me/deekyjay/20USD')
        break
    }
  }

  render () {
    const { uiActions: { navigate } } = this.props
    // Setup Navigation
    const navigateSoundboard = navigate.bind(this, 'soundboard')
    const navigateSettings = navigate.bind(this, 'settings')
    const navigateAbout = navigate.bind(this, 'about')
    return (
      <div className='navball-container'>
        <div onClick={this.link} className='social-media twitter' data-tip='Twitter'>
          <Ink className='ink twitter' />
        </div>
        <div onClick={this.link} className='social-media discord' data-tip='Discord'>
          <Ink className='ink discord' />
        </div>
        <div className='navball'>
          <div className='nav-item board' onClick={navigateSoundboard}>
            <span className='sicon-piano'></span>
            <div className='nav-item-text'>Soundboard</div>
            <Ink />
          </div>
          <div className='nav-item settings' onClick={navigateSettings}>
            <span className='sicon-controls'></span>
            <div className='nav-item-text'>Settings</div>
            <Ink />
          </div>
          <div className='nav-item about' onClick={navigateAbout}>
            <span className='sicon-info'></span>
            <div className='nav-item-text'>About</div>
            <Ink />
          </div>
        </div>
        <div onClick={this.link} className='social-media github' data-tip='GitHub'>
          <Ink className='ink github' />
        </div>
        <div onClick={this.link} className='social-media paypal' data-tip='PayPal'>
          <Ink className='ink paypal' />
        </div>
        <ReactToolTip type='light' class='default-tooltip' effect='solid' />
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
