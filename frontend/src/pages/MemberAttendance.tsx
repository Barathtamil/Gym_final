import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, LogOut, CheckCircle, Download, User, Calendar, CreditCard, Clock, UserPlus, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ImageUpload } from '@/components/ui/image-upload';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api';
import logo from '@/assets/logo/logo.png';

// Gym rules
const gymRules = [
  { icon: '🏋️', title: 'Re-Rack Your Weights', description: 'Always return equipment to its proper place after use' },
  { icon: '🤝', title: 'Share Equipment', description: 'Allow others to work in during rest periods' },
  { icon: '👤', title: 'Respect Personal Space', description: 'Maintain appropriate distance from others' },
  { icon: '🔇', title: 'Keep Noise Down', description: 'Avoid excessive grunting or dropping weights' },
];

// Motivational quotes
// const quotes = [
//   { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
//   { text: "Your body can stand almost anything. It's your mind you have to convince.", author: "Unknown" },
//   { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Arnold Schwarzenegger" },
//   { text: "Don't limit your challenges. Challenge your limits.", author: "Jerry Dunn" },
// ];

const quotes = [
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { text: "Your body can stand almost anything. It's your mind you have to convince.", author: "Unknown" },
  { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Arnold Schwarzenegger" },
  { text: "Don't limit your challenges. Challenge your limits.", author: "Jerry Dunn" },

  { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
  { text: "No pain, no gain. Shut up and train.", author: "Unknown" },
  { text: "The hardest lift of all is lifting your butt off the couch.", author: "Unknown" },
  { text: "Train insane or remain the same.", author: "Jillian Michaels" },
  { text: "Strength does not come from winning. Your struggles develop your strengths.", author: "Arnold Schwarzenegger" },
  { text: "The body achieves what the mind believes.", author: "Napoleon Hill" },
  { text: "You don’t have to be extreme, just consistent.", author: "Unknown" },
  { text: "Push yourself because no one else is going to do it for you.", author: "Unknown" },
  { text: "Wake up. Work out. Look hot. Kick ass.", author: "Unknown" },
  { text: "Sweat is just fat crying.", author: "Unknown" },
  { text: "A one-hour workout is only 4% of your day. No excuses.", author: "Unknown" },
  { text: "The difference between try and triumph is a little umph.", author: "Marvin Phillips" },
  { text: "Fall in love with taking care of your body.", author: "Unknown" },
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
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const { logout } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      const branchesData = await apiClient.getBranches();
      setBranches(branchesData || []);
    } catch (error) {
      console.error('Failed to load branches:', error);
    }
  };

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
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Left Panel - Gym Info */}
      <div className="hidden lg:flex lg:w-1/2 flex-col relative overflow-hidden h-screen">
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
      <div className="flex-1 flex flex-col h-screen overflow-hidden p-4 lg:p-6 bg-background">
        {/* Header with Logout */}
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
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
        <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full overflow-hidden">
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
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
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

                  <div className="grid grid-cols-2 gap-3 mb-4">
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
                    className="w-full mb-3 hover:bg-secondary/10 hover:border-secondary text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Last Invoice ({member.lastInvoice})
                  </Button>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleMarkAttendance}
                      disabled={isMarking}
                      className="w-full h-12 btn-matrix text-lg font-display tracking-wider shadow-lg hover:shadow-xl"
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
                  className="w-full text-muted-foreground hover:text-foreground text-sm"
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
                  className="w-20 h-20 lg:w-24 lg:h-24 bg-primary/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-primary/40 shadow-lg p-2"
                >
                  <img
                    src={logo}
                    alt="Matrix Gym Logo"
                    className="w-full h-full object-contain"
                  />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl lg:text-4xl font-display mb-2 text-gradient"
                >
                  MARK YOUR ATTENDANCE
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-muted-foreground mb-6 text-base"
                >
                  Enter your registration number to check in
                </motion.p>

                <div className="space-y-4">
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
                      placeholder="e.g., 0001"
                      className="h-16 lg:h-20 text-xl lg:text-2xl text-center font-mono bg-input/80 backdrop-blur-sm border-2 border-border focus:border-primary input-glow uppercase tracking-widest shadow-lg"
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
                      className="w-full h-12 btn-matrix text-base font-display tracking-wider shadow-lg hover:shadow-xl"
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
                  Try: <span className="text-primary font-mono">0001</span> or any 3+ character code
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mt-8 pt-8 border-t border-border"
                >
                  <Button
                    onClick={() => setIsRegistrationOpen(true)}
                    variant="outline"
                    className="w-full hover:bg-primary/10 hover:text-primary hover:border-primary"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    New Member Registration
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Not a member yet? Register here for approval
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground mt-4 flex-shrink-0">
          <p>© 2024 Matrix GYM. All rights reserved.</p>
        </div>
      </div>

      {/* Registration Dialog */}
      <Dialog open={isRegistrationOpen} onOpenChange={setIsRegistrationOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display">NEW MEMBER REGISTRATION</DialogTitle>
          </DialogHeader>
          <PendingMemberRegistrationForm
            branches={branches}
            onClose={() => {
              setIsRegistrationOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Pending Member Registration Form Component
function PendingMemberRegistrationForm({ branches, onClose }: { branches: any[]; onClose: () => void }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dob, setDob] = useState('');
  const [age, setAge] = useState<number | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    phoneNumber: '',
    batch: 'morning' as 'morning' | 'evening',
    branchId: branches[0]?.id || '',
    address: '',
    aadharNumber: '',
    bloodGroup: '',
    weight: '',
    height: '',
    gender: 'male' as 'male' | 'female' | 'other',
  });

  const handleDobChange = (value: string) => {
    setDob(value);
    setFormData({ ...formData, dateOfBirth: value });
    if (value) {
      const birthDate = new Date(value);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge);
    } else {
      setAge(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName || formData.fullName.trim() === '') {
      toast({
        title: 'Validation Error',
        description: 'Please enter full name',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.dateOfBirth) {
      toast({
        title: 'Validation Error',
        description: 'Please select date of birth',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.phoneNumber || formData.phoneNumber.trim() === '') {
      toast({
        title: 'Validation Error',
        description: 'Please enter phone number',
        variant: 'destructive',
      });
      return;
    }

    if (formData.phoneNumber.length !== 10) {
      toast({
        title: 'Validation Error',
        description: 'Phone number must be exactly 10 digits',
        variant: 'destructive',
      });
      return;
    }

    if (formData.aadharNumber && formData.aadharNumber.trim() !== '' && formData.aadharNumber.length !== 12) {
      toast({
        title: 'Validation Error',
        description: 'Aadhar number must be exactly 12 digits',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.bloodGroup || formData.bloodGroup.trim() === '') {
      toast({
        title: 'Validation Error',
        description: 'Please select blood group',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.branchId) {
      toast({
        title: 'Validation Error',
        description: 'Please select branch',
        variant: 'destructive',
      });
      return;
    }

    const weightValue = formData.weight ? parseFloat(formData.weight) : null;
    const heightValue = formData.height ? parseFloat(formData.height) : null;

    if (!formData.weight || !weightValue || weightValue <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid weight (greater than zero)',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.height || !heightValue || heightValue <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid height (greater than zero)',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.createPendingRegistration(
        {
          ...formData,
          age: age || 0,
          weight: weightValue,
          height: heightValue,
        },
        profileImage
      );

      toast({
        title: 'Registration Submitted!',
        description: 'Your registration has been submitted for approval.',
      });

      // Reset form
      setFormData({
        fullName: '',
        dateOfBirth: '',
        phoneNumber: '',
        batch: 'morning',
        branchId: branches[0]?.id || '',
        address: '',
        aadharNumber: '',
        bloodGroup: '',
        weight: '',
        height: '',
        gender: 'male',
      });
      setDob('');
      setAge(null);
      setProfileImage(null);
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit registration',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Full Name *</Label>
          <Input
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="John Doe"
            className="bg-input"
          />
        </div>
        <div className="space-y-2">
          <Label>Date of Birth *</Label>
          <Input
            type="date"
            value={dob}
            onChange={(e) => handleDobChange(e.target.value)}
            className="bg-input"
          />
        </div>
        <div className="space-y-2">
          <Label>Age (Auto-calculated)</Label>
          <Input value={age !== null ? `${age} years` : ''} readOnly className="bg-muted" />
        </div>
        <div className="space-y-2">
          <Label>Phone Number *</Label>
          <Input
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            placeholder="9876543210"
            className="bg-input"
            maxLength={10}
          />
        </div>
        <div className="space-y-2">
          <Label>Gender *</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => setFormData({ ...formData, gender: value as 'male' | 'female' | 'other' })}
          >
            <SelectTrigger className="bg-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Blood Group *</Label>
          <Select
            value={formData.bloodGroup}
            onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}
          >
            <SelectTrigger className="bg-input">
              <SelectValue placeholder="Select blood group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A+">A+</SelectItem>
              <SelectItem value="A-">A-</SelectItem>
              <SelectItem value="B+">B+</SelectItem>
              <SelectItem value="B-">B-</SelectItem>
              <SelectItem value="AB+">AB+</SelectItem>
              <SelectItem value="AB-">AB-</SelectItem>
              <SelectItem value="O+">O+</SelectItem>
              <SelectItem value="O-">O-</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Batch *</Label>
          <Select
            value={formData.batch}
            onValueChange={(value) => setFormData({ ...formData, batch: value as 'morning' | 'evening' })}
          >
            <SelectTrigger className="bg-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">Morning</SelectItem>
              <SelectItem value="evening">Evening</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Branch *</Label>
          <Select
            value={formData.branchId}
            onValueChange={(value) => setFormData({ ...formData, branchId: value })}
          >
            <SelectTrigger className="bg-input">
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Weight (kg) *</Label>
          <Input
            type="number"
            step="0.1"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            placeholder="70"
            className="bg-input"
          />
        </div>
        <div className="space-y-2">
          <Label>Height (cm) *</Label>
          <Input
            type="number"
            step="0.1"
            value={formData.height}
            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
            placeholder="170"
            className="bg-input"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Address</Label>
          <Textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Enter your address"
            className="bg-input"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>Aadhar Number (Optional)</Label>
          <Input
            value={formData.aadharNumber}
            onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value.replace(/\D/g, '').slice(0, 12) })}
            placeholder="123456789012"
            className="bg-input"
            maxLength={12}
          />
        </div>
        <div className="space-y-2">
          <ImageUpload
            value={profileImage}
            onChange={setProfileImage}
            label="Profile Image"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" className="btn-matrix" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Registration'}
        </Button>
      </div>
    </form>
  );
}
