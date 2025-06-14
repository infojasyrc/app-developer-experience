// src/application/use-cases/get-user-profile.use-case.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetUsersUseCase {
  async execute(): Promise<any[]> {
    // Replace this with logic to fetch from DB, apply roles, etc.
    return [];
  }
}
