
import { User, AuthState } from '../types';
import { databaseService } from './databaseService';

export const userDatabase = {
    getUsers: async (): Promise<User[]> => {
        return databaseService.getUsers();
    },

    registerUser: async (userData: User): Promise<boolean> => {
        return databaseService.saveUser(userData);
    },

    loginUser: async (email: string, pass: string): Promise<{ success: boolean; user?: User }> => {
        return databaseService.loginUser(email, pass);
    },

    // Session Management (Delegated to DatabaseService)
    getSession: (): AuthState => {
        return databaseService.getSession();
    },

    saveSession: (auth: AuthState) => {
        databaseService.saveSession(auth);
    },

    clearSession: () => {
        databaseService.clearSession();
    }
};
