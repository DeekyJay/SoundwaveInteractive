import React from 'react'
import TestUtils from 'react-addons-test-utils'
import sinon from 'sinon'
import ProfileItem from 'components/ProfileItem/ProfileItem'

describe('(Component) ProfileItem', () => {
  beforeEach(function () {
    let _component, _renderer, _props

    _props = {
    }
    _renderer = TestUtils.createRenderer()
     _renderer.render(<ProfileItem {..._props} />)
     _component = _renderer.getRenderOutput()
  })
  it('should exist', () => {
    expect(_component.type).to.equal('div')
  })
})
