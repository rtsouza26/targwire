import 'reflect-metadata';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { bootstrapIOC } from 'targwire';
import './src/ioc/plugins';
import UsersScreen from './src/screens/UsersScreen';

bootstrapIOC();

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UsersScreen />
    </QueryClientProvider>
  );
}
