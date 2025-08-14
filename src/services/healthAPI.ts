export interface HealthStatus {
  status: string;
  groups: string[];
}

export interface SystemHealth {
  verifier: HealthStatus | null;
  issuer: HealthStatus | null;
}

class HealthAPI {
  private verifierUrl = "http://verifier-management.e-collecting.com/actuator";
  private issuerUrl = "http://issuer-management.e-collecting.com/actuator";

  async getVerifierHealth(): Promise<HealthStatus> {
    try {
      const res = await fetch(`${this.verifierUrl}/health`, {
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
      console.error("Failed to fetch verifier health status", e);
      throw e;
    }
  }

  async getIssuerHealth(): Promise<HealthStatus> {
    try {
      const res = await fetch(`${this.issuerUrl}/health`, {
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
      console.error("Failed to fetch issuer health status", e);
      throw e;
    }
  }

  async getSystemHealth(): Promise<SystemHealth> {
    const [verifier, issuer] = await Promise.allSettled([
      this.getVerifierHealth(),
      this.getIssuerHealth()
    ]);

    return {
      verifier: verifier.status === 'fulfilled' ? verifier.value : null,
      issuer: issuer.status === 'fulfilled' ? issuer.value : null,
    };
  }
}

export const healthAPI = new HealthAPI();