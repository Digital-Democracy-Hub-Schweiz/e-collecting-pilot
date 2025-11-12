export interface HealthStatus {
  status: string;
  groups: string[];
}

export interface SystemHealth {
  verifierManagement: HealthStatus | null;
  issuerManagement: HealthStatus | null;
  issuerOid4vci: HealthStatus | null;
  issuerGemeinde: HealthStatus | null;
}

class HealthAPI {
  private verifierIdentityUrl = "https://verifier-identity.ecollecting.ch/actuator";
  private issuerReceiptUrl = "https://issuer-receipt.ecollecting.ch/actuator";
  private issuerStimmrechtUrl = "https://issuer-stimmrecht.ecollecting.ch/actuator";

  async getVerifierIdentityHealth(): Promise<HealthStatus> {
    try {
      const res = await fetch(`${this.verifierIdentityUrl}/health`, {
        method: "GET",
        headers: {
          accept: "application/vnd.spring-boot.actuator.v3+json",
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      console.error("Failed to fetch verifier identity health status", e);
      throw e;
    }
  }

  async getIssuerReceiptHealth(): Promise<HealthStatus> {
    try {
      const res = await fetch(`${this.issuerReceiptUrl}/health`, {
        method: "GET",
        headers: {
          accept: "application/vnd.spring-boot.actuator.v3+json",
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      console.error("Failed to fetch issuer receipt health status", e);
      throw e;
    }
  }

  async getIssuerStimmrechtHealth(): Promise<HealthStatus> {
    try {
      const res = await fetch(`${this.issuerStimmrechtUrl}/health`, {
        method: "GET",
        headers: {
          accept: "application/vnd.spring-boot.actuator.v3+json",
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      console.error("Failed to fetch issuer stimmrecht health status", e);
      throw e;
    }
  }

  async getSystemHealth(): Promise<SystemHealth> {
    const [verifierIdentity, issuerReceipt, issuerStimmrecht] = await Promise.allSettled([
      this.getVerifierIdentityHealth(),
      this.getIssuerReceiptHealth(),
      this.getIssuerStimmrechtHealth()
    ]);

    return {
      verifierManagement: verifierIdentity.status === 'fulfilled' ? verifierIdentity.value : null,
      issuerManagement: issuerReceipt.status === 'fulfilled' ? issuerReceipt.value : null,
      issuerOid4vci: null, // Legacy field, kept for compatibility
      issuerGemeinde: issuerStimmrecht.status === 'fulfilled' ? issuerStimmrecht.value : null,
    };
  }
}

export const healthAPI = new HealthAPI();
