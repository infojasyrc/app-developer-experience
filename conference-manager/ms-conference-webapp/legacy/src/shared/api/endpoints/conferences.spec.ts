import ConferenceAPI from './conferences'

const mockResult = {
  data: {
    data: [
      {
        _id: '01',
        name: 'LinuxCon',
        eventDate: '2021-12-28T00:00:00.000Z',
        status: 'created',
      },
      {
        _id: '02',
        name: 'KubernetesCon',
        eventDate: '2022-10-08T00:00:00.000Z',
        status: 'created',
      },
    ],
  },
}

const mockGet = jest.fn()
jest.mock('../baseRequest', () => ({
  requests: {
    get: () => mockGet(),
  },
}))

describe('events api call', () => {
  it('should get all', async () => {
    mockGet.mockResolvedValue(mockResult)
    const events = ConferenceAPI()
    const result = await events.getAll()

    expect(result.length).toEqual(mockResult.data.data.length)
    expect(result[0].eventDate).toEqual('2021-12-28')
    expect(result[1].eventDate).toEqual('2022-10-08')
  })
})
