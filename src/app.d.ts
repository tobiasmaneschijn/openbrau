// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { AuthSession, AuthUser } from '$lib/server/auth';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			session: AuthSession | null;
			user: AuthUser | null;
		}
		interface PageData {
			session: AuthSession | null;
			user: Pick<AuthUser, 'id' | 'username' | 'preferences' | 'isAdmin'> | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
