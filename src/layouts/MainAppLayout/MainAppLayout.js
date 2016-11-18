import React, { PropTypes } from 'react'
import '../../styles/core.scss'
import Header from '../../containers/Header'

function MainApp ({ children }) {
  return (
    <div className='main-app-content'>
      <Header />
      <div className='main_app-layout'>
        {children}
      </div>
    </div>
  )
}

MainApp.propTypes = {
  children: PropTypes.element
}

export default MainApp
