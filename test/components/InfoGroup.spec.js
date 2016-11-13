import React from 'react'
import TestUtils from 'react-addons-test-utils'
import sinon from 'sinon'
import InfoGroup from 'components/InfoGroup/InfoGroup'

describe('(Component) InfoGroup', () => {
  beforeEach(function () {
    let _component, _renderer, _props

    _props = {
    }
    _renderer = TestUtils.createRenderer()
     _renderer.render(<InfoGroup {..._props} />)
     _component = _renderer.getRenderOutput()
  })
  it('should exist', () => {
    expect(_component.type).to.equal('div')
  })
})
