import React, { useState, useEffect, useMemo } from 'react';
import { 
  Heart, 
  Calendar, 
  User, 
  Stethoscope, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  RefreshCw, 
  LogOut, 
  Shield, 
  Edit3, 
  Save, 
  Phone, 
  Building,
  Search,
  Eye,
  Languages,
  ArrowRight,
  ArrowLeft,
  CalendarCheck,
  Star,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Filter,
  Check,
  ChevronRight,
  Home,
  SlidersHorizontal,
  Navigation,
  X,
  HeartPulse,
  Baby,
  Activity,
  Ear,
  Brain,
  Smile,
  Flame,
  Wind
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { usePatientLanguage } from '../context/PatientLanguageContext';
import RomanUrduInputAssist from '../components/RomanUrduInputAssist';
import DocCareLogo from '../components/DocCareLogo';
import SEOHead from '../components/SEOHead';

const CITY_URDU_MAP = {
  "Lahore": "لاہور",
  "Karachi": "کراچی",
  "Islamabad": "اسلام آباد",
  "Rawalpindi": "راولپنڈی",
  "Faisalabad": "فیصل آباد",
  "Multan": "ملتان",
  "Peshawar": "پشاور",
  "Quetta": "کوئٹہ",
  "Sialkot": "سیالکوٹ",
  "Gujranwala": "گوجرانوالہ"
};

const POPULAR_CITIES = [
  { name: "Lahore", urdu: "لاہور" },
  { name: "Karachi", urdu: "کراچی" },
  { name: "Islamabad", urdu: "اسلام آباد" },
  { name: "Rawalpindi", urdu: "راولپنڈی" },
  { name: "Faisalabad", urdu: "فیصل آباد" },
  { name: "Multan", urdu: "ملتان" },
  { name: "Peshawar", urdu: "پشاور" },
  { name: "Quetta", urdu: "کوئٹہ" }
];

const SPECIALTY_URDU_MAP = {
  "General Physician": "جنرل فزیشن (معالجِ عمومی)",
  "Cardiologist": "ماہر امراض قلب (کارڈیالوجسٹ)",
  "Consultant Physician & Diabetologist": "کنسلٹنٹ فزیشن و شوگر اسپیشلسٹ",
  "Consultant Cardiologist & Heart Specialist": "کنسلٹنٹ کارڈیالوجسٹ (ماہر امراض قلب)",
  "Consultant Pediatrician & Child Specialist": "کنسلٹنٹ ماہر امراض اطفال (بچوں کے ڈاکٹر)",
  "Pediatrician": "ماہر امراض اطفال (بچوں کے ڈاکٹر)",
  "Consultant Dermatologist & Cosmetologist": "کنسلٹنٹ ماہر امراض جلد و ڈرماٹالوجسٹ",
  "Dermatologist": "ماہر امراض جلد (ڈرماٹالوجسٹ)",
  "Consultant Gynecologist & Obstetrician": "کنسلٹنٹ ماہر امراض نسواں و زچگی",
  "Gynecologist": "ماہر امراض نسواں (گائناکالوجسٹ)",
  "Consultant Orthopedic Surgeon": "کنسلٹنٹ آرتھوپیڈک سرجن (ہڈی و جوڑ)",
  "Orthopedic": "ماہر امراض ہڈی و جوڑ (آرتھوپیڈک)",
  "ENT Specialist": "ماہر امراض کان، ناک، گلا (ای این ٹی)",
  "Neurologist": "ماہر امراض اعصاب و دماغ",
  "Psychiatrist": "ماہر نفسیات (سائیکاٹرسٹ)",
  "Dentist": "ماہر امراض دندان (ڈینٹسٹ)",
  "Ophthalmologist": "ماہر امراض چشم (آنکھوں کے ڈاکٹر)",
  "Gastroenterologist": "ماہر امراض معدہ و جگر",
  "Urologist": "ماہر امراض گردہ و مثانہ",
  "Endocrinologist": "ماہر غدود و شوگر",
  "Pulmonologist": "ماہر امراض سینہ و پھیپھڑے"
};

const POPULAR_SPECIALTIES_GRID = [
  { name: "Cardiologist", icon: HeartPulse, count: "12+ Doctors", color: "from-rose-500 to-red-600" },
  { name: "General Physician", icon: Stethoscope, count: "25+ Doctors", color: "from-teal-500 to-emerald-600" },
  { name: "Pediatrician", icon: Baby, count: "14+ Doctors", color: "from-amber-500 to-orange-600" },
  { name: "Dermatologist", icon: Sparkles, count: "10+ Doctors", color: "from-purple-500 to-indigo-600" },
  { name: "Gynecologist", icon: User, count: "18+ Doctors", color: "from-pink-500 to-rose-600" },
  { name: "Orthopedic", icon: Activity, count: "9+ Doctors", color: "from-blue-500 to-cyan-600" },
  { name: "ENT Specialist", icon: Ear, count: "8+ Doctors", color: "from-emerald-500 to-teal-700" },
  { name: "Neurologist", icon: Brain, count: "6+ Doctors", color: "from-violet-500 to-purple-700" }
];

export default function PatientDashboardPage({ onNavigateToDirectory, onSelectDoctor }) {
  const { user, currentPatient, logout, updateCurrentPatient } = useAuth();
  const { patientLang, togglePatientLanguage, tPatient, isPatientRTL } = usePatientLanguage();

  // Navigation: HOME | FIND DOCTORS | APPOINTMENTS | PROFILE
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'find-doctors' | 'appointments' | 'profile'

  // Global Data States
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [doctorsList, setDoctorsList] = useState([]);
  const [specialtiesList, setSpecialtiesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Search & Filter States for "Find Doctors"
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('All');
  const [filterCity, setFilterCity] = useState('All');
  const [filterArea, setFilterArea] = useState('');
  const [filterFeeTier, setFilterFeeTier] = useState('all'); // 'all' | 'under1500' | '1500to3000' | 'above3000'
  const [filterAvailability, setFilterAvailability] = useState('all'); // 'all' | 'today' | 'tomorrow' | 'week'
  const [filterGender, setFilterGender] = useState('all'); // 'all' | 'male' | 'female'
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Appointments Tab Sub-state: 'upcoming' | 'past'
  const [appointmentSubTab, setAppointmentSubTab] = useState('upcoming');
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('all');

  // Doctor Public Profile Modal State
  const [selectedDoctorForProfile, setSelectedDoctorForProfile] = useState(null);

  // Booking Modal State (In-App Booking Wizard)
  const [bookingModal, setBookingModal] = useState({
    isOpen: false,
    doctor: null,
    step: 1, // 1: Date & Time, 2: Patient Info, 3: Success Confirmation
    selectedDate: new Date().toISOString().split('T')[0],
    selectedSlot: null,
    slotsData: { available: true, slots: [] },
    loadingSlots: false,
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    reason: '',
    confirmedAppointment: null,
    submitting: false,
    errorMessage: ''
  });

  // Appointment Details / Receipt Modal
  const [viewingAppointment, setViewingAppointment] = useState(null);

  // Cancel Appointment Modal State
  const [cancelModal, setCancelModal] = useState({ isOpen: false, appointmentId: null, reason: '', cancelling: false });

  // Edit Profile Form State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    nameUrdu: '',
    phone: '',
    email: '',
    age: 30,
    gender: 'Male',
    city: 'Lahore'
  });

  // Load Patient Portal Data and Public Doctors Catalog
  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashRes, docsRes, specsRes, citiesRes] = await Promise.all([
        api.getPatientDashboard().catch(() => ({ success: false, appointments: [], patient: null })),
        api.getPublicDoctors().catch(() => ({ doctors: [] })),
        api.getPublicSpecialties().catch(() => ({ specialties: [] })),
        api.getPublicCities().catch(() => ({ cities: [] }))
      ]);

      if (dashRes && dashRes.success) {
        setDashboardData(dashRes);
        if (dashRes.patient) {
          setProfileForm({
            name: dashRes.patient.name || user?.name || '',
            nameUrdu: dashRes.patient.nameUrdu || '',
            phone: dashRes.patient.phone || user?.phone || '',
            email: dashRes.patient.email || user?.email || '',
            age: dashRes.patient.age || 30,
            gender: dashRes.patient.gender || 'Male',
            city: dashRes.patient.city || 'Lahore'
          });
        }
      }

      setDoctorsList(docsRes.doctors || []);
      if (specsRes.specialties?.length) setSpecialtiesList(specsRes.specialties);
      if (citiesRes.cities?.length) setCitiesList(citiesRes.cities);
    } catch (err) {
      console.error("Failed to load patient portal data:", err);
      setError(err.message || (isPatientRTL ? "ڈیٹا لوڈ نہیں ہو سکا۔" : "Failed to load portal data."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filtered Doctors Calculation
  const filteredDoctors = useMemo(() => {
    return doctorsList.filter(doc => {
      // Search query (doctor name, specialty, clinic, city, area)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (doc.name || '').toLowerCase().includes(q);
        const matchSpec = (doc.specialization || '').toLowerCase().includes(q);
        const matchClinic = (doc.clinicName || '').toLowerCase().includes(q);
        const matchCity = (doc.city || '').toLowerCase().includes(q);
        const matchAddress = (doc.address || '').toLowerCase().includes(q);
        if (!matchName && !matchSpec && !matchClinic && !matchCity && !matchAddress) return false;
      }

      // City Filter
      if (filterCity !== 'All') {
        if ((doc.city || '').toLowerCase() !== filterCity.toLowerCase()) return false;
      }

      // Specialty Filter
      if (filterSpecialty !== 'All') {
        const docSpec = (doc.specialization || '').toLowerCase();
        if (!docSpec.includes(filterSpecialty.toLowerCase())) return false;
      }

      // Area Filter
      if (filterArea.trim()) {
        const a = filterArea.toLowerCase().trim();
        const matchAddress = (doc.address || '').toLowerCase().includes(a);
        if (!matchAddress) return false;
      }

      // Fee Tier Filter
      if (filterFeeTier !== 'all') {
        const fee = Number(doc.consultationFee) || 0;
        if (filterFeeTier === 'under1500' && fee > 1500) return false;
        if (filterFeeTier === '1500to3000' && (fee < 1500 || fee > 3000)) return false;
        if (filterFeeTier === 'above3000' && fee < 3000) return false;
      }

      // Availability Filter
      if (filterAvailability !== 'all') {
        const next = (doc.nextAvailable || '').toLowerCase();
        if (filterAvailability === 'today' && !next.includes('today')) return false;
        if (filterAvailability === 'tomorrow' && !next.includes('tomorrow')) return false;
      }

      // Gender Filter
      if (filterGender !== 'all') {
        const docGender = (doc.gender || '').toLowerCase();
        if (docGender && docGender !== filterGender.toLowerCase()) return false;
      }

      return true;
    });
  }, [doctorsList, searchQuery, filterCity, filterSpecialty, filterArea, filterFeeTier, filterAvailability, filterGender]);

  // Filtered Appointments (Patient's own only)
  const patientAppointments = useMemo(() => {
    return dashboardData?.appointments || [];
  }, [dashboardData]);

  const upcomingAppointments = useMemo(() => {
    return patientAppointments.filter(a => a.status === 'confirmed' || a.status === 'pending');
  }, [patientAppointments]);

  const pastAppointments = useMemo(() => {
    return patientAppointments.filter(a => a.status === 'completed' || a.status === 'cancelled');
  }, [patientAppointments]);

  const displayedAppointments = useMemo(() => {
    const list = appointmentSubTab === 'upcoming' ? upcomingAppointments : pastAppointments;
    if (appointmentStatusFilter === 'all') return list;
    return list.filter(a => a.status === appointmentStatusFilter);
  }, [appointmentSubTab, upcomingAppointments, pastAppointments, appointmentStatusFilter]);

  // Quick Hero Search Handler from HOME tab
  const handleHeroSearch = (e) => {
    e.preventDefault();
    setActiveTab('find-doctors');
  };

  // Quick Specialty Click Handler
  const handleQuickSpecialtyClick = (specialtyName) => {
    setFilterSpecialty(specialtyName);
    setActiveTab('find-doctors');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Quick City Click Handler
  const handleQuickCityClick = (cityName) => {
    setFilterCity(cityName);
    setActiveTab('find-doctors');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open In-App Booking Modal
  const handleOpenBooking = async (doctor) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setBookingModal({
      isOpen: true,
      doctor,
      step: 1,
      selectedDate: todayStr,
      selectedSlot: null,
      slotsData: { available: true, slots: [] },
      loadingSlots: true,
      patientName: profileForm.name || user?.name || '',
      patientPhone: profileForm.phone || user?.phone || '',
      patientEmail: profileForm.email || user?.email || '',
      reason: '',
      confirmedAppointment: null,
      submitting: false,
      errorMessage: ''
    });

    try {
      const res = await api.getAvailableSlots(doctor.slug || doctor.id, todayStr);
      setBookingModal(prev => ({ ...prev, slotsData: res, loadingSlots: false }));
    } catch (err) {
      setBookingModal(prev => ({
        ...prev,
        slotsData: { available: false, reason: err.message, slots: [] },
        loadingSlots: false
      }));
    }
  };

  // Handle Date Change in Booking Modal
  const handleBookingDateChange = async (date) => {
    if (!bookingModal.doctor) return;
    setBookingModal(prev => ({ ...prev, selectedDate: date, selectedSlot: null, loadingSlots: true, errorMessage: '' }));
    try {
      const res = await api.getAvailableSlots(bookingModal.doctor.slug || bookingModal.doctor.id, date);
      setBookingModal(prev => ({ ...prev, slotsData: res, loadingSlots: false }));
    } catch (err) {
      setBookingModal(prev => ({
        ...prev,
        slotsData: { available: false, reason: err.message, slots: [] },
        loadingSlots: false
      }));
    }
  };

  // Submit Booking Form
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!bookingModal.selectedSlot) {
      setBookingModal(prev => ({ ...prev, errorMessage: isPatientRTL ? "براہ کرم وقت کا سلاٹ منتخب کریں۔" : "Please select a time slot." }));
      return;
    }
    if (!bookingModal.patientName.trim()) {
      setBookingModal(prev => ({ ...prev, errorMessage: isPatientRTL ? "براہ کرم مریض کا نام درج کریں۔" : "Please enter patient name." }));
      return;
    }
    if (!bookingModal.patientPhone.trim()) {
      setBookingModal(prev => ({ ...prev, errorMessage: isPatientRTL ? "براہ کرم درست موبائل نمبر درج کریں۔" : "Please enter a valid phone number." }));
      return;
    }

    setBookingModal(prev => ({ ...prev, submitting: true, errorMessage: '' }));

    try {
      const res = await api.bookPublicAppointment({
        doctor_id: bookingModal.doctor.id,
        date: bookingModal.selectedDate,
        time_slot: bookingModal.selectedSlot,
        patient_name: bookingModal.patientName,
        patient_phone: bookingModal.patientPhone,
        patient_email: bookingModal.patientEmail,
        notes: bookingModal.reason,
        appointment_type: 'In-Person Consultation'
      });

      if (res.success) {
        setBookingModal(prev => ({
          ...prev,
          step: 3,
          submitting: false,
          confirmedAppointment: res.appointment
        }));
        await loadAllData();
      }
    } catch (err) {
      setBookingModal(prev => ({
        ...prev,
        submitting: false,
        errorMessage: err.message || (isPatientRTL ? "بکنگ مکمل نہیں ہو سکی۔ دوبارہ کوشش کریں۔" : "Failed to book appointment. Please try again.")
      }));
    }
  };

  // Cancel Appointment Handler
  const handleCancelAppointment = async () => {
    if (!cancelModal.appointmentId) return;
    setCancelModal(prev => ({ ...prev, cancelling: true }));
    try {
      const res = await api.cancelPatientAppointment(cancelModal.appointmentId, cancelModal.reason);
      if (res.success) {
        setSuccessMsg(isPatientRTL ? "اپائنٹمنٹ کامیابی سے منسوخ کر دی گئی ہے۔" : "Appointment cancelled successfully.");
        setCancelModal({ isOpen: false, appointmentId: null, reason: '', cancelling: false });
        if (viewingAppointment?.id === cancelModal.appointmentId) {
          setViewingAppointment(null);
        }
        await loadAllData();
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) {
      setError(err.message || (isPatientRTL ? "اپائنٹمنٹ منسوخ نہیں ہو سکی۔" : "Failed to cancel appointment."));
      setCancelModal(prev => ({ ...prev, cancelling: false }));
    }
  };

  // Save Profile Handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await updateCurrentPatient(profileForm);
      if (res.success) {
        setSuccessMsg(isPatientRTL ? "پروفائل کامیابی سے محفوظ ہو گئی ہے۔" : "Profile updated successfully.");
        setIsEditingProfile(false);
        await loadAllData();
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) {
      setError(err.message || (isPatientRTL ? "پروفائل محفوظ نہیں ہو سکی۔" : "Failed to save profile."));
    }
  };

  // Reset all filters in Find Doctors
  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterCity('All');
    setFilterSpecialty('All');
    setFilterArea('');
    setFilterFeeTier('all');
    setFilterAvailability('all');
    setFilterGender('all');
  };

  return (
    <div 
      dir={isPatientRTL ? "rtl" : "ltr"} 
      className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col pb-20 md:pb-10 transition-colors ${
        isPatientRTL ? 'urdu-text' : 'font-sans'
      }`}
    >
      <SEOHead
        title={isPatientRTL ? 'DocCare | مریض پورٹل - ڈاکٹرز تلاش کریں اور اپائنٹمنٹ بک کریں' : 'DocCare | Patient Portal - Find Doctors & Book Appointments'}
        description={isPatientRTL ? 'پاکستان کے تصدیق شدہ اسپیشلسٹ ڈاکٹرز تلاش کریں، فیس اور دستیاب اوقات جانچیں، اور کلینک اپائنٹمنٹ بک کریں۔' : 'DocCare Patient Portal - Discover top verified doctors across Pakistan, view public qualifications and consultation fees, and schedule clinic visits instantly.'}
        lang={patientLang}
      />

      {/* ========================================== */}
      {/* 1. TOP PATIENT HEADER & NAVIGATION BAR    */}
      {/* ========================================== */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Portal Badge */}
          <div 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none"
            onClick={() => setActiveTab('home')}
          >
            <DocCareLogo variant="compact" size="sm" showTagline={false} animated={true} />
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
            <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 flex items-center gap-1.5 uppercase tracking-wide">
              <Heart className="w-3.5 h-3.5 text-teal-600 fill-teal-600" />
              <span>{tPatient('patientPortal')}</span>
            </span>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'home'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>{tPatient('homeTab')}</span>
            </button>

            <button
              onClick={() => setActiveTab('find-doctors')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'find-doctors'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>{tPatient('findDoctorsTab')}</span>
            </button>

            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 relative ${
                activeTab === 'appointments'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{tPatient('appointmentsTab')}</span>
              {upcomingAppointments.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {upcomingAppointments.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'profile'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{tPatient('profileTab')}</span>
            </button>
          </nav>

          {/* Right Header Actions: Urdu/English Toggle & Sign Out */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher Pill */}
            <button
              onClick={togglePatientLanguage}
              className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 font-bold text-xs hover:bg-teal-100 transition-all flex items-center gap-1.5 shadow-xs"
              title="Switch English / اردو"
            >
              <Languages className="w-3.5 h-3.5 text-teal-600" />
              <span>{patientLang === 'en' ? 'اردو' : 'English'}</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={() => logout()}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1.5"
              title={tPatient('signOut')}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tPatient('signOut')}</span>
            </button>
          </div>

        </div>
      </header>

      {/* ========================================== */}
      {/* 2. GLOBAL NOTIFICATIONS                    */}
      {/* ========================================== */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-3">
        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-xs font-semibold text-teal-800 dark:text-teal-200 flex items-center justify-between gap-2 shadow-xs animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)}><X className="w-4 h-4 text-teal-600" /></button>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-800 dark:text-rose-200 flex items-center justify-between gap-2 shadow-xs animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)}><X className="w-4 h-4 text-rose-600" /></button>
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* 3. MAIN PORTAL CONTENT BY TAB             */}
      {/* ========================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
        
        {/* Loading Spinner */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mb-3" />
            <p className="text-xs font-semibold text-slate-500">
              {isPatientRTL ? "ڈاکٹرز کا ڈیٹا لوڈ ہو رہا ہے..." : "Loading doctor catalog..."}
            </p>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 1: HOME (Hero Search, Near You, Specialties, Featured) */}
        {/* ---------------------------------------------------- */}
        {!loading && activeTab === 'home' && (
          <div className="space-y-6 sm:space-y-8 animate-fade-in">
            
            {/* 1A. Hero Search Banner */}
            <div className="rounded-3xl bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white p-6 sm:p-10 shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-10 -top-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 text-xs font-bold border border-teal-400/30 backdrop-blur-sm">
                  <Shield className="w-3.5 h-3.5 text-teal-300" />
                  <span>{tPatient('verifiedBadge')}</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                  {tPatient('findHeader')}
                </h1>
                <p className="text-teal-100 text-xs sm:text-sm font-normal max-w-2xl">
                  {tPatient('findSubtitle')}
                </p>

                {/* Instant Search Bar */}
                <form 
                  onSubmit={handleHeroSearch} 
                  className="mt-6 bg-white dark:bg-slate-800 p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center gap-2 text-slate-800 dark:text-white"
                >
                  <div className="w-full sm:flex-1 flex items-center gap-2.5 px-3 py-1.5">
                    <Search className="w-4 h-4 text-teal-600 shrink-0" />
                    <input
                      type="text"
                      placeholder={isPatientRTL ? "ڈاکٹر کا نام، اسپیشلٹی یا کلینک تلاش کریں..." : "Search doctor name, specialty, or clinic..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold focus:outline-none placeholder-slate-400 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className={`w-full sm:w-auto flex items-center gap-2 px-3 py-1.5 ${isPatientRTL ? 'sm:border-r' : 'sm:border-l'} border-slate-200 dark:border-slate-700`}>
                    <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                    <select
                      value={filterCity}
                      onChange={(e) => setFilterCity(e.target.value)}
                      className="w-full sm:w-36 bg-transparent text-xs sm:text-sm font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
                    >
                      <option value="All">{tPatient('allCities')}</option>
                      {citiesList.map(c => (
                        <option key={c.name} value={c.name}>
                          {isPatientRTL ? (CITY_URDU_MAP[c.name] || c.name) : c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 rounded-xl sm:rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>{tPatient('findDoctor')}</span>
                  </button>
                </form>
              </div>
            </div>

            {/* 1B. Upcoming Appointment Reminder Banner (If any) */}
            {upcomingAppointments.length > 0 && (
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-850 border border-blue-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <CalendarCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                        {isPatientRTL ? "آپ کی اگلی اپائنٹمنٹ" : "Your Upcoming Visit"}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        #{upcomingAppointments[0].id}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1">
                      {upcomingAppointments[0].doctor_name} • {upcomingAppointments[0].date} ({upcomingAppointments[0].start_time})
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{upcomingAppointments[0].clinic_name} • {upcomingAppointments[0].city || 'Lahore'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewingAppointment(upcomingAppointments[0])}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    {isPatientRTL ? "تفصیلات دیکھیں" : "View Details"}
                  </button>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${upcomingAppointments[0].clinic_name} ${upcomingAppointments[0].city || 'Lahore'}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <Navigation className="w-3.5 h-3.5 text-teal-600" />
                    <span>{tPatient('getDirections')}</span>
                  </a>
                </div>
              </div>
            )}

            {/* 1C. "Find Doctors Near You" City Pills */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <span>{tPatient('findNearYou')}</span>
                </h2>
                <button
                  onClick={() => { setFilterCity('All'); setActiveTab('find-doctors'); }}
                  className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  <span>{isPatientRTL ? "تمام دیکھیں" : "View All"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {POPULAR_CITIES.map(c => (
                  <button
                    key={c.name}
                    onClick={() => handleQuickCityClick(c.name)}
                    className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 hover:bg-teal-50 dark:hover:bg-teal-950/50 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 shrink-0 transition-all hover:border-teal-300 dark:hover:border-teal-700 shadow-xs flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    <span>{isPatientRTL ? c.urdu : c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 1D. "Popular Specialties" Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  <span>{tPatient('popularSpecialties')}</span>
                </h2>
                <button
                  onClick={() => { setFilterSpecialty('All'); setActiveTab('find-doctors'); }}
                  className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  <span>{isPatientRTL ? "تمام شعبے" : "All Specialties"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {POPULAR_SPECIALTIES_GRID.map((s, idx) => {
                  const IconComp = s.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleQuickSpecialtyClick(s.name)}
                      className="group bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 text-left transition-all hover:shadow-md flex flex-col justify-between space-y-3 active:scale-[0.98]"
                    >
                      <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">
                          {isPatientRTL ? (SPECIALTY_URDU_MAP[s.name] || s.name) : s.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          {isPatientRTL ? "ماہرین دستیاب ہیں" : s.count}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 1E. "Available Verified Doctors" Cards Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {tPatient('availableDoctors')}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isPatientRTL ? "تصدیق شدہ کلینک فیس اور دستیاب اوقات کے ساتھ فوری بکنگ" : "Instant online booking with public consultation fees and schedules"}
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('find-doctors')}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 font-bold text-xs border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition-all flex items-center gap-1"
                >
                  <span>{isPatientRTL ? "تمام ڈاکٹرز" : "Browse All"}</span>
                  <ArrowRight className={`w-3.5 h-3.5 ${isPatientRTL ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctorsList.slice(0, 6).map(doc => (
                  <div
                    key={doc.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Doctor Top Row: Avatar & Badges */}
                      <div className="flex items-start gap-3.5">
                        <img
                          src={doc.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(doc.name)}`}
                          alt={doc.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[10px] font-extrabold border border-teal-200 dark:border-teal-800 mb-1">
                            <CheckCircle2 className="w-3 h-3 text-teal-600" />
                            <span>{tPatient('verifiedPmdc')}</span>
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                            {doc.name}
                          </h3>
                          <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold truncate">
                            {isPatientRTL ? (SPECIALTY_URDU_MAP[doc.specialization] || doc.specialization) : doc.specialization}
                          </p>
                        </div>
                      </div>

                      {/* Doctor Qualifications & Clinic Details */}
                      <div className="mt-3.5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl">
                        {doc.qualifications && (
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            🎓 {doc.qualifications}
                          </p>
                        )}
                        <p className="flex items-center gap-1.5 truncate">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{doc.clinicName} • {doc.city}</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-teal-700 dark:text-teal-300 font-bold">
                          <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{doc.nextAvailable || "Mon-Fri • 05:00 PM - 09:00 PM"}</span>
                        </p>
                      </div>

                      {/* Fee Highlight */}
                      <div className="flex items-center justify-between mt-3 px-1 text-xs">
                        <span className="text-slate-500">{tPatient('consultationFee')}:</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          Rs. {doc.consultationFee ? Number(doc.consultationFee).toLocaleString() : '2,000'}
                        </span>
                      </div>
                    </div>

                    {/* CTAs */}
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => setSelectedDoctorForProfile(doc)}
                        className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all text-center"
                      >
                        {tPatient('viewProfile')}
                      </button>

                      <button
                        onClick={() => handleOpenBooking(doc)}
                        className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white text-xs font-bold transition-all text-center shadow-xs"
                      >
                        {tPatient('bookNow')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 1F. Patient Privacy & Value Proposition Guarantee */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-teal-600/30 border border-teal-500/40 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {isPatientRTL ? "ڈاک کئیر پرائیویسی گارنٹی" : "DocCare Patient Privacy Guarantee"}
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xl">
                    {tPatient('privacyGuarantee')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-400" /> 100% Free Booking</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-400" /> PMDC Doctors</span>
              </div>
            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: FIND DOCTORS (Comprehensive Search & Filters) */}
        {/* ---------------------------------------------------- */}
        {!loading && activeTab === 'find-doctors' && (
          <div className="space-y-5 animate-fade-in">
            
            {/* 2A. Search & Filter Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row items-stretch gap-3">
                
                {/* Search Text Input */}
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={isPatientRTL ? "ڈاکٹر کا نام، اسپیشلٹی، کلینک یا علاقہ تلاش کریں..." : "Search doctor name, specialty, clinic, or area..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* City Dropdown */}
                <div className="w-full md:w-44">
                  <select
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                  >
                    <option value="All">{tPatient('allCities')}</option>
                    {citiesList.map(c => (
                      <option key={c.name} value={c.name}>
                        {isPatientRTL ? (CITY_URDU_MAP[c.name] || c.name) : c.name} ({c.doctorCount || ''})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Specialty Dropdown */}
                <div className="w-full md:w-52">
                  <select
                    value={filterSpecialty}
                    onChange={(e) => setFilterSpecialty(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                  >
                    <option value="All">{tPatient('allSpecialties')}</option>
                    {specialtiesList.map(s => (
                      <option key={s.name} value={s.name}>
                        {isPatientRTL ? (SPECIALTY_URDU_MAP[s.name] || s.name) : s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Toggle Advanced Filters Button */}
                <button
                  type="button"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`px-4 py-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    showAdvancedFilters || filterFeeTier !== 'all' || filterAvailability !== 'all' || filterGender !== 'all' || filterArea
                      ? 'bg-teal-50 dark:bg-teal-950 border-teal-300 dark:border-teal-700 text-teal-800 dark:text-teal-200'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4 text-teal-600" />
                  <span>{isPatientRTL ? "مزید فلٹرز" : "Filters"}</span>
                </button>
              </div>

              {/* 2B. Advanced Filters Collapsible */}
              {showAdvancedFilters && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-in">
                  {/* Area Input */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      {isPatientRTL ? "علاقہ / ایریا" : "Area / Neighborhood"}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Gulberg, DHA, F-7, Clifton"
                      value={filterArea}
                      onChange={(e) => setFilterArea(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  {/* Consultation Fee Tiers */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      {tPatient('consultationFee')}
                    </label>
                    <select
                      value={filterFeeTier}
                      onChange={(e) => setFilterFeeTier(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                    >
                      <option value="all">{isPatientRTL ? "تمام فیس" : "All Fees"}</option>
                      <option value="under1500">{isPatientRTL ? "۱۵۰۰ سے کم" : "Under Rs. 1,500"}</option>
                      <option value="1500to3000">{isPatientRTL ? "۱۵۰۰ تا ۳۰۰۰ روپے" : "Rs. 1,500 - 3,000"}</option>
                      <option value="above3000">{isPatientRTL ? "۳۰۰۰ سے زائد" : "Rs. 3,000+"}</option>
                    </select>
                  </div>

                  {/* Availability */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      {isPatientRTL ? "دستیابی" : "Availability"}
                    </label>
                    <select
                      value={filterAvailability}
                      onChange={(e) => setFilterAvailability(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                    >
                      <option value="all">{isPatientRTL ? "کسی بھی دن" : "Any Day"}</option>
                      <option value="today">{isPatientRTL ? "آج دستیاب" : "Available Today"}</option>
                      <option value="tomorrow">{isPatientRTL ? "کل دستیاب" : "Available Tomorrow"}</option>
                    </select>
                  </div>

                  {/* Doctor Gender */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      {isPatientRTL ? "ڈاکٹر کی جنس" : "Doctor Gender"}
                    </label>
                    <select
                      value={filterGender}
                      onChange={(e) => setFilterGender(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                    >
                      <option value="all">{isPatientRTL ? "تمام" : "All"}</option>
                      <option value="male">{isPatientRTL ? "مرد ڈاکٹر" : "Male Doctor"}</option>
                      <option value="female">{isPatientRTL ? "خاتون ڈاکٹر" : "Female Doctor"}</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* 2C. Results Counter & Active Filters Summary */}
            <div className="flex items-center justify-between px-1">
              <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                {isPatientRTL 
                  ? `${filteredDoctors.length} تصدیق شدہ ڈاکٹرز دستیاب ہیں`
                  : `Showing ${filteredDoctors.length} Verified Doctors`
                }
                {filterCity !== 'All' && <span className="text-teal-600 ml-1">in {filterCity}</span>}
              </p>

              {(searchQuery || filterCity !== 'All' || filterSpecialty !== 'All' || filterArea || filterFeeTier !== 'all' || filterAvailability !== 'all' || filterGender !== 'all') && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  {isPatientRTL ? "فلٹرز ختم کریں" : "Reset Filters"}
                </button>
              )}
            </div>

            {/* 2D. Doctors Cards List */}
            {filteredDoctors.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <Search className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isPatientRTL ? "کوئی ڈاکٹر نہیں ملا" : "No Doctors Found"}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {isPatientRTL 
                    ? "آپ کے منتخب کردہ فلٹرز کے مطابق کوئی نتیجہ نہیں ملا۔ براہ کرم فلٹرز تبدیل کر کے دیکھیں۔"
                    : "No doctors matched your search criteria. Try adjusting your city or specialty filter."}
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs"
                >
                  {isPatientRTL ? "تمام ڈاکٹرز دکھائیں" : "View All Doctors"}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDoctors.map(doc => {
                  const googleMapsUrl = `https://maps.google.com/?q=${encodeURIComponent(`${doc.clinicName} ${doc.address || ''} ${doc.city}`)}`;
                  const whatsappPhone = (doc.phone || '').replace(/[^0-9]/g, '');
                  const whatsappUrl = `https://wa.me/${whatsappPhone.startsWith('0') ? '92' + whatsappPhone.slice(1) : (whatsappPhone.startsWith('92') ? whatsappPhone : '923001234567')}?text=${encodeURIComponent(`Hello Dr. ${doc.name}, I would like to inquire about consultation at ${doc.clinicName} via DocCare.`)}`;

                  return (
                    <div
                      key={doc.id}
                      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                    >
                      <div>
                        {/* Header: Photo, Name, PMDC, Specialty */}
                        <div className="flex items-start gap-4">
                          <img
                            src={doc.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(doc.name)}`}
                            alt={doc.name}
                            className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap mb-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[10px] font-extrabold border border-teal-200 dark:border-teal-800">
                                <CheckCircle2 className="w-3 h-3 text-teal-600" />
                                <span>{doc.pmdcNumber ? `PMDC: ${doc.pmdcNumber}` : tPatient('verifiedPmdc')}</span>
                              </span>
                              {doc.experienceYears && (
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                                  {doc.experienceYears}+ {tPatient('experienceYears')}
                                </span>
                              )}
                            </div>

                            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                              {doc.name}
                            </h3>
                            <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold truncate">
                              {isPatientRTL ? (SPECIALTY_URDU_MAP[doc.specialization] || doc.specialization) : doc.specialization}
                            </p>
                            {doc.qualifications && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                                {doc.qualifications}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Clinic Location & Available Schedule Box */}
                        <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 space-y-2 text-xs">
                          <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                            <Building className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white">{doc.clinicName}</span>
                              <p className="text-[11px] text-slate-500">{doc.address || doc.city}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-bold">
                            <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                            <span>{doc.nextAvailable || "Mon-Fri • 05:00 PM - 09:00 PM"}</span>
                          </div>
                        </div>

                        {/* Fee & Actions Row */}
                        <div className="flex items-center justify-between mt-3 px-1">
                          <span className="text-xs text-slate-500 font-medium">{tPatient('consultationFee')}:</span>
                          <span className="text-sm font-black text-slate-900 dark:text-white">
                            Rs. {doc.consultationFee ? Number(doc.consultationFee).toLocaleString() : '2,000'}
                          </span>
                        </div>
                      </div>

                      {/* Contact Actions (Call, WhatsApp, Get Directions) + Booking */}
                      <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                        {/* Secondary Contact Action Pills */}
                        <div className="flex items-center gap-2">
                          {doc.phone && (
                            <a
                              href={`tel:${doc.phone}`}
                              className="flex-1 py-1.5 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5"
                            >
                              <Phone className="w-3.5 h-3.5 text-teal-600" />
                              <span>{tPatient('callDoctor')}</span>
                            </a>
                          )}

                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-1.5 px-2 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{tPatient('whatsappDoctor')}</span>
                          </a>

                          <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-1.5 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5"
                          >
                            <Navigation className="w-3.5 h-3.5 text-blue-600" />
                            <span>{tPatient('getDirections')}</span>
                          </a>
                        </div>

                        {/* Primary CTAs */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedDoctorForProfile(doc)}
                            className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all text-center"
                          >
                            {tPatient('viewProfile')}
                          </button>

                          <button
                            onClick={() => handleOpenBooking(doc)}
                            className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white text-xs font-bold transition-all text-center shadow-xs flex items-center justify-center gap-1.5"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{tPatient('bookNow')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: APPOINTMENTS (Own Patient Appointments Only)  */}
        {/* ---------------------------------------------------- */}
        {!loading && activeTab === 'appointments' && (
          <div className="space-y-5 animate-fade-in">
            
            {/* Sub-tab Navigation (Upcoming vs Past) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAppointmentSubTab('upcoming')}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                    appointmentSubTab === 'upcoming'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>{tPatient('upcomingAppointments')} ({upcomingAppointments.length})</span>
                </button>

                <button
                  onClick={() => setAppointmentSubTab('past')}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                    appointmentSubTab === 'past'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>{tPatient('pastAppointments')} ({pastAppointments.length})</span>
                </button>
              </div>

              {/* Status Filter Pill */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400">Status:</span>
                <select
                  value={appointmentStatusFilter}
                  onChange={(e) => setAppointmentStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Appointment Cards List */}
            {displayedAppointments.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {appointmentSubTab === 'upcoming' 
                    ? tPatient('noAppointmentsTitle')
                    : (isPatientRTL ? "کوئی سابقہ اپائنٹمنٹ نہیں ہے" : "No Past Appointments")}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {appointmentSubTab === 'upcoming' 
                    ? tPatient('noAppointmentsDesc')
                    : (isPatientRTL ? "آپ کی مکمل یا منسوخ شدہ ملاقاتیں یہاں نظر آئیں گی۔" : "Your completed and past consultation history will appear here.")}
                </p>
                <button
                  onClick={() => setActiveTab('find-doctors')}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs"
                >
                  {tPatient('findDoctor')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedAppointments.map(apt => {
                  const isUpcoming = apt.status === 'confirmed' || apt.status === 'pending';
                  const googleMapsUrl = `https://maps.google.com/?q=${encodeURIComponent(`${apt.clinic_name} ${apt.city || 'Lahore'}`)}`;

                  return (
                    <div
                      key={apt.id}
                      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                    >
                      <div>
                        {/* Header: Doctor & Status Badge */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={apt.doctor_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(apt.doctor_name)}`}
                              alt={apt.doctor_name}
                              className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                            <div>
                              <span className="font-mono text-[10px] text-slate-400 font-bold">
                                <bdi>#{apt.id}</bdi>
                              </span>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                {apt.doctor_name}
                              </h4>
                              <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
                                {isPatientRTL ? (SPECIALTY_URDU_MAP[apt.doctor_specialty] || apt.doctor_specialty) : apt.doctor_specialty}
                              </p>
                            </div>
                          </div>

                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            apt.status === 'confirmed' ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300' :
                            apt.status === 'pending' ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300' :
                            apt.status === 'completed' ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {apt.status === 'confirmed' ? tPatient('statusConfirmed') :
                             apt.status === 'pending' ? tPatient('statusPending') :
                             apt.status === 'completed' ? tPatient('statusCompleted') :
                             tPatient('statusCancelled')}
                          </span>
                        </div>

                        {/* Clinic & Timing Information */}
                        <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 space-y-1.5 text-xs">
                          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold">
                            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{apt.clinic_name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-bold">
                            <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span>{apt.date} • {apt.start_time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{isPatientRTL ? (CITY_URDU_MAP[apt.city] || apt.city) : (apt.city || 'Lahore')}</span>
                          </div>
                          {apt.notes && (
                            <p className="pt-1 text-[11px] text-slate-500 italic">
                              "{apt.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewingAppointment(apt)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold transition-all"
                          >
                            {isPatientRTL ? "تفصیلات دیکھیں" : "View Receipt"}
                          </button>

                          <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600 dark:text-slate-300 font-bold transition-all flex items-center"
                            title={tPatient('getDirections')}
                          >
                            <Navigation className="w-3.5 h-3.5 text-blue-600" />
                          </a>
                        </div>

                        {isUpcoming && (
                          <button
                            onClick={() => setCancelModal({ isOpen: true, appointmentId: apt.id, reason: '', cancelling: false })}
                            className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold transition-colors"
                          >
                            {tPatient('cancelAppointment')}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 4: PROFILE (Patient Info & Privacy Guarantee)     */}
        {/* ---------------------------------------------------- */}
        {!loading && activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            
            {/* 4A. Profile Details Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-black text-lg flex items-center justify-center">
                    {(profileForm.name || user?.name || 'P').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {profileForm.name || user?.name || 'Patient Account'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {profileForm.email || user?.email || 'patient@doccare.pk'}
                    </p>
                  </div>
                </div>

                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-100 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{tPatient('editProfile')}</span>
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {tPatient('patientName')} *
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      />
                      <RomanUrduInputAssist
                        value={profileForm.name}
                        onApply={(val) => setProfileForm({ ...profileForm, nameUrdu: val })}
                        isUrduMode={isPatientRTL}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {tPatient('patientNameUrdu')}
                      </label>
                      <input
                        type="text"
                        placeholder="مثلاً محمد علی"
                        value={profileForm.nameUrdu}
                        onChange={(e) => setProfileForm({ ...profileForm, nameUrdu: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 urdu-text"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {tPatient('mobileNumber')}
                      </label>
                      <input
                        type="text"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {tPatient('patientAge')}
                      </label>
                      <input
                        type="number"
                        value={profileForm.age}
                        onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {tPatient('patientGender')}
                      </label>
                      <select
                        value={profileForm.gender}
                        onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      >
                        <option value="Male">{tPatient('male')}</option>
                        <option value="Female">{tPatient('female')}</option>
                        <option value="Other">{tPatient('other')}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isPatientRTL ? "شہر" : "City"}
                    </label>
                    <select
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    >
                      {citiesList.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2 pt-3">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>{tPatient('saveHealthProfile')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                    >
                      {tPatient('cancel')}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-slate-500">{tPatient('patientName')}:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {profileForm.name || user?.name}
                        {profileForm.nameUrdu && <span className="mr-2 text-teal-600 urdu-text">({profileForm.nameUrdu})</span>}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-slate-500">Email:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{profileForm.email || user?.email}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-slate-500">{tPatient('mobileNumber')}:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white"><bdi>{profileForm.phone || user?.phone || "0300-1234567"}</bdi></span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">{isPatientRTL ? "عمر و جنس:" : "Age & Gender:"}</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        <bdi>{profileForm.age}</bdi> {isPatientRTL ? "سال" : "yrs"} • {profileForm.gender}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4B. Strict Privacy Separation Notice */}
            <div className="p-5 rounded-3xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-600" />
                <h4 className="text-xs font-bold text-teal-900 dark:text-teal-200">
                  {isPatientRTL ? "مکمل پرائیویسی اور تصدیق کی ضمانت" : "Strict Patient Privacy Guarantee"}
                </h4>
              </div>
              <p className="text-[11px] text-teal-800 dark:text-teal-300 leading-relaxed">
                {tPatient('privacyGuarantee')}
              </p>
            </div>

            {/* 4C. Logout */}
            <div className="text-center pt-2">
              <button
                onClick={() => logout()}
                className="px-6 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition-colors inline-flex items-center gap-2 border border-rose-200"
              >
                <LogOut className="w-4 h-4" />
                <span>{tPatient('signOut')}</span>
              </button>
            </div>

          </div>
        )}

      </main>

      {/* ========================================== */}
      {/* 4. MOBILE-FIRST BOTTOM NAVIGATION BAR     */}
      {/* ========================================== */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 md:hidden flex items-center justify-around py-2 px-1 shadow-lg">
        <button
          onClick={() => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'home'
              ? 'text-teal-600 dark:text-teal-400 font-black'
              : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">{tPatient('homeTab')}</span>
        </button>

        <button
          onClick={() => { setActiveTab('find-doctors'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'find-doctors'
              ? 'text-teal-600 dark:text-teal-400 font-black'
              : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px]">{tPatient('findDoctorsTab')}</span>
        </button>

        <button
          onClick={() => { setActiveTab('appointments'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative ${
            activeTab === 'appointments'
              ? 'text-teal-600 dark:text-teal-400 font-black'
              : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <div className="relative">
            <Calendar className="w-5 h-5" />
            {upcomingAppointments.length > 0 && (
              <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                {upcomingAppointments.length}
              </span>
            )}
          </div>
          <span className="text-[10px]">{tPatient('appointmentsTab')}</span>
        </button>

        <button
          onClick={() => { setActiveTab('profile'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'profile'
              ? 'text-teal-600 dark:text-teal-400 font-black'
              : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">{tPatient('profileTab')}</span>
        </button>
      </nav>

      {/* ========================================== */}
      {/* 5. IN-APP PUBLIC DOCTOR PROFILE MODAL     */}
      {/* ========================================== */}
      {selectedDoctorForProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div 
            dir={isPatientRTL ? "rtl" : "ltr"}
            className="bg-white dark:bg-slate-900 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <img
                  src={selectedDoctorForProfile.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedDoctorForProfile.name)}`}
                  alt={selectedDoctorForProfile.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[10px] font-extrabold border border-teal-200 dark:border-teal-800 mb-1">
                    <CheckCircle2 className="w-3 h-3 text-teal-600" />
                    <span>{selectedDoctorForProfile.pmdcNumber ? `PMDC: ${selectedDoctorForProfile.pmdcNumber}` : tPatient('verifiedPmdc')}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedDoctorForProfile.name}
                  </h3>
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
                    {isPatientRTL ? (SPECIALTY_URDU_MAP[selectedDoctorForProfile.specialization] || selectedDoctorForProfile.specialization) : selectedDoctorForProfile.specialization}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDoctorForProfile(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Doctor Info Sections */}
            <div className="space-y-3 text-xs">
              {selectedDoctorForProfile.qualifications && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{tPatient('qualifications')}:</span>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">{selectedDoctorForProfile.qualifications}</p>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedDoctorForProfile.clinicName}</span>
                </div>
                <p className="text-slate-500 pl-6">{selectedDoctorForProfile.address || selectedDoctorForProfile.city}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850">
                  <span className="text-slate-400">{tPatient('consultationFee')}</span>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                    Rs. {selectedDoctorForProfile.consultationFee ? Number(selectedDoctorForProfile.consultationFee).toLocaleString() : '2,000'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850">
                  <span className="text-slate-400">{tPatient('availableTimings')}</span>
                  <p className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-0.5">
                    {selectedDoctorForProfile.nextAvailable || "Mon-Fri • 05:00 PM - 09:00 PM"}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(`${selectedDoctorForProfile.clinicName} ${selectedDoctorForProfile.address || ''} ${selectedDoctorForProfile.city}`)}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Navigation className="w-4 h-4 text-blue-600" />
                <span>{tPatient('getDirections')}</span>
              </a>

              <button
                onClick={() => {
                  const doc = selectedDoctorForProfile;
                  setSelectedDoctorForProfile(null);
                  handleOpenBooking(doc);
                }}
                className="flex-1 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white text-xs font-extrabold shadow-md flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>{tPatient('bookNow')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 6. IN-APP APPOINTMENT BOOKING WIZARD MODAL */}
      {/* ========================================== */}
      {bookingModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div 
            dir={isPatientRTL ? "rtl" : "ltr"}
            className="bg-white dark:bg-slate-900 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 uppercase tracking-wider">
                  {bookingModal.step === 1 ? tPatient('step1') : (bookingModal.step === 2 ? tPatient('step3') : tPatient('bookingSuccess'))}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {bookingModal.doctor?.name}
                </h3>
                <p className="text-xs text-teal-600 font-semibold">
                  {bookingModal.doctor?.clinicName} • {bookingModal.doctor?.city}
                </p>
              </div>

              <button
                onClick={() => setBookingModal(prev => ({ ...prev, isOpen: false }))}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error in modal */}
            {bookingModal.errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-700 dark:text-rose-300">
                {bookingModal.errorMessage}
              </div>
            )}

            {/* STEP 1: DATE & TIME SLOTS */}
            {bookingModal.step === 1 && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {tPatient('availableDates')} *
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingModal.selectedDate}
                    onChange={(e) => handleBookingDateChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {tPatient('availableTimes')} *
                  </label>

                  {bookingModal.loadingSlots ? (
                    <div className="p-6 text-center">
                      <RefreshCw className="w-5 h-5 text-teal-600 animate-spin mx-auto mb-1" />
                      <p className="text-[11px] text-slate-400">{isPatientRTL ? "دستیاب اوقات جانچے جا رہے ہیں..." : "Fetching available slots..."}</p>
                    </div>
                  ) : (bookingModal.slotsData?.available === false && bookingModal.slotsData?.isAvailableDay === false) || !bookingModal.slotsData?.slots?.length ? (
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-center font-medium">
                      {bookingModal.slotsData?.message || bookingModal.slotsData?.reason || (isPatientRTL ? "اس تاریخ کو ڈاکٹر دستیاب نہیں ہیں۔ براہ کرم کوئی اور تاریخ منتخب کریں۔" : "Doctor is not available on this date. Please select another date.")}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto p-1 custom-scrollbar">
                      {bookingModal.slotsData.slots.map((slotObj, idx) => {
                        const slotStr = typeof slotObj === 'string' ? slotObj : (slotObj.slot || slotObj.startTime);
                        const displayTime = typeof slotObj === 'string' ? slotObj : slotObj.startTime;
                        const isAvailable = typeof slotObj === 'string' ? true : (slotObj.available !== false && slotObj.isAvailable !== false);
                        const isSelected = bookingModal.selectedSlot === slotStr || bookingModal.selectedSlot === displayTime;

                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => setBookingModal(prev => ({ ...prev, selectedSlot: slotStr, errorMessage: '' }))}
                            className={`py-2.5 px-2 rounded-xl text-center font-bold text-xs transition-all border ${
                              !isAvailable
                                ? 'bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 cursor-not-allowed line-through'
                                : isSelected
                                ? 'bg-teal-600 text-white border-teal-600 shadow-md ring-2 ring-teal-600/30'
                                : 'bg-teal-50/50 dark:bg-teal-950/30 text-slate-800 dark:text-slate-200 border-teal-100 dark:border-teal-900/60 hover:bg-teal-600 hover:text-white hover:border-teal-600'
                            }`}
                          >
                            <span className="block">{displayTime}</span>
                            {typeof slotObj === 'object' && slotObj.slot && slotObj.slot !== displayTime && (
                              <span className="block text-[10px] font-normal opacity-80 mt-0.5">{slotObj.slot}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-3">
                  <button
                    type="button"
                    disabled={!bookingModal.selectedSlot}
                    onClick={() => setBookingModal(prev => ({ ...prev, step: 2 }))}
                    className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>{isPatientRTL ? "آگے بڑھیں" : "Continue to Patient Info"}</span>
                    <ArrowRight className={`w-4 h-4 ${isPatientRTL ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: PATIENT DETAILS */}
            {bookingModal.step === 2 && (
              <form onSubmit={handleConfirmBooking} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {tPatient('patientName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingModal.patientName}
                    onChange={(e) => setBookingModal(prev => ({ ...prev, patientName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tPatient('mobileNumber')} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="0300-1234567"
                      value={bookingModal.patientPhone}
                      onChange={(e) => setBookingModal(prev => ({ ...prev, patientPhone: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={bookingModal.patientEmail}
                      onChange={(e) => setBookingModal(prev => ({ ...prev, patientEmail: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {tPatient('reasonForVisit')}
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Routine checkup, blood pressure review, chest pain"
                    value={bookingModal.reason}
                    onChange={(e) => setBookingModal(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 resize-none"
                  />
                </div>

                {/* Summary box */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                  <p><strong>{isPatientRTL ? "تاریخ و وقت: " : "Date & Time: "}</strong> {bookingModal.selectedDate} • {bookingModal.selectedSlot}</p>
                  <p><strong>{tPatient('consultationFee')}:</strong> Rs. {bookingModal.doctor?.consultationFee ? Number(bookingModal.doctor.consultationFee).toLocaleString() : '2,000'}</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setBookingModal(prev => ({ ...prev, step: 1 }))}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                  >
                    {isPatientRTL ? "پیچھے" : "Back"}
                  </button>

                  <button
                    type="submit"
                    disabled={bookingModal.submitting}
                    className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2"
                  >
                    {bookingModal.submitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{tPatient('confirmBooking')}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: SUCCESS CONFIRMATION */}
            {bookingModal.step === 3 && (
              <div className="space-y-4 text-center py-2 animate-fade-in text-xs">
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {tPatient('bookingSuccess')}
                  </h4>
                  <p className="text-slate-500 mt-1">
                    {tPatient('bookingSubtitle')}
                  </p>
                </div>

                <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-850 text-left space-y-2 border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-400">{tPatient('appointmentRef')}:</span>
                    <span className="font-mono font-black text-teal-600">#{bookingModal.confirmedAppointment?.id || 'APT-CONFIRMED'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-400">Doctor:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{bookingModal.doctor?.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-400">Date & Time:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{bookingModal.selectedDate} • {bookingModal.selectedSlot}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Clinic:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{bookingModal.doctor?.clinicName}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBookingModal(prev => ({ ...prev, isOpen: false }));
                      setActiveTab('appointments');
                    }}
                    className="flex-1 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md"
                  >
                    {isPatientRTL ? "میری اپائنٹمنٹس میں دیکھیں" : "View in My Appointments"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 7. APPOINTMENT DETAILS / RECEIPT MODAL    */}
      {/* ========================================== */}
      {viewingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div 
            dir={isPatientRTL ? "rtl" : "ltr"}
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 uppercase tracking-wider">
                  {tPatient('appointmentReceipt')}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  #{viewingAppointment.id}
                </h3>
              </div>
              <button
                onClick={() => setViewingAppointment(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Doctor:</span>
                <span className="font-bold text-slate-900 dark:text-white">{viewingAppointment.doctor_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Specialty:</span>
                <span className="font-semibold text-teal-600">{viewingAppointment.doctor_specialty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Clinic:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{viewingAppointment.clinic_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-bold text-slate-900 dark:text-white">{viewingAppointment.date} • {viewingAppointment.start_time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold uppercase text-emerald-600">{viewingAppointment.status}</span>
              </div>
              {viewingAppointment.notes && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Notes:</span>
                  <p className="italic text-slate-700 dark:text-slate-300">{viewingAppointment.notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(`${viewingAppointment.clinic_name} ${viewingAppointment.city || 'Lahore'}`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                <span>{tPatient('getDirections')}</span>
              </a>

              {(viewingAppointment.status === 'confirmed' || viewingAppointment.status === 'pending') && (
                <button
                  onClick={() => {
                    const aptId = viewingAppointment.id;
                    setViewingAppointment(null);
                    setCancelModal({ isOpen: true, appointmentId: aptId, reason: '', cancelling: false });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs"
                >
                  {tPatient('cancelAppointment')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 8. CANCEL APPOINTMENT CONFIRMATION MODAL   */}
      {/* ========================================== */}
      {cancelModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div 
            dir={isPatientRTL ? "rtl" : "ltr"}
            className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3"
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {tPatient('cancelModalTitle')}
            </h3>
            <p className="text-xs text-slate-500">
              {tPatient('cancelModalDesc')}
            </p>

            <textarea
              rows={2}
              placeholder={tPatient('cancelReasonPlaceholder')}
              value={cancelModal.reason}
              onChange={(e) => setCancelModal({ ...cancelModal, reason: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 resize-none focus:outline-none"
            />

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModal({ isOpen: false, appointmentId: null, reason: '', cancelling: false })}
                className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                {tPatient('keepAppointment')}
              </button>
              <button
                type="button"
                disabled={cancelModal.cancelling}
                onClick={handleCancelAppointment}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs disabled:opacity-50"
              >
                {cancelModal.cancelling ? <RefreshCw className="w-3.5 h-3.5 animate-spin mx-auto" /> : tPatient('confirmCancellation')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
