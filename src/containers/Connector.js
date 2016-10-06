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

  goInteractive = () => {
    this.props.interactiveActions.goInteractive()
  }

  render () {
    const {
      interactive: {
        cooldownOption,
        isConnecting,
        isConnected,
        useReconnect,
        reconnectionTimeout
      }
    } = this.props

    const clickStatic = this.setCooldownOption.bind(this, 'static')
    const clickDynamic = this.setCooldownOption.bind(this, 'dynamic')
    const clickIndividual = this.setCooldownOption.bind(this, 'self')
    return (
      <div className='connector-container'>
        <div className='connector-container-title'>Connection</div>
        <div className='cooldown-options-container'>
          <div className='cooldown-options-title'>Cooldown Options</div>
          <div
            className='cooldown-options-wrapper'
            onClick={clickStatic}
            data-tip='Uses the global cooldown specified in the settings.'>
            <span className='cooldown-option'>Static Cooldown</span>
            <span className={`cooldown-radio ${cooldownOption === 'static' ? 'toggled' : ''}`}></span>
          </div>
          <div
            className='cooldown-options-wrapper'
            onClick={clickDynamic}
            data-tip='The cooldown of the button pressed determines the global cooldown.'>
            <span className='cooldown-option'>Dynamic Cooldown</span>
            <span className={`cooldown-radio ${cooldownOption === 'dynamic' ? 'toggled' : ''}`}></span>
          </div>
          <div
            className='cooldown-options-wrapper'
            onClick={clickIndividual}
            data-tip='No global cooldown. Only the button clicked cools down.'>
            <span className='cooldown-option'>Individual Cooldown</span>
            <span className={`cooldown-radio ${cooldownOption === 'self' ? 'toggled' : ''}`}></span>
          </div>
        </div>
        <div className='reconnect-container'>
          <div className='reconnect-title'>Reconnection Options</div>
          <div
            className='reconnect-option-wrapper'
            onClick={this.toggleReconnect}
            data-tip='Auto reconnect if the connection to Beam drops.'>
            <span className='reconnect-option'>Auto Reconnect</span>
            <span className={`checkbox ${useReconnect ? 'toggled' : ''}`}></span>
          </div>
          <div className='reconnect-option-wrapper'>
            <span className='reconnect-option'>Reconnection Timeout</span>
            <input
              type='text'
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
