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
            <InfoBullet text='Removed analytics and remote authentication.' />
            <InfoBullet text='Minor styling tweaks.' />
          </InfoGroup>
          { /* <InfoGroup title='Some New Stuff' className='new'
            text={'Here are some additions we\'ve made since the last release.'}>
            <InfoBullet text='Added a right click context menu to the board sounds to allow the user to modify & unassign them.' />
          </InfoGroup> */ }
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
