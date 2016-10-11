import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions as interactiveActions } from '../redux/modules/Interactive'
import ReactToolTip from 'react-tooltip'

export class Connector extends React.Component {
  static propTypes = {
    interactiveActions: PropTypes.object.isRequired,
    interactive: PropTypes.object.isRequired
  }

  setCooldownOption = (option) => {
    this.props.interactiveActions.setCooldownOption(option)
  }

  toggleReconnect = () => {
    this.props.interactiveActions.toggleAutoReconnect()
  }

  updateReconnectionTimeout = (e) => {
    this.props.interactiveActions.updateReconnectionTimeout(e.target.value)
  }

  goInteractive = () => {
    this.props.interactiveActions.goInteractive()
  }

  render () {
    const {
      interactive: {
        isConnecting,
        isConnected,
        storage: {
          cooldownOption,
          useReconnect,
          reconnectionTimeout
        }
      }
    } = this.props

    const clickStatic = this.setCooldownOption.bind(this, 'static')
    const clickDynamic = this.setCooldownOption.bind(this, 'dynamic')
    const clickIndividual = this.setCooldownOption.bind(this, 'individual')
    return (
      <div className='connector-container'>
        <div className='connector-container-title'>Connection</div>
        <div className='connector-options-container'>
          <div className='connector-options-title'>Cooldown Options</div>
          <div
            className='connector-options-wrapper'
            onClick={clickStatic}
            data-tip='Uses the global cooldown specified in the settings.'>
            <span className='connector-option'>Static Cooldown</span>
            <span className={`connector-radio ${cooldownOption === 'static' ? 'toggled' : ''}`}></span>
          </div>
          <div
            className='connector-options-wrapper'
            onClick={clickDynamic}
            data-tip='The cooldown of the button pressed determines the global cooldown.'>
            <span className='connector-option'>Dynamic Cooldown</span>
            <span className={`connector-radio ${cooldownOption === 'dynamic' ? 'toggled' : ''}`}></span>
          </div>
          <div
            className='connector-options-wrapper'
            onClick={clickIndividual}
            data-tip='No global cooldown. Only the button clicked cools down.'>
            <span className='connector-option'>Individual Cooldown</span>
            <span className={`connector-radio ${cooldownOption === 'individual' ? 'toggled' : ''}`}></span>
          </div>
        </div>
        <div className='connector-options-container'>
          <div className='connector-options-title'>Reconnection Options</div>
          <div
            className='connector-options-wrapper'
            onClick={this.toggleReconnect}
            data-tip='Auto reconnect if the connection to Beam drops.'>
            <span className='connector-option'>Auto Reconnect</span>
            <span className={`connector-checkbox ${useReconnect ? 'sicon-round-check' : ''}`}></span>
          </div>
          <div className='connector-options-wrapper'>
            <span className='connector-option'>Reconnection Timeout</span>
            <input
              type='text'
              className='connector-input'
              value={reconnectionTimeout}
              onChange={this.updateReconnectionTimeout} />
          </div>
        </div>
        <div className='connect-container'>
          <button type='button' onClick={this.goInteractive}>
            {isConnecting
              ? <span>Connecting...</span>
              : <span>
                {isConnected
                  ? 'Disconnect'
                  : 'Connect'
                }
              </span>}
          </button>
        </div>
        <ReactToolTip type='light' class='default-tooltip' effect='solid' />
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  interactive: state.interactive
})
const mapDispatchToProps = (dispatch) => ({
  interactiveActions: bindActionCreators(interactiveActions, dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Connector)
