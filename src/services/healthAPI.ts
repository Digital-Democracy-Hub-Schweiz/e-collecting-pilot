export interface HealthStatus {
  status: string;
  groups: string[];
}

export interface SystemHealth {
  verifierManagement: HealthStatus | null;
  issuerManagement: HealthStatus | null;
  issuerOid4vci: HealthStatus | null;
}

class HealthAPI {
  private verifierManagementUrl = "https://verifier-management.e-collecting.com/actuator";
  private issuerManagementUrl = "https://issuer-management.e-collecting.com/actuator";
  private issuerOid4vciUrl = "https://issuer-oid4vci.e-collecting.com/actuator";

  async getVerifierManagementHealth(): Promise<HealthStatus> {
    try {
      const res = await fetch(`${this.verifierManagementUrl}/health`, {
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
      console.error("Failed to fetch verifier management health status", e);
      throw e;
    }
  }

  async getIssuerManagementHealth(): Promise<HealthStatus> {
    try {
      const res = await fetch(`${this.issuerManagementUrl}/health`, {
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
      console.error("Failed to fetch issuer management health status", e);
      throw e;
    }
  }

  async getIssuerOid4vciHealth(): Promise<HealthStatus> {
    try {
      const res = await fetch(`${this.issuerOid4vciUrl}/health`, {
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
      console.error("Failed to fetch issuer oid4vci health status", e);
      throw e;
    }
  }

  async getSystemHealth(): Promise<SystemHealth> {
    const [verifierManagement, issuerManagement, issuerOid4vci] = await Promise.allSettled([
      this.getVerifierManagementHealth(),
      this.getIssuerManagementHealth(),
      this.getIssuerOid4vciHealth()
    ]);

    return {
      verifierManagement: verifierManagement.status === 'fulfilled' ? verifierManagement.value : null,
      issuerManagement: issuerManagement.status === 'fulfilled' ? issuerManagement.value : null,
      issuerOid4vci: issuerOid4vci.status === 'fulfilled' ? issuerOid4vci.value : null,
    };
  }
}

export const healthAPI = new HealthAPI();