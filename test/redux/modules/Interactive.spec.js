import reducer, { initialState } from 'redux/modules/Interactive'

describe('(Redux) Interactive', () => {
  describe('(Reducer)', () => {
    it('sets up initial state', () => {
      expect(reducer(undefined, {})).to.eql(initialState)
    })
  })
})
