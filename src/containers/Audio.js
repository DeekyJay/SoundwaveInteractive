import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _ from 'lodash'
import { actions as appActions } from '../redux/modules/App'

export class Audio extends React.Component {

  static propTypes = {
    outputs: PropTypes.array.isRequired,
    appActions: PropTypes.object.isRequired
  }

  componentDidMount (props) {
    this.props.appActions.getAudioDevices()
  }

  setOutput = (e) => {
    this.props.appActions.setAudioDevice(e.target.value)
  }

  render () {
    const { outputs } = this.props
    return (
      <div className='audio-container'>
        <div className='audio-title'>Audio</div>
        <div className='audio-wrapper'>
          <div className='form-group'>
            <label htmlFor='output'>Output Device</label>
            <select
              name='output'
              onChange={this.setOutput}>
              {outputs && outputs.length
                ? outputs.map(o => {
                  return (
                    <option value={o.deviceId}>{o.label}</option>
                  )
                })
                : null}
            </select>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  outputs: state.app.outputs
})
const mapDispatchToProps = (dispatch) => ({
  appActions: bindActionCreators(appActions, dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Audio)
