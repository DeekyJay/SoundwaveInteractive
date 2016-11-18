import React from 'react'
import TestUtils from 'react-addons-test-utils'
import { bindActionCreators } from 'redux'
import { <%= pascalEntityName %>, validate } from 'forms/<%= pascalEntityName %>Form/<%= pascalEntityName %>Form'
import { mount } from 'enzyme'
import configureStore from '../../src/redux/configureStore';

function shallowRender (component) {
  const renderer = TestUtils.createRenderer()

  renderer.render(component)
  return renderer.getRenderOutput()
}

function renderWithProps (props = {}, initialState = {}) {
  return TestUtils.renderIntoDocument(<<%= pascalEntityName %> {...props} />)
}

function shallowRenderWithProps (props = {}) {
  return shallowRender( <<%= pascalEntityName %> {...props} />)
}

describe('(Form) <%= pascalEntityName %>', () => {
	 let _component, _rendered, _props, _spies

  beforeEach(function () {
    _spies = {}
    _props = {
    	fields: {
    		// email: '',
    		// password: ''
    	}
    }
    _component = shallowRenderWithProps(_props)
    _rendered = renderWithProps(_props)
  })

  it('Should render as a <form>.', function () {
    expect(_component.type).to.equal('form')
  })

  // it('Should have input fields.', function () {
  // 	const wrapper = mount(<<%= pascalEntityName %> {..._props} />)
  //   expect(wrapper).to.have.descendants('input')
  // })

  //  it('Should have a submit button.', function () {
  // 	let _btn = TestUtils.scryRenderedDOMComponentsWithTag(_rendered, 'button')
  //   expect(_btn).to.exist
  // })
})
