import { requests } from '../baseRequest'
import { Headquarter } from '../../entities'

enum HeadquartersAPIEndpoints {
  getAll = 'headquarters',
}

function HeadquartersAPI() {
  const getAll = async (): Promise<Headquarter[]> => {
    const { data: allData } = await requests.get(
      HeadquartersAPIEndpoints.getAll
    )
    const { data: headquarterData } = allData
    const headquarters: Headquarter[] = headquarterData.map(
      (headquarter: Headquarter) => headquarter
    )
    return headquarters
  }

  return {
    getAll,
  }
}

export default HeadquartersAPI
