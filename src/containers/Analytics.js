import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions as appActions } from '../redux/modules/App'


export class Analytics extends React.Component {

  static propTypes = {
    shareAnalytics: PropTypes.bool.isRequired,
    appActions: PropTypes.object.isRequired
  }

  checkChanged = () => {
    this.props.appActions.toggleAnalytics()
  }

  render () {
    const { shareAnalytics } = this.props
    return (
      <div className='analytics-container'>
        <div className='analytics-title'>Analytics</div>
        <div className='analytics-wrapper'>
          <div
            className='form-group'
            onClick={this.checkChanged}>
            <span className='analytics-label'>Opt out of sharing data for analytics*</span>
            <span className={`custom-checkbox ${shareAnalytics ? 'sicon-round-check' : ''}`}></span>
          </div>
          <div className='form-info'>* The data uploaded includes the following: Total sparks spent, total
              sounds imported, total profiles created, current amount of sounds imported, current amount of profiles,
               total sound plays, and total connects to Beam. This information is publicly available.
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  shareAnalytics: state.app.shareAnalytics
})
const mapDispatchToProps = (dispatch) => ({
  appActions: bindActionCreators(appActions, dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Analytics)
