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
            <InfoBullet text='Core update to possibly fix issue with sounds not playing until restart.' />
            <InfoBullet text='Tweaked behaviour of the window for logging in.' />
            <InfoBullet text='Minor tweaks and changes to wording in the tutorial.' />
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
