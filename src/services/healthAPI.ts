export interface HealthStatus {
  status: string;
  groups: string[];
}

class HealthAPI {
  private baseUrl = "http://verifier-management.e-collecting.com/actuator";

  async getHealth(): Promise<HealthStatus> {
    try {
      const res = await fetch(`${this.baseUrl}/health`, {
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
      console.error("Failed to fetch health status", e);
      throw e;
    }
  }
}

export const healthAPI = new HealthAPI();