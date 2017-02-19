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
          <InfoGroup title='Some Changed Stuff' className='change'
            text={'Here are some changes we\'ve made since the last release.'}>
            <InfoBullet text='Moved some robot logic to the main process for better performance.' />
            <InfoBullet text='Resolved the issue of needing to relogin after 6 hours.' />
            <InfoBullet text='Resolved the issue with users being unable to login via Microsoft, Twitter, & Discord' />
            <InfoBullet text='Resolved the issue with cooldowns not being properly set at the start of the application' />
          </InfoGroup>
          <InfoGroup title='Some New Stuff' className='new'
            text={'Here are some additions we\'ve made since the last release.'}>
            <InfoBullet text='Added a right click context menu to the board sounds to allow the user to modify & unassign them.' />
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
