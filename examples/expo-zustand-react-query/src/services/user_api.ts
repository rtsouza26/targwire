import { Injectable } from 'targwire';
import { TOKENS } from '../ioc/tokens';

export type UserDTO = {
  id: number;
  name: string;
  email: string;
  username: string;
};

@Injectable({ token: TOKENS.UserApi })
export class UserApi {
  async fetchUsers(): Promise<UserDTO[]> {
    const res = await fetch('https://jsonplaceholder.typicode.com/users');
    if (!res.ok) {
      throw new Error('Falha ao buscar usuários');
    }
    return (await res.json()) as UserDTO[];
  }
}
