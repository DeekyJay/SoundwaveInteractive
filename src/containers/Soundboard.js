import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions as uiActions } from '../redux/modules/UI'
import { actions as appActions } from '../redux/modules/App'
import SoundList from '../containers/SoundList'
import ProfileList from '../containers/ProfileList'
import BoardEditor from '../containers/BoardEditor'
import Connector from '../containers/Connector'
import Ink from '../components/Ink/src'

export class Soundboard extends React.Component {

  static propTypes = {
    ui: PropTypes.object.isRequired,
    uiActions: PropTypes.object.isRequired,
    tutMode: PropTypes.bool.isRequired,
    tutStep: PropTypes.number,
    appActions: PropTypes.object.isRequired
  }

  isActive = () => {
    return this.props.ui.active === 'soundboard' ? 'active' : ''
  }

  nextStep = () => {
    this.props.appActions.nextTutStep()
  }

  render () {
    return (
      <div className={'content-container ' + this.isActive() + ' soundboard'}>
        <div className='content-header'>Soundboard</div>
        <div className='content-body'>
          <div className='content-left'>
            <SoundList />
          </div>
          <div className='content-right'>
            <BoardEditor />
            <ProfileList />
            <Connector />
          </div>
          {this.renderTutorialStep()}
        </div>
      </div>
    )
  }

  renderTutorialStep = () => {
    const { tutMode, tutStep } = this.props
    if (!tutMode) return null
    return (
      <div className={`tutorial-container ${tutStep === 3 || tutStep === 5 ? 'top' : 'bottom'}`}>
        <div className='tutorial-text'>
          {this.getStepText()}
        </div>
        <button type='button' className='btn btn-primary' onClick={this.nextStep}>
          Got It!
          <Ink />
        </button>
      </div>
    )
  }

  getStepText = () => {
    const { tutStep } = this.props
    switch (tutStep) {
      case 1:
        return 'Let\'s get started! Here is a quick overview of the new soundboard!'
      case 2:
        return 'Sound Library - Import all your sounds here! Set the names as you\'d see them on Beam with ' +
          'the proper cooldown and spark cost!'
      case 3:
        return 'Profiles - Create these to represent a collection of sounds you want on your soundboard.'
      case 4:
        return 'Interactive Board - How your board looks on Beam! Want to update a button? ' +
          'Drag and drop a sound onto it!'
      case 5:
        return 'Connection - Here are a couple different options for cooldown. Hover over them see what they do! ' +
          'Sometimes your board can disconnect. You can enabled auto-reconnect and give it a time for when it ' +
          'it should reconnect.'
      case 6:
        return 'Finally, once you\'ve done all this, click Connect!'
    }
  }
}

/* istanbul ignore next */
const mapStateToProps = (state) => ({
  ui: state.ui,
  tutMode: state.app.tutMode,
  tutStep: state.app.tutStep
})

/* istanbul ignore next */
const mapDispatchToProps = (dispatch) => ({
  uiActions: bindActionCreators(uiActions, dispatch),
  appActions: bindActionCreators(appActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(Soundboard)
