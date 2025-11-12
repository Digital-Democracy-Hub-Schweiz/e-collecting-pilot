export interface IssueCredentialRequest {
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

export interface IssueCredentialResponse {
  id?: string;
  management_id?: string;
  offer_deeplink?: string;
  [key: string]: any;
}

class IssuerBusinessAPI {
  // Adjust this base URL to your deployment. For production, this points to the issuer management API.
  private baseUrl = "https://issuer-receipt.ecollecting.ch/management/api/v1";

  async issueCredential(payload: IssueCredentialRequest): Promise<IssueCredentialResponse> {
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
      console.error("Failed to issue credential", e);
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
      console.error("Failed to check credential status", e);
      throw e;
    }
  }
}

export const issuerBusinessAPI = new IssuerBusinessAPI();
