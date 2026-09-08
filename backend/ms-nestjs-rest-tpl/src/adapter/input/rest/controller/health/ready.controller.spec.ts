import { ConfigService } from "@nestjs/config";
import {
  HealthCheckError,
  HttpHealthIndicator,
  TerminusModule,
} from "@nestjs/terminus";
import { Test, TestingModule } from "@nestjs/testing";

import { EnvironmentVariables } from "./../../../../../infrastructure/environment-variables";

import { ReadyController } from "./ready.controller";

const httpHealthIndicatorMock: Partial<HttpHealthIndicator> = {
  pingCheck: jest.fn(),
};

const configServiceMock: Partial<ConfigService<EnvironmentVariables>> = {
  get: jest.fn().mockReturnValue("TEST"),
};

describe("ReadyController", () => {
  let controller: ReadyController;
  let httpHealthIndicator: HttpHealthIndicator;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [ReadyController],
      providers: [
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    })
      .overrideProvider(HttpHealthIndicator)
      .useValue(httpHealthIndicatorMock)
      .compile();

    httpHealthIndicator = module.get<HttpHealthIndicator>(HttpHealthIndicator);
    controller = module.get<ReadyController>(ReadyController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should return status ok", async () => {
    (httpHealthIndicator.pingCheck as jest.Mock).mockResolvedValue({
      "healthcheck-integration": { status: "up" },
    });

    const result = await controller.check();

    expect(httpHealthIndicator.pingCheck).toHaveBeenCalledWith(
      "healthcheck-integration",
      "TEST",
      {
        headers: {
          Authorization: "Bearer TEST",
        },
      },
    );
    expect(result).toMatchObject({ status: "ok" });
  });

  it("should return with status error", async () => {
    (httpHealthIndicator.pingCheck as jest.Mock).mockRejectedValue(
      new HealthCheckError("failed", {
        "healthcheck-integration": { status: "down" },
      }),
    );

    await expect(controller.check()).rejects.toMatchObject({
      response: { status: "error" },
      status: 503,
    });
  });
});
