import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { resolve } from 'targwire';
import { TOKENS } from '../ioc/tokens';
import type { UserRepository, User } from '../services/user_repository';

const usersQueryKey = ['users'];

export function useUsersQuery() {
  const repo = useMemo<UserRepository>(() => resolve(TOKENS.UserRepository), []);

  return useQuery<User[]>({
    queryKey: usersQueryKey,
    queryFn: () => repo.list(),
    staleTime: 1000 * 60, // 1 minuto
  });
}
