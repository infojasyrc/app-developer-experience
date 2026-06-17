import { Injectable, OnModuleInit } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  
  public httpRequestsCounter!: client.Counter<string>;
  public activeRequestsGauge!: client.Gauge<string>;

  onModuleInit() {
    client.register.clear();

    client.collectDefaultMetrics();

    // Counter metric
    this.httpRequestsCounter = new client.Counter({
      name: 'cm_api_http_requests_total',
      help: 'Total de peticiones HTTP procesadas',
      labelNames: ['method', 'status'],
    });

    // Gauge metric
    this.activeRequestsGauge = new client.Gauge({
      name: 'cm_api_active_requests',
      help: 'Número de peticiones HTTP siendo procesadas concurrentemente en este momento',
    });
  }

  async getMetrics(): Promise<string> {
    return client.register.metrics();
  }
}