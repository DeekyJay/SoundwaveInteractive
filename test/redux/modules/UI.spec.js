import reducer, { initialState } from 'redux/modules/UI'

describe('(Redux) UI', () => {
  describe('(Reducer)', () => {
    it('sets up initial state', () => {
      expect(reducer(undefined, {})).to.eql(initialState)
    })
  })
})
