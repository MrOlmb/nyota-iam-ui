import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of, map } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { KratosService } from './kratos.service';
import { Session } from '@ory/client';

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  email_verified?: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private apiUrl = `${environment.apiUrl}${environment.apiPrefix}`;
  private platformId = inject(PLATFORM_ID);

  constructor(
    private http: HttpClient,
    private router: Router,
    private kratosService: KratosService
  ) {
    this.checkAuthentication();
  }

  /**
   * Check if user is authenticated by verifying Kratos session
   */
  private checkAuthentication(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Try to get session from Kratos
    this.kratosService.toSession().subscribe({
      next: (session) => {
        if (session?.active) {
          // Extract user info from Kratos session
          const user: User = {
            id: session.identity?.id || '',
            username: session.identity?.traits?.username || '',
            email: session.identity?.traits?.email || '',
            first_name: session.identity?.traits?.first_name || '',
            last_name: session.identity?.traits?.last_name || '',
            email_verified: session.identity?.verifiable_addresses?.[0]?.verified || false
          };

          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);

          // Store user in localStorage for quick access
          localStorage.setItem('current_user', JSON.stringify(user));
        } else {
          this.clearAuthState();
        }
      },
      error: () => {
        // No active session
        this.clearAuthState();
      }
    });
  }

  /**
   * Initialize login flow with Kratos
   * Returns the flow ID that will be used to submit credentials
   */
  initializeLogin(): Observable<{ flowId: string; csrfToken: string }> {
    return this.kratosService.createLoginFlow().pipe(
      map(flow => ({
        flowId: flow.id,
        csrfToken: this.extractCsrfToken(flow)
      })),
      catchError(error => {
        console.error('Error initializing login flow:', error);
        throw error;
      })
    );
  }

  /**
   * Login with username/email and password using Kratos
   */
  login(identifier: string, password: string): Observable<Session> {
    return new Observable(observer => {
      // Step 1: Create login flow
      this.kratosService.createLoginFlow().subscribe({
        next: (flow) => {
          const csrfToken = this.extractCsrfToken(flow);

          // Step 2: Submit login credentials
          const loginBody = {
            method: 'password',
            password: password,
            identifier: identifier,
            csrf_token: csrfToken
          };

          this.kratosService.updateLoginFlow(flow.id, loginBody).subscribe({
            next: (result) => {
              // Login successful, get session
              this.kratosService.toSession().subscribe({
                next: (session) => {
                  if (session?.active) {
                    // Update local state
                    const user: User = {
                      id: session.identity?.id || '',
                      username: session.identity?.traits?.username || '',
                      email: session.identity?.traits?.email || '',
                      first_name: session.identity?.traits?.first_name || '',
                      last_name: session.identity?.traits?.last_name || '',
                      email_verified: session.identity?.verifiable_addresses?.[0]?.verified || false
                    };

                    if (isPlatformBrowser(this.platformId)) {
                      localStorage.setItem('current_user', JSON.stringify(user));
                    }

                    this.currentUserSubject.next(user);
                    this.isAuthenticatedSubject.next(true);

                    observer.next(session);
                    observer.complete();
                  }
                },
                error: (error) => {
                  observer.error(error);
                }
              });
            },
            error: (error) => {
              observer.error(error);
            }
          });
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  /**
   * Initialize registration flow with Kratos
   */
  initializeRegistration(): Observable<{ flowId: string; csrfToken: string }> {
    return this.kratosService.createRegistrationFlow().pipe(
      map(flow => ({
        flowId: flow.id,
        csrfToken: this.extractCsrfToken(flow)
      })),
      catchError(error => {
        console.error('Error initializing registration flow:', error);
        throw error;
      })
    );
  }

  /**
   * Register a new user with Kratos
   */
  register(userData: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }): Observable<any> {
    return new Observable(observer => {
      // Step 1: Create registration flow
      this.kratosService.createRegistrationFlow().subscribe({
        next: (flow) => {
          const csrfToken = this.extractCsrfToken(flow);

          // Step 2: Submit registration data
          const registrationBody = {
            method: 'password',
            csrf_token: csrfToken,
            traits: {
              username: userData.username,
              email: userData.email,
              first_name: userData.first_name,
              last_name: userData.last_name,
              phone: userData.phone
            },
            password: userData.password
          };

          this.kratosService.updateRegistrationFlow(flow.id, registrationBody).subscribe({
            next: (result) => {
              // Registration successful
              // Kratos will call our webhook, which creates the user in IAM database
              observer.next(result);
              observer.complete();
            },
            error: (error) => {
              observer.error(error);
            }
          });
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  /**
   * Logout user
   */
  logout(): void {
    this.kratosService.createLogoutFlow().subscribe({
      next: (logoutFlow) => {
        if (logoutFlow.logout_token) {
          this.kratosService.updateLogoutFlow(logoutFlow.logout_token).subscribe({
            next: () => {
              this.clearAuthState();
              this.router.navigate(['/login']);
            },
            error: (error) => {
              console.error('Error during logout:', error);
              // Clear state anyway
              this.clearAuthState();
              this.router.navigate(['/login']);
            }
          });
        }
      },
      error: (error) => {
        console.error('Error creating logout flow:', error);
        // Clear state anyway
        this.clearAuthState();
        this.router.navigate(['/login']);
      }
    });
  }

  /**
   * Get current user from local state
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get token - for Kratos, this is handled via cookies
   * But we can return a placeholder for compatibility
   */
  getToken(): string | null {
    // With Kratos, authentication is cookie-based
    // The Kratos session cookie is automatically sent with requests
    return 'kratos-session-cookie';
  }

  /**
   * Clear authentication state
   */
  private clearAuthState(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('current_user');
    }

    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Extract CSRF token from Kratos flow
   */
  private extractCsrfToken(flow: any): string {
    const csrfNode = flow.ui?.nodes?.find(
      (node: any) => node.attributes?.name === 'csrf_token'
    );
    return csrfNode?.attributes?.value || '';
  }

  /**
   * Handle Kratos errors
   */
  handleKratosError(error: any): string {
    return this.kratosService.handleFlowError(error);
  }
}
