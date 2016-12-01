import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _ from 'lodash'
import { actions as appActions } from '../redux/modules/App'
import ReactSlider from 'rc-slider'
require('rc-slider/assets/index.css')

export class Audio extends React.Component {

  static propTypes = {
    outputs: PropTypes.array.isRequired,
    appActions: PropTypes.object.isRequired,
    selectedOutput: PropTypes.string,
    globalVolume: PropTypes.number.isRequired,
    trayMinimize: PropTypes.bool
  }

  constructor (props) {
    super(props)
    this.state = {
      globalVolume: props.globalVolume
    }
  }

  componentDidMount (props) {
    this.props.appActions.getAudioDevices()
  }

  componentWillReceiveProps (props) {
    if (this.props.globalVolume !== props.globalVolume) {
      this.setState({ ...this.state, globalVolume: props.globalVolume})
    }
  }

  setOutput = (e) => {
    this.props.appActions.setAudioDevice(e.target.value)
  }

  setVolume = (value) => {
    this.props.appActions.setGlobalVolume(value)
  }

  checkChanged = (e) => {
    this.props.appActions.toggleTray()
  }

  render () {
    const { outputs, selectedOutput, trayMinimize } = this.props
    const { globalVolume } = this.state
    return (
      <div className='audio-container'>
        <div className='audio-title'>General</div>
        <div className='audio-wrapper'>
          <div className='form-group'>
            <label htmlFor='output'>Output Device</label>
            <select
              name='output'
              value={selectedOutput || ''}
              onChange={this.setOutput}>
              {outputs && outputs.length
                ? outputs.map(o => {
                  return (
                    <option key={o.deviceId} value={o.deviceId}>{o.label}</option>
                  )
                })
                : null}
            </select>
          </div>
          <div className='form-group'>
            <label>Volume</label>
            <ReactSlider
              min={0}
              max={100}
              value={globalVolume}
              className='volume-slider'
              onChange={this.setVolume} />
            <span className='volume'>{globalVolume}%</span>
          </div>
          <div
            className='form-group'
            onClick={this.checkChanged}>
            <span className='checkbox-label'>Minimize to System Tray</span>
            <span className={`custom-checkbox ${trayMinimize ? 'sicon-round-check' : ''}`}></span>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  outputs: state.app.outputs,
  selectedOutput: state.app.selectedOutput,
  globalVolume: state.app.globalVolume,
  trayMinimize: state.app.trayMinimize
})
const mapDispatchToProps = (dispatch) => ({
  appActions: bindActionCreators(appActions, dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Audio)
