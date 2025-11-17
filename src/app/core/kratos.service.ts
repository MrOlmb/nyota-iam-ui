import { Injectable } from '@angular/core';
import { Configuration, FrontendApi, LoginFlow, RegistrationFlow, Session } from '@ory/client';
import { environment } from '../../environments/environment';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KratosService {
  private kratosClient: FrontendApi;

  constructor() {
    const configuration = new Configuration({
      basePath: environment.kratosUrl,
      baseOptions: {
        withCredentials: true // Important for cookie-based sessions
      }
    });

    this.kratosClient = new FrontendApi(configuration);
  }

  /**
   * Initialize login flow
   * Creates a new login flow and returns the flow data
   */
  createLoginFlow(refresh?: boolean, aal?: string, returnTo?: string): Observable<LoginFlow> {
    return from(
      this.kratosClient.createBrowserLoginFlow({
        refresh,
        aal,
        returnTo
      }).then(response => response.data)
    );
  }

  /**
   * Get existing login flow
   */
  getLoginFlow(flowId: string): Observable<LoginFlow> {
    return from(
      this.kratosClient.getLoginFlow({
        id: flowId
      }).then(response => response.data)
    );
  }

  /**
   * Submit login flow with credentials
   */
  updateLoginFlow(flowId: string, body: any): Observable<any> {
    return from(
      this.kratosClient.updateLoginFlow({
        flow: flowId,
        updateLoginFlowBody: body
      }).then(response => response.data)
    );
  }

  /**
   * Initialize registration flow
   */
  createRegistrationFlow(returnTo?: string): Observable<RegistrationFlow> {
    return from(
      this.kratosClient.createBrowserRegistrationFlow({
        returnTo
      }).then(response => response.data)
    );
  }

  /**
   * Get existing registration flow
   */
  getRegistrationFlow(flowId: string): Observable<RegistrationFlow> {
    return from(
      this.kratosClient.getRegistrationFlow({
        id: flowId
      }).then(response => response.data)
    );
  }

  /**
   * Submit registration flow with user data
   */
  updateRegistrationFlow(flowId: string, body: any): Observable<any> {
    return from(
      this.kratosClient.updateRegistrationFlow({
        flow: flowId,
        updateRegistrationFlowBody: body
      }).then(response => response.data)
    );
  }

  /**
   * Get current session
   * Returns the user's current session if authenticated
   */
  toSession(): Observable<Session> {
    return from(
      this.kratosClient.toSession().then(response => response.data)
    );
  }

  /**
   * Create logout flow
   */
  createLogoutFlow(returnTo?: string): Observable<any> {
    return from(
      this.kratosClient.createBrowserLogoutFlow({
        returnTo
      }).then(response => response.data)
    );
  }

  /**
   * Perform logout
   */
  updateLogoutFlow(token: string): Observable<void> {
    return from(
      this.kratosClient.updateLogoutFlow({
        token
      }).then(() => undefined)
    );
  }

  /**
   * Helper to handle Kratos API errors
   */
  handleFlowError(error: any): string {
    if (error.response?.data?.ui?.messages) {
      const messages = error.response.data.ui.messages;
      return messages.map((msg: any) => msg.text).join(', ');
    }

    if (error.response?.data?.error?.message) {
      return error.response.data.error.message;
    }

    return error.message || 'An unknown error occurred';
  }
}
