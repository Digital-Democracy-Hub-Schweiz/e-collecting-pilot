import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Clock, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { verificationBusinessAPI, type VerificationResponse } from "@/services/verificationAPI";
export const VerificationDashboard = () => {
  const [verification, setVerification] = useState<VerificationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {
    toast
  } = useToast();
  const handleCreateVerification = async () => {
    setIsLoading(true);
    try {
      const result = await verificationBusinessAPI.createVerification();
      setVerification(result);
      toast({
        title: "Verification Created",
        description: `Verification session ${result.id} has been created successfully.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create verification session. Please try again.",
        variant: "destructive"
      });
      console.error('Verification creation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'default';
      case 'FAILED':
        return 'destructive';
      case 'PENDING':
        return 'secondary';
      default:
        return 'outline';
    }
  };
  return <div className="space-y-8">
      {/* Control Panel */}
      

      {verification && <div className="grid gap-6">
          {/* Status Overview */}
          <Card className="shadow-elegant">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(verification.state)}
                  <CardTitle>Verification Session</CardTitle>
                </div>
                <Badge variant={getStatusVariant(verification.state)}>
                  {verification.state}
                </Badge>
              </div>
              <CardDescription>
                Session ID: {verification.id}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Verification Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Verification URL</CardTitle>
              </CardHeader>
              <CardContent>
                <code className="text-sm bg-muted p-2 rounded block break-all">
                  {verification.verification_url}
                </code>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Request Nonce</CardTitle>
              </CardHeader>
              <CardContent>
                <code className="text-sm bg-muted p-2 rounded block break-all">
                  {verification.request_nonce}
                </code>
              </CardContent>
            </Card>
          </div>

          {/* Presentation Definition */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Presentation Definition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <strong>Name:</strong> {verification.presentation_definition.name}
              </div>
              <div>
                <strong>Purpose:</strong> {verification.presentation_definition.purpose}
              </div>
              <div>
                <strong>Input Descriptors:</strong> {verification.presentation_definition.input_descriptors.length} requirement(s)
              </div>
            </CardContent>
          </Card>

          {/* Input Descriptors */}
          {verification.presentation_definition.input_descriptors.map((descriptor, index) => <Card key={descriptor.id} className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">{descriptor.name}</CardTitle>
                <CardDescription>
                  {descriptor.purpose}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <strong>Required Fields:</strong>
                    <div className="mt-2 space-y-2">
                      {descriptor.constraints.fields.map((field, fieldIndex) => <div key={fieldIndex} className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">
                            {field.path.join(', ')}
                          </Badge>
                          {field.filter && <span className="text-sm text-muted-foreground">
                              (filter: {field.filter.const || field.filter.type})
                            </span>}
                        </div>)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>)}
        </div>}

      {!verification}
    </div>;
};