export interface CreateVerificationRequest {
  accepted_issuer_dids: string[];
  jwt_secured_authorization_request: boolean;
  presentation_definition: PresentationDefinition;
}

export interface PresentationDefinition {
  id: string;
  name?: string;
  purpose?: string;
  format?: Record<string, FormatAlgorithm>;
  input_descriptors: InputDescriptor[];
}

export interface InputDescriptor {
  id: string;
  name?: string;
  purpose?: string;
  format?: Record<string, FormatAlgorithm>;
  constraints: Constraint;
}

export interface Constraint {
  id?: string;
  name?: string;
  purpose?: string;
  format?: Record<string, FormatAlgorithm>;
  fields: Field[];
  limit_disclosure?: 'required' | 'preferred';
}

export interface Field {
  path: string[];
  id?: string;
  name?: string;
  purpose?: string;
  filter?: Filter;
}

export interface Filter {
  type?: string;
  const?: string;
}

export interface FormatAlgorithm {
  'sd-jwt_alg_values': string[];
  'kb-jwt_alg_values': string[];
}

export interface VerificationResponse {
  id: string;
  request_nonce: string;
  state: 'PENDING' | 'SUCCESS' | 'FAILED';
  presentation_definition: PresentationDefinition;
  wallet_response?: any;
  verification_url: string;
}

export class VerificationBusinessAPI {
  private baseUrl = 'http://localhost:8082/api/v1';

  async createVerification(): Promise<VerificationResponse> {
    const requestData: CreateVerificationRequest = {
      accepted_issuer_dids: ["string"],
      jwt_secured_authorization_request: true,
      presentation_definition: {
        id: "00000000-0000-0000-0000-000000000000",
        name: "Test Verification",
        purpose: "We want to test a new Verifier",
        format: {
          "vc+sd-jwt": {
            "sd-jwt_alg_values": ["ES256"],
            "kb-jwt_alg_values": ["ES256"]
          }
        },
        input_descriptors: [
          {
            id: "11111111-1111-1111-1111-111111111111",
            name: "Example Data Request",
            purpose: "We collect this data to test our verifier",
            format: {
              "vc+sd-jwt": {
                "sd-jwt_alg_values": ["ES256"],
                "kb-jwt_alg_values": ["ES256"]
              }
            },
            constraints: {
              id: "string",
              name: "string",
              purpose: "string",
              format: {
                additionalProp1: {
                  "sd-jwt_alg_values": ["string"],
                  "kb-jwt_alg_values": ["string"]
                },
                additionalProp2: {
                  "sd-jwt_alg_values": ["string"],
                  "kb-jwt_alg_values": ["string"]
                },
                additionalProp3: {
                  "sd-jwt_alg_values": ["string"],
                  "kb-jwt_alg_values": ["string"]
                }
              },
              fields: [
                {
                  path: ["$.vct"],
                  filter: {
                    type: "string",
                    const: "test-sdjwt"
                  }
                },
                {
                  path: ["$.dateOfBirth"]
                }
              ],
              limit_disclosure: "required"
            }
          }
        ]
      }
    };

    try {
      const response = await fetch(`${this.baseUrl}/verifications`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create verification:', error);
      throw error;
    }
  }

  async getVerification(verificationId: string): Promise<VerificationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/verifications/${verificationId}`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get verification:', error);
      throw error;
    }
  }
}

export const verificationBusinessAPI = new VerificationBusinessAPI();