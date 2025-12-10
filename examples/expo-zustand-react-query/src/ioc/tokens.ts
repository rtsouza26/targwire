import { defineToken } from 'targwire';
import type { UserApi } from '../services/user_api';
import type { UserRepository } from '../services/user_repository';

export const TOKENS = {
  UserApi: defineToken<UserApi>('Users.Api'),
  UserRepository: defineToken<UserRepository>('Users.Repository'),
};
