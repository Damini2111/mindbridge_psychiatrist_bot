import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import AnimatedBot from '@/components/AnimatedBot';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Heart,
  FileText,
  Edit,
  Save,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface UserProfileData {
  name: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalHistory: {
    conditions: string;
    medications: string;
    allergies: string;
    previousTherapy: string;
    notes: string;
  };
}

const API = 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('token') || '';

const UserProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfileData>({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalHistory: {
      conditions: '',
      medications: '',
      allergies: '',
      previousTherapy: '',
      notes: '',
    },
  });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      // 1. Fetch Basic Profile
      const res = await fetch(`${API}/user/profile`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      
      if (data.success) {
        const u = data.user;
        
        // 2. Fetch Medical History
        const medRes = await fetch(`${API}/medical/history`, {
            headers: { Authorization: `Bearer ${getToken()}` },
        });
        const medData = await medRes.json();
        const latestMed = medData.data?.[0] || {};

        setProfile({
          name: u.display_name || '',
          email: u.email || '',
          phone: u.phone || '',
          gender: u.gender || '',
          dateOfBirth: u.dob ? u.dob.split('T')[0] : '',
          emergencyContact: u.emergency_contact_name || '',
          emergencyPhone: u.emergency_contact_phone || '',
          medicalHistory: {
            conditions: latestMed.condition || '',
            medications: latestMed.medications || '',
            allergies: latestMed.allergies || '',
            previousTherapy: latestMed.previous_therapy || '',
            notes: latestMed.notes || '',
          },
        });
      }
    } catch (err) {
      toast.error("Failed to sync with MindBridge cloud");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/');
  };

  const handleSave = async () => {
    try {
        // 1. Save Profile
        const res = await fetch(`${API}/user/profile`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getToken()}` 
            },
            body: JSON.stringify({
                name: profile.name,
                phone: profile.phone,
                gender: profile.gender,
                dob: profile.dateOfBirth,
                emergencyContactName: profile.emergencyContact,
                emergencyContactPhone: profile.emergencyPhone
            })
        });

        // 2. Save Medical History
        await fetch(`${API}/medical/sync`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getToken()}` 
            },
            body: JSON.stringify({
                conditions: profile.medicalHistory.conditions,
                medications: profile.medicalHistory.medications,
                allergies: profile.medicalHistory.allergies,
                previousTherapy: profile.medicalHistory.previousTherapy,
                notes: profile.medicalHistory.notes
            })
        });

        const data = await res.json();
        if (data.success) {
            toast.success("Profile synchronized with database");
            setIsEditing(false);
            localStorage.setItem('userName', profile.name);
        } else {
            throw new Error(data.message);
        }
    } catch (err: any) {
        toast.error(err.message || "Sync failed");
    }
  };

  const handleCancel = () => {
    fetchProfile();
    setIsEditing(false);
  };

  const handleChange = (field: string, value: string) => {
    if (field.startsWith('medicalHistory.')) {
      const medicalField = field.split('.')[1];
      setProfile({
        ...profile,
        medicalHistory: {
          ...profile.medicalHistory,
          [medicalField]: value,
        },
      });
    } else {
      setProfile({
        ...profile,
        [field]: value,
      });
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar userRole="user" onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/settings')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </Button>

        {/* Header */}
        <section className="text-center mb-12 fade-in-up">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <User className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {profile.name || 'Your Profile'}
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your personal information and medical history
          </p>
        </section>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} size="lg" className="gap-2">
              <Edit className="w-4 h-4" />
              Edit Profile
            </Button>
          ) : (
            <>
              <Button onClick={handleSave} size="lg" className="gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
              <Button onClick={handleCancel} variant="outline" size="lg" className="gap-2">
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <Card variant="glass" className="fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription>Your basic details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-foreground">{profile.name || 'Not set'}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="your.email@example.com"
                  />
                ) : (
                  <p className="text-foreground">{profile.email || 'Not set'}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+1 (555) 000-0000"
                  />
                ) : (
                  <p className="text-foreground">{profile.phone || 'Not set'}</p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Gender
                </label>
                {isEditing ? (
                  <select
                    value={profile.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                ) : (
                  <p className="text-foreground capitalize">{profile.gender || 'Not set'}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date of Birth
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="text-foreground">{profile.dateOfBirth || 'Not set'}</p>
                )}
              </div>

              {/* Emergency Contact */}
              <div className="pt-4 border-t border-border">
                <h3 className="font-semibold text-foreground mb-4">Emergency Contact</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Contact Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.emergencyContact}
                        onChange={(e) => handleChange('emergencyContact', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Emergency contact name"
                      />
                    ) : (
                      <p className="text-foreground">{profile.emergencyContact || 'Not set'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Contact Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profile.emergencyPhone}
                        onChange={(e) => handleChange('emergencyPhone', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="+1 (555) 000-0000"
                      />
                    ) : (
                      <p className="text-foreground">{profile.emergencyPhone || 'Not set'}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical History */}
          <Card variant="glass" className="fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Medical History
              </CardTitle>
              <CardDescription>Information to help provide better care</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Medical Conditions */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Medical Conditions
                </label>
                {isEditing ? (
                  <textarea
                    value={profile.medicalHistory.conditions}
                    onChange={(e) => handleChange('medicalHistory.conditions', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                    placeholder="List any existing medical conditions..."
                  />
                ) : (
                  <p className="text-foreground">{profile.medicalHistory.conditions || 'None listed'}</p>
                )}
              </div>

              {/* Current Medications */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Current Medications
                </label>
                {isEditing ? (
                  <textarea
                    value={profile.medicalHistory.medications}
                    onChange={(e) => handleChange('medicalHistory.medications', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                    placeholder="List any medications you're currently taking..."
                  />
                ) : (
                  <p className="text-foreground">{profile.medicalHistory.medications || 'None listed'}</p>
                )}
              </div>

              {/* Allergies */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Allergies
                </label>
                {isEditing ? (
                  <textarea
                    value={profile.medicalHistory.allergies}
                    onChange={(e) => handleChange('medicalHistory.allergies', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                    placeholder="List any known allergies..."
                  />
                ) : (
                  <p className="text-foreground">{profile.medicalHistory.allergies || 'None listed'}</p>
                )}
              </div>

              {/* Previous Therapy */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Previous Therapy Experience
                </label>
                {isEditing ? (
                  <textarea
                    value={profile.medicalHistory.previousTherapy}
                    onChange={(e) => handleChange('medicalHistory.previousTherapy', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                    placeholder="Describe any previous therapy or counseling experience..."
                  />
                ) : (
                  <p className="text-foreground">{profile.medicalHistory.previousTherapy || 'None listed'}</p>
                )}
              </div>

              {/* Additional Notes */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Additional Notes
                </label>
                {isEditing ? (
                  <textarea
                    value={profile.medicalHistory.notes}
                    onChange={(e) => handleChange('medicalHistory.notes', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                    placeholder="Any other information you'd like to share..."
                  />
                ) : (
                  <p className="text-foreground">{profile.medicalHistory.notes || 'None'}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Privacy Notice */}
        <Card variant="calm" className="mt-8 fade-in-up">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AnimatedBot size="sm" mood="empathetic" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Privacy & Security</h3>
                <p className="text-sm text-muted-foreground">
                  Your personal and medical information is encrypted and stored securely. We never share your data with third parties without your explicit consent. All information is used solely to provide you with better personalized care and support.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UserProfile;