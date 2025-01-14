import { RolesGuard } from './roles.guard'
import { Reflector } from '@nestjs/core'
import { ExecutionContext } from '@nestjs/common'
import { Test } from '@nestjs/testing'

describe('RolesGuard', () => {
  let guard: RolesGuard
  let reflector: Reflector

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,

          useValue: {
            get: jest.fn().mockImplementation((key, target) => {
              if (key === 'roles') {
                return undefined
              }
            }),
          },
        },
      ],
    }).compile()

    guard = module.get<RolesGuard>(RolesGuard)
    reflector = module.get<Reflector>(Reflector)
  })

  it('should allow access if no roles are required', () => {
    const result: Promise<boolean> = new Promise(() => {})
    jest.spyOn(guard, 'canActivate').mockResolvedValue(result)

  })
})

function createMockExecutionContext(user: any): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        user,
      }),
    }),
    getClass: () => ({}),
    getHandler: () => ({}),
  } as unknown as ExecutionContext
}
