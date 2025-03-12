import { getDateParts } from './dateHandler'

describe('getDateParts', () => {
  it('should return date parts', () => {
    const date = '2021-12-28'
    const result = getDateParts(date)

    expect(result.year).toEqual('2021')
    expect(result.month).toEqual('Dec')
    expect(result.day).toEqual('28')
  })
})
