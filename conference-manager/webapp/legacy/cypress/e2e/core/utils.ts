import { faker } from "@faker-js/faker"

export const createEvent = () => {
  return {
    name: faker.lorem.words(),
    address: faker.address.streetAddress(),
    eventDate: faker.date.future(1),
    type: "Sales",
    tags: "Design",
    headquarter: "654d4ac398b7a0abaa3c3a3e",
    description: faker.lorem.sentence()
  }
}

export const updatEventStatus = () => {
    return {
        status: "active"
      }
  }
