export interface IssueGemeindeCredentialRequest {
  metadata_credential_supported_id: string[];
  credential_subject_data: {
    firstName: string;
    lastName: string;
    birthDate?: string;
    signDate?: string;
    type?: string;
    title?: string;
    comitee?: string | null;
    level?: string | null;
  };
  credential_metadata?: Record<string, string>;
  offer_validity_seconds?: number;
  credential_valid_until?: string;
  credential_valid_from?: string;
  status_lists?: string[];
}

export interface IssueGemeindeCredentialResponse {
  id?: string;
  management_id?: string;
  offer_deeplink?: string;
  [key: string]: any;
}

class GemeindeIssuerAPI {
  // Gemeinde-spezifischer Service für Stimmrechtsausweise
  private baseUrl = "https://issuer-gemeinde.ecollecting.ch/management/api";

  async issueCredential(payload: IssueGemeindeCredentialRequest): Promise<IssueGemeindeCredentialResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/credentials`, {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      console.error("Failed to issue gemeinde credential", e);
      throw e;
    }
  }

  async checkCredentialStatus(credentialId: string): Promise<any> {
    try {
      const res = await fetch(`${this.baseUrl}/credentials/${credentialId}/status`, {
        method: "GET",
        headers: { accept: "*/*" },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      console.error("Failed to check gemeinde credential status", e);
      throw e;
    }
  }

  async revokeCredential(credentialId: string): Promise<any> {
    try {
      const res = await fetch(`${this.baseUrl}/credentials/${credentialId}/revoke`, {
        method: "POST",
        headers: { accept: "*/*" },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      console.error("Failed to revoke gemeinde credential", e);
      throw e;
    }
  }

  async getCredentialDetails(credentialId: string): Promise<any> {
    try {
      const res = await fetch(`${this.baseUrl}/credentials/${credentialId}`, {
        method: "GET",
        headers: { accept: "*/*" },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      console.error("Failed to get gemeinde credential details", e);
      throw e;
    }
  }

  async updateCredentialStatus(credentialId: string, status: string): Promise<any> {
    try {
      const res = await fetch(`${this.baseUrl}/credentials/${credentialId}/status?credentialStatus=${status}`, {
        method: "PATCH",
        headers: { accept: "*/*" },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      console.error("Failed to update gemeinde credential status", e);
      throw e;
    }
  }
}

export const gemeindeIssuerAPI = new GemeindeIssuerAPI();
