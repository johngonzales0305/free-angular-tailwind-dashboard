import { Injectable, signal } from '@angular/core';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from '../../firebase';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Reactive signal holding the currently logged-in user (or null)
  readonly currentUser = signal<User | null>(null);

  constructor() {
    // Keep the signal in sync with Firebase's auth state
    onAuthStateChanged(auth, (user) => this.currentUser.set(user));
  }

  /** Sign in an existing user with email + password. */
  login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  /** Register a new user with email + password. */
  register(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  /** Sign the current user out. */
  logout() {
    return signOut(auth);
  }

  /** Convenience getter for guards/components. */
  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }
}