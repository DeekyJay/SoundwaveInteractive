import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions as appActions } from '../../redux/modules/App'
import NavBall from '../../containers/NavBall'
import Soundboard from '../../containers/Soundboard'
import Settings from '../../containers/Settings'
import About from '../../containers/About'

export class BoardView extends React.Component {

  static propTypes = {
    appActions: PropTypes.object.isRequired
  }

  render () {
    return (
      <div className='board-container'>
        <NavBall />
        <Soundboard />
        <Settings />
        <About />
      </div>
    )
  }
}

/* istanbul ignore next */
const mapStateToProps = (state) => ({})

/* istanbul ignore next */
const mapDispatchToProps = (dispatch) => ({
  appActions: bindActionCreators(appActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(BoardView)
