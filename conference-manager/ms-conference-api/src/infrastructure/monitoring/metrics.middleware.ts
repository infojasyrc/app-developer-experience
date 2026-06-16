// metrics.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private readonly metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // GAUGE: Increased because a new request has started processing
    this.metricsService.activeRequestsGauge.inc();

    res.on('finish', () => {
      // GAUGE: Decreased because the request has finished processing
      this.metricsService.activeRequestsGauge.dec();

      // COUNTER: Summarize the total number of HTTP requests, labeled by method and status code
      const statusCode = res.statusCode.toString();
      this.metricsService.httpRequestsCounter.inc({
        method: req.method,
        status: statusCode,
      });
    });

    next();
  }
}
