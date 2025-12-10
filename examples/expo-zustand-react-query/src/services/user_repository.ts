import { Inject, Injectable } from 'targwire';
import { TOKENS } from '../ioc/tokens';
import type { UserDTO, UserApi } from './user_api';

export type User = {
  id: number;
  name: string;
  email: string;
  username: string;
};

@Injectable({ token: TOKENS.UserRepository })
export class UserRepository {
  constructor(@Inject(TOKENS.UserApi) private api: UserApi) {}

  async list(): Promise<User[]> {
    const users = await this.api.fetchUsers();
    return users.map((u: UserDTO) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      username: u.username,
    }));
  }
}
