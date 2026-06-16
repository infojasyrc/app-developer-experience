// metrics.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();

    const { method } = request;

    // GAUGE: Incrementamos porque entró una nueva petición en proceso
    this.metricsService.activeRequestsGauge.inc();

    return next.handle().pipe(
      finalize(() => {
        // GAUGE: Decrementamos porque la petición ya terminó (con éxito o error)
        this.metricsService.activeRequestsGauge.dec();

        // COUNTER: Sumamos 1 a las peticiones totales e inyectamos las etiquetas (labels)
        const statusCode = response.statusCode.toString();
        this.metricsService.httpRequestsCounter.inc({
          method: method,
          status: statusCode,
        });
      }),
    );
  }
}