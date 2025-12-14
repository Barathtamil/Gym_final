import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Loader2, Dumbbell } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Import bodybuilder image
import back3 from '@/assets/background/back3.jpg';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const success = await login(data.username, data.password);
      if (success) {
        toast({
          title: 'Welcome back!',
          description: 'Login successful. Redirecting...',
        });
        navigate('/dashboard');
      } else {
        toast({
          title: 'Login Failed',
          description: 'Invalid username or password',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Bodybuilder Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={back3}
            alt="Gym motivation"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Dark overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-transparent" />
        
        {/* Content overlay */}
        <div className="relative z-10 flex flex-col h-full p-10 justify-between">
          {/* Logo and Title */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-16 h-16 bg-primary/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-xl border-2 border-primary/50"
              >
                <Dumbbell className="w-9 h-9 text-primary-foreground" />
              </motion.div>
              <div>
                <h1 className="text-5xl font-display tracking-wider text-gradient drop-shadow-lg">
                  MATRIX GYM
                </h1>
                <p className="text-muted-foreground/90 text-sm tracking-widest font-semibold">
                  TRANSFORM YOUR LIMITS
                </p>
              </div>
            </div>
          </motion.div>

          {/* Motivational Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="glass-card p-8 backdrop-blur-md border-2 border-primary/30 bg-background/80"
          >
            <h2 className="text-4xl font-display mb-4 text-foreground">
              Welcome Back!
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Your journey to greatness continues here. Log in to track your progress, 
              manage your membership, and achieve your fitness goals.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Dumbbell className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-display tracking-wider text-gradient">MATRIX GYM</h1>
          </div>

          <div className="glass-card p-8 lg:p-10 border-2 border-border/50 backdrop-blur-xl bg-card/90 shadow-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl lg:text-4xl font-display mb-3 tracking-wide text-gradient">
                MEMBER LOGIN
              </h2>
              <p className="text-sm text-muted-foreground tracking-wider">
                Enter your credentials to access your account
              </p>
            </motion.div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="username" className="text-sm uppercase tracking-wider font-semibold">
                  Username
                </Label>
                <motion.div whileFocus={{ scale: 1.01 }}>
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    {...register('username')}
                    className="h-12 bg-input/80 backdrop-blur-sm border-2 border-border focus:border-primary input-glow transition-all"
                  />
                </motion.div>
                {errors.username && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive"
                  >
                    {errors.username.message}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="password" className="text-sm uppercase tracking-wider font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    {...register('password')}
                    className="h-12 bg-input/80 backdrop-blur-sm border-2 border-border focus:border-primary input-glow transition-all pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Eye className="w-5 h-5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 btn-matrix text-lg font-display tracking-wider shadow-lg hover:shadow-xl transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      ENTER THE MATRIX
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Demo credentials */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 p-5 bg-muted/40 backdrop-blur-sm rounded-xl border border-border/50 shadow-lg"
            >
              <p className="text-xs text-muted-foreground text-center mb-3 font-semibold uppercase tracking-wider">
                Demo Credentials
              </p>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="p-3 bg-background/60 backdrop-blur-sm rounded-lg border border-primary/20 hover:border-primary/40 transition-all cursor-pointer"
                >
                  <p className="font-bold text-primary mb-1">Admin</p>
                  <p className="text-muted-foreground text-[10px]">admin</p>
                  <p className="text-muted-foreground text-[10px]">admin123</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="p-3 bg-background/60 backdrop-blur-sm rounded-lg border border-secondary/20 hover:border-secondary/40 transition-all cursor-pointer"
                >
                  <p className="font-bold text-secondary mb-1">Staff</p>
                  <p className="text-muted-foreground text-[10px]">staff</p>
                  <p className="text-muted-foreground text-[10px]">staff123</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="p-3 bg-background/60 backdrop-blur-sm rounded-lg border border-accent/20 hover:border-accent/40 transition-all cursor-pointer"
                >
                  <p className="font-bold text-accent mb-1">Member</p>
                  <p className="text-muted-foreground text-[10px]">member</p>
                  <p className="text-muted-foreground text-[10px]">member123</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
