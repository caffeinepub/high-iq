import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Zap, TrendingUp, Award, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { identity, login, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const handleStartTest = async () => {
    if (isAuthenticated) {
      navigate({ to: '/test' });
    } else {
      await login();
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-accent/5">
        <div className="absolute inset-0 bg-[url('/assets/generated/high-iq-hero.dim_1600x900.png')] bg-cover bg-center opacity-10" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Brain className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Adaptive Intelligence Assessment</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Discover Your{' '}
              <span className="bg-gradient-to-r from-primary via-accent-foreground to-primary bg-clip-text text-transparent">
                True Potential
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Experience an AI-powered adaptive IQ test that adjusts to your performance in real-time. 
              Get accurate results with personalized difficulty progression.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                size="lg"
                onClick={handleStartTest}
                disabled={loginStatus === 'logging-in'}
                className="text-lg px-8 py-6 gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                {loginStatus === 'logging-in' ? 'Connecting...' : 'Start Your Test'}
                <ArrowRight className="h-5 w-5" />
              </Button>
              {!isAuthenticated && (
                <p className="text-sm text-muted-foreground">
                  Sign in required to save your results
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose High IQ?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our advanced adaptive testing system provides the most accurate assessment of your cognitive abilities.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Adaptive Testing</h3>
                <p className="text-sm text-muted-foreground">
                  Questions adjust in real-time based on your performance for maximum accuracy.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Track Progress</h3>
                <p className="text-sm text-muted-foreground">
                  View your complete testing history and monitor your cognitive development.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Detailed Results</h3>
                <p className="text-sm text-muted-foreground">
                  Get comprehensive breakdowns with explanations and performance insights.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Secure & Private</h3>
                <p className="text-sm text-muted-foreground">
                  Your data is encrypted and stored securely on the blockchain.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 border-2 border-primary/20">
            <CardContent className="pt-12 pb-12 text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">Ready to Test Your Intelligence?</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Join thousands of users who have discovered their cognitive potential with our adaptive IQ testing platform.
              </p>
              <Button
                size="lg"
                onClick={handleStartTest}
                disabled={loginStatus === 'logging-in'}
                className="text-lg px-8 py-6 gap-2"
              >
                {loginStatus === 'logging-in' ? 'Connecting...' : 'Begin Assessment'}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
