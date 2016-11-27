import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import InfoGroup from '../components/InfoComponents/InfoGroup'
import InfoBullet from '../components/InfoComponents/InfoBullet'

export class Changelog extends React.Component {

  static propTypes = {
  }

  render () {
    return (
      <div className='info-container'>
        <div className='info-title'>Changelog</div>
        <div className='info-wrapper'>
          <InfoGroup title='Some New Stuff' className='new'
            text={'Here are some new features we\'ve recently added.'}>
            <InfoBullet text='Active Sounds - Want to see what sounds you currently have assigned on your selected profile? Now you can!' />
            <InfoBullet text='Minimize To Tray - Get rid of that pesky icon on your task bar or dock, put it in the tray!' />
            <InfoBullet text='Mac & Linux - Some of you wanted a Mac & Linux build of the app! Here it is!' />
          </InfoGroup>
          <InfoGroup title='Some Changed Stuff' className='change'
            text={'Here are some changes we\'ve made since the last release.'}>
            <InfoBullet text='Drag and dropping is more natural now. No need to hold and wait, just start dragging!' />
            <InfoBullet text='Reconnects from switching profiles or updating sounds cause a weird bug on Beam. Added tweaks to handle this better.' />
            <InfoBullet text='Dragging the window around is a lot easier now, allowing you to select most of the header to move the window.' />
          </InfoGroup>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {}
}
const mapDispatchToProps = (dispatch) => {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Changelog)
