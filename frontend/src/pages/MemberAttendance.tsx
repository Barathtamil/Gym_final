import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, LogOut, CheckCircle, Download, User, Calendar, CreditCard, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api';

// Gym rules
const gymRules = [
  { icon: '🏋️', title: 'Re-Rack Your Weights', description: 'Always return equipment to its proper place after use' },
  { icon: '🤝', title: 'Share Equipment', description: 'Allow others to work in during rest periods' },
  { icon: '👤', title: 'Respect Personal Space', description: 'Maintain appropriate distance from others' },
  { icon: '🔇', title: 'Keep Noise Down', description: 'Avoid excessive grunting or dropping weights' },
];

// Motivational quotes
const quotes = [
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { text: "Your body can stand almost anything. It's your mind you have to convince.", author: "Unknown" },
  { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Arnold Schwarzenegger" },
  { text: "Don't limit your challenges. Challenge your limits.", author: "Jerry Dunn" },
];


export default function MemberAttendance() {
  const [registrationNo, setRegistrationNo] = useState('');
  const [member, setMember] = useState<{
    id: string;
    registrationNo: string;
    fullName: string;
    planName: string;
    planStartDate: string;
    planEndDate: string;
    daysLeft: number;
    lastInvoice: string;
    profileImage?: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [imageError, setImageError] = useState(false);
  const { logout } = useAuth();
  const { toast } = useToast();

  // Rotate quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async () => {
    if (!registrationNo.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your registration number',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const memberData = await apiClient.getMemberByRegistrationNo(registrationNo.toUpperCase());
      if (memberData) {
        // Calculate days left
        const endDate = new Date(memberData.planEndDate);
        const today = new Date();
        const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        setMember({
          id: memberData.id,
          registrationNo: memberData.registrationNo,
          fullName: memberData.fullName,
          planName: memberData.planName || 'N/A',
          planStartDate: memberData.planStartDate,
          planEndDate: memberData.planEndDate,
          daysLeft,
          lastInvoice: '#INV-2024-001', // This would come from payment data
          profileImage: memberData.profileImage || null,
        });
        setImageError(false); // Reset image error when new member is loaded
      } else {
        toast({
          title: 'Member Not Found',
          description: 'No member found with this registration number',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to search member',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
    if (!member) return;

    setIsMarking(true);
    try {
      // Determine batch from current time or member's batch
      const currentHour = new Date().getHours();
      const batch = currentHour < 12 ? 'morning' : 'evening';
      
      await apiClient.markAttendance(member.id, batch);
      setShowSuccess(true);
      
      toast({
        title: 'Attendance Marked!',
        description: 'Have a great workout! 💪',
      });

      setTimeout(() => {
        setShowSuccess(false);
        setMember(null);
        setRegistrationNo('');
      }, 3000);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to mark attendance',
        variant: 'destructive',
      });
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Gym Info */}
      <div className="hidden lg:flex lg:w-1/2 flex-col relative overflow-hidden">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-background" />
        
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-1/2 -left-1/2 w-full h-full"
            style={{
              background: 'conic-gradient(from 0deg, transparent, hsl(var(--primary)), transparent)',
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col h-full p-8">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center shadow-lg animate-pulse-glow">
              <Dumbbell className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-display tracking-wider text-gradient">MATRIX GYM</h1>
              <p className="text-muted-foreground text-sm tracking-widest">TRANSFORM YOUR LIMITS</p>
            </div>
          </motion.div>

          {/* Gym Rules */}
          <div className="flex-1 space-y-6">
            <h2 className="text-2xl font-display tracking-wide text-foreground border-l-4 border-primary pl-4">
              GYM RULES
            </h2>
            <div className="space-y-4">
              {gymRules.map((rule, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 10, scale: 1.02 }}
                  className="glass-card p-4 border border-border/30"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{rule.icon}</span>
                    <div>
                      <h3 className="font-semibold text-foreground">{rule.title}</h3>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Motivational Quote */}
          <div className="mt-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuote}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="glass-card p-6 border border-primary/20"
              >
                <p className="text-xl font-display text-foreground italic">
                  "{quotes[currentQuote].text}"
                </p>
                <p className="text-sm text-primary mt-2">— {quotes[currentQuote].author}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Right Panel - Attendance Registration */}
      <div className="flex-1 flex flex-col min-h-screen p-6 lg:p-12 bg-background">
        {/* Header with Logout */}
        <div className="flex justify-between items-center mb-8">
          <div className="lg:hidden flex items-center gap-3">
            <Dumbbell className="w-8 h-8 text-primary" />
            <span className="text-2xl font-display">MATRIX GYM</span>
          </div>
          <Button
            variant="outline"
            onClick={logout}
            className="ml-auto flex items-center gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full">
          <AnimatePresence mode="wait">
            {showSuccess ? (
              /* Success Animation */
              <motion.div
                key="success"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="text-center w-full"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="w-32 h-32 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-success"
                >
                  <CheckCircle className="w-16 h-16 text-success" />
                </motion.div>
                <h2 className="text-4xl font-display text-success mb-2">ATTENDANCE MARKED!</h2>
                <p className="text-xl text-muted-foreground">Have a great workout, {member?.fullName}! 💪</p>
              </motion.div>
            ) : member ? (
              /* Member Info Card */
              <motion.div
                key="member"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full"
              >
                <motion.div
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  className="glass-card p-8 border-2 border-primary/30 backdrop-blur-xl bg-card/90 shadow-2xl mb-6"
                >
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                    {member.profileImage && !imageError ? (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/30 shadow-lg ring-2 ring-primary/20">
                        <img
                          src={(() => {
                            // If already a full URL, use it as is
                            if (member.profileImage!.startsWith('http')) {
                              return member.profileImage!;
                            }
                            // Construct full URL from backend base URL
                            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
                            const baseUrl = apiUrl.replace('/api/v1', '');
                            // profileImage is stored as /uploads/profiles/filename
                            return `${baseUrl}${member.profileImage}`;
                          })()}
                          alt={member.fullName}
                          className="w-full h-full object-cover"
                          onError={() => setImageError(true)}
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary/30">
                        <User className="w-8 h-8 text-primary" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-2xl font-display text-foreground">{member.fullName}</h3>
                      <p className="text-muted-foreground">Reg. No: {member.registrationNo}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Plan</p>
                        <p className="font-semibold">{member.planName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Clock className="w-5 h-5 text-success" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Days Left</p>
                        <p className="font-semibold text-success">{member.daysLeft} days</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Calendar className="w-5 h-5 text-secondary" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Start Date</p>
                        <p className="font-semibold">{new Date(member.planStartDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Calendar className="w-5 h-5 text-warning" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Expiry Date</p>
                        <p className="font-semibold">{new Date(member.planEndDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mb-4 hover:bg-secondary/10 hover:border-secondary"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Last Invoice ({member.lastInvoice})
                  </Button>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleMarkAttendance}
                      disabled={isMarking}
                      className="w-full h-16 btn-matrix text-xl font-display tracking-wider shadow-lg hover:shadow-xl"
                    >
                      {isMarking ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-6 h-6 border-4 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                        />
                      ) : (
                        <>
                          <CheckCircle className="w-6 h-6 mr-2" />
                          MARK ATTENDANCE
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>

                <Button
                  variant="ghost"
                  onClick={() => {
                    setMember(null);
                    setRegistrationNo('');
                  }}
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  ← Back to Registration
                </Button>
              </motion.div>
            ) : (
              /* Registration Input */
              <motion.div
                key="input"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="w-full text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-28 h-28 bg-primary/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-8 border-2 border-primary/40 shadow-lg"
                >
                  <User className="w-14 h-14 text-primary" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl lg:text-5xl font-display mb-3 text-gradient"
                >
                  MARK YOUR ATTENDANCE
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-muted-foreground mb-10 text-lg"
                >
                  Enter your registration number to check in
                </motion.p>

                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Input
                      type="text"
                      value={registrationNo}
                      onChange={(e) => setRegistrationNo(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="e.g., MG001"
                      className="h-20 lg:h-24 text-2xl lg:text-3xl text-center font-mono bg-input/80 backdrop-blur-sm border-2 border-border focus:border-primary input-glow uppercase tracking-widest shadow-lg"
                    />
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      onClick={handleSearch}
                      disabled={isLoading}
                      className="w-full h-14 btn-matrix text-lg font-display tracking-wider shadow-lg hover:shadow-xl"
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-6 h-6 border-4 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                        />
                      ) : (
                        'SEARCH MEMBER'
                      )}
                    </Button>
                  </motion.div>
                </div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-xs text-muted-foreground mt-6"
                >
                  Try: <span className="text-primary font-mono">MG001</span> or any 3+ character code
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground mt-8">
          <p>© 2024 Matrix GYM. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
