import { registerIOCPlugin } from 'targwire';
import '../services/user_api';
import '../services/user_repository';

// Apenas garante que os módulos com @Injectable sejam carregados antes do bootstrap.
registerIOCPlugin(() => {});
