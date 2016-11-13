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
            <InfoBullet text='Dynamic Cooldown - The ability to cooldown your soundboard based on the sound clicked.' />
            <InfoBullet text='Multiple Profiles - Tired of the single profile? Switch instantly between multiple profiles.' />
            <InfoBullet text='Sound Library - Keep your soundbytes close, with easy drag and drop access right onto the board.' />
            <InfoBullet text='Auto Updates - Those new features you want? No more manually downloading. They will be here with an update.' />
            <InfoBullet text='OAuth - Nobody likes developers handling your credentials. Login through Beam.' />
            <InfoBullet text='Minimal Setup - What Setup? Click that Create Soundboard button and start dragging sounds. You are good to go.' />
            <InfoBullet text='Volume - Is that sound to loud? Perhaps all sounds? Turn them down, or the whole application down.' />
            <InfoBullet text='Output - Not everyone uses the default audio output device. Now you can decide which device you want to use.' />
            <InfoBullet text='A major update to the original Beam Soundly Interactive application.' />
          </InfoGroup>
          <InfoGroup title='Some Changed Stuff' className='change'
            text={'Here are some changes we\'ve made since the last released.'}>
            <InfoBullet text='Everything. Literally everything was changed.' />
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
