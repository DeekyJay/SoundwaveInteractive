import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions as uiActions } from '../redux/modules/UI'
import SoundList from '../containers/SoundList'
import ProfileList from '../containers/ProfileList'
import BoardEditor from '../containers/BoardEditor'

export class Soundboard extends React.Component {

  static propTypes = {
    ui: PropTypes.object.isRequired,
    uiActions: PropTypes.object.isRequired
  }

  isActive = () => {
    return this.props.ui.active === 'soundboard' ? 'active' : ''
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

export default connect(mapStateToProps, mapDispatchToProps)(Soundboard)
