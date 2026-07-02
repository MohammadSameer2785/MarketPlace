import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  'en': {
    // Common
    'loading': 'Loading...',
    'error': 'Error',
    'save': 'Save',
    'cancel': 'Cancel',
    'edit': 'Edit',
    'delete': 'Delete',
    'add': 'Add',
    'search': 'Search',
    'filter': 'Filter',
    'submit': 'Submit',
    'back': 'Back',
    'next': 'Next',
    'previous': 'Previous',
    
    // Navigation
    'home': 'Home',
    'marketplace': 'Marketplace',
    'dashboard': 'Dashboard',
    'login': 'Login',
    'register': 'Register',
    'logout': 'Logout',
    
    // Registration
    'createAccount': 'Create Your Account',
    'fullName': 'Full Name',
    'emailAddress': 'Email Address',
    'phoneNumber': 'Phone Number',
    'password': 'Password',
    'confirmPassword': 'Confirm Password',
    'selectRole': 'I want to register as:',
    'farmer': 'Farmer',
    'consumer': 'Consumer',
    'sellCrops': 'Sell your crops',
    'buyCrops': 'Buy fresh crops',
    'addressInfo': 'Address Information',
    'state': 'State',
    'district': 'District',
    'village': 'Village/City',
    'pincode': 'Pincode',
    'voiceInput': 'Voice Input',
    'startVoice': 'Start voice input',
    'stopVoice': 'Stop recording',
    'listening': 'Listening...',
    'voiceNotSupported': 'Voice input not supported',
    
    // Login
    'signIn': 'Sign In to Your Account',
    'welcomeBack': 'Welcome back to AgriMarketplace',
    'rememberMe': 'Remember me',
    'forgotPassword': 'Forgot your password?',
    'noAccount': "Don't have an account?",
    'haveAccount': 'Already have an account?',
    'signUp': 'Sign up',
    'signIn': 'Sign in',
    
    // Dashboard
    'farmerDashboard': 'Farmer Dashboard',
    'consumerDashboard': 'Consumer Dashboard',
    'manageCrops': 'Manage your crops and track sales',
    'trackOrders': 'Manage your orders and track purchases',
    'totalCrops': 'Total Crops',
    'totalValue': 'Total Value',
    'totalOrders': 'Total Orders',
    'activeCrops': 'Active Crops',
    'totalSpent': 'Total Spent',
    'pendingOrders': 'Pending Orders',
    'completedOrders': 'Completed Orders',
    
    // Forms
    'cropName': 'Crop Name',
    'price': 'Price',
    'quantity': 'Quantity',
    'description': 'Description',
    'category': 'Category',
    'available': 'Available',
    'location': 'Location',
    'addNewCrop': 'Add New Crop',
    'editCrop': 'Edit Crop',
    
    // Marketplace
    'browseMarketplace': 'Browse Marketplace',
    'topDemanded': 'Top 8 Most Demanded Crops',
    'discoverTrends': 'Discover what\'s trending in your area',
    'noCropsFound': 'No crops found',
    'adjustFilters': 'Try adjusting your filters or search terms',
    'buyNow': 'Buy Now',
    'addToCart': 'Cart',
    
    // Payment
    'checkout': 'Checkout',
    'paymentDetails': 'Payment Details',
    'payViaUPI': 'Pay via UPI',
    'scanQR': 'Scan QR code with any UPI app',
    'placeOrder': 'Place Order',
    'paymentDone': 'Payment Done?',
    'confirmPayment': 'Confirm Payment',
    'orderSuccessful': 'Order Placed Successfully!',
    'paymentSuccessful': 'Payment Successful!',
    
    // Offline
    'offlineMode': 'Offline Mode',
    'noInternet': 'No Internet Connection',
    'dataSaved': 'Your data has been saved locally',
    'syncWhenOnline': 'Will sync when connection is restored',
    'syncing': 'Syncing data...',
    'syncComplete': 'Sync complete',
    'failedToSync': 'Failed to sync some data',
  },
  
  'hi': {
    // Hindi translations
    'loading': 'लोड हो रहा है...',
    'error': 'त्रुटि',
    'save': 'सहेजें',
    'cancel': 'रद्द करें',
    'edit': 'संपादित करें',
    'delete': 'हटाएं',
    'add': 'जोड़ें',
    'search': 'खोजें',
    'filter': 'फ़िल्टर',
    'submit': 'जमा करें',
    'back': 'पीछे',
    'next': 'अगला',
    'previous': 'पिछला',
    
    'home': 'होम',
    'marketplace': 'मार्केटप्लेस',
    'dashboard': 'डैशबोर्ड',
    'login': 'लॉगिन',
    'register': 'रजिस्टर',
    'logout': 'लॉगआउट',
    
    'createAccount': 'अपना खाता बनाएं',
    'fullName': 'पूरा नाम',
    'emailAddress': 'ईमेल पता',
    'phoneNumber': 'फोन नंबर',
    'password': 'पासवर्ड',
    'confirmPassword': 'पासवर्ड की पुष्टि करें',
    'selectRole': 'मैं रजिस्टर करना चाहता हूँ:',
    'farmer': 'किसान',
    'consumer': 'उपभोक्ता',
    'sellCrops': 'अपनी फसलें बेचें',
    'buyCrops': 'ताजी फसलें खरीदें',
    'addressInfo': 'पता जानकारी',
    'state': 'राज्य',
    'district': 'जिला',
    'village': 'गांव/शहर',
    'pincode': 'पिनकोड',
    'voiceInput': 'आवाज इनपुट',
    'startVoice': 'आवाज इनपुट शुरू करें',
    'stopVoice': 'रिकॉर्डिंग बंद करें',
    'listening': 'सुन रहे हैं...',
    'voiceNotSupported': 'आवाज इनपुट समर्थित नहीं है',
    
    'signIn': 'अपने खाते में साइन इन करें',
    'welcomeBack': 'एग्रीमार्केटप्लेस में आपका स्वागत है',
    'rememberMe': 'मुझे याद रखें',
    'forgotPassword': 'पासवर्ड भूल गए?',
    'noAccount': 'खाता नहीं है?',
    'haveAccount': 'पहले से ही खाता है?',
    'signUp': 'साइन अप',
    'signIn': 'साइन इन',
    
    'farmerDashboard': 'किसान डैशबोर्ड',
    'consumerDashboard': 'उपभोक्ता डैशबोर्ड',
    'manageCrops': 'अपनी फसलों का प्रबंधन करें और बिक्री ट्रैक करें',
    'trackOrders': 'अपने ऑर्डर प्रबंधित करें और खरीदारी ट्रैक करें',
    'totalCrops': 'कुल फसलें',
    'totalValue': 'कुल मूल्य',
    'totalOrders': 'कुल ऑर्डर',
    'activeCrops': 'सक्रिय फसलें',
    'totalSpent': 'कुल खर्च',
    'pendingOrders': 'लंबित ऑर्डर',
    'completedOrders': 'पूर्ण ऑर्डर',
    
    'cropName': 'फसल का नाम',
    'price': 'मूल्य',
    'quantity': 'मात्रा',
    'description': 'विवरण',
    'category': 'श्रेणी',
    'available': 'उपलब्ध',
    'location': 'स्थान',
    'addNewCrop': 'नई फसल जोड़ें',
    'editCrop': 'फसल संपादित करें',
    
    'browseMarketplace': 'मार्केटप्लेस ब्राउज़ करें',
    'topDemanded': 'शीर्ष 8 सबसे अधिक मांग वाली फसलें',
    'discoverTrends': 'अपने क्षेत्र में क्या ट्रेंड में है जानें',
    'noCropsFound': 'कोई फसल नहीं मिली',
    'adjustFilters': 'अपने फ़िल्टर या खोज शब्द समायोजित करने का प्रयास करें',
    'buyNow': 'अभी खरीदें',
    'addToCart': 'कार्ट',
    
    'checkout': 'चेकआउट',
    'paymentDetails': 'भुगतान विवरण',
    'payViaUPI': 'UPI के माध्यम से भुगतान करें',
    'scanQR': 'किसी भी UPI ऐप के साथ QR कोड स्कैन करें',
    'placeOrder': 'ऑर्डर दें',
    'paymentDone': 'भुगतान हो गया?',
    'confirmPayment': 'भुगतान की पुष्टि करें',
    'orderSuccessful': 'ऑर्डर सफलतापूर्वक दिया गया!',
    'paymentSuccessful': 'भुगतान सफल!',
    
    'offlineMode': 'ऑफलाइन मोड',
    'noInternet': 'इंटरनेट कनेक्शन नहीं',
    'dataSaved': 'आपका डेटा स्थानीय रूप से सहेजा गया है',
    'syncWhenOnline': 'कनेक्शन बहाल होने पर सिंक हो जाएगा',
    'syncing': 'डेटा सिंक हो रहा है...',
    'syncComplete': 'सिंक पूर्ण',
    'failedToSync': 'कुछ डेटा सिंक करने में विफल',
  },
  
  'bn': {
    // Bengali translations
    'loading': 'লোড হচ্ছে...',
    'error': 'ত্রুটি',
    'save': 'সংরক্ষণ করুন',
    'cancel': 'বাতিল করুন',
    'edit': 'সম্পাদনা করুন',
    'delete': 'মুছুন',
    'add': 'যোগ করুন',
    'search': 'অনুসন্ধান করুন',
    'filter': 'ফিল্টার',
    'submit': 'জমা দিন',
    'back': 'পিছনে',
    'next': 'পরবর্তী',
    'previous': 'পূর্ববর্তী',
    
    'home': 'হোম',
    'marketplace': 'মার্কেটপ্লেস',
    'dashboard': 'ড্যাশবোর্ড',
    'login': 'লগইন',
    'register': 'নিবন্ধন করুন',
    'logout': 'লগআউট',
    
    'createAccount': 'আপনার অ্যাকাউন্ট তৈরি করুন',
    'fullName': 'পূর্ণ নাম',
    'emailAddress': 'ইমেল ঠিকানা',
    'phoneNumber': 'ফোন নম্বর',
    'password': 'পাসওয়ার্ড',
    'confirmPassword': 'পাসওয়ার্ড নিশ্চিত করুন',
    'selectRole': 'আমি নিবন্ধন করতে চাই:',
    'farmer': 'কৃষক',
    'consumer': 'ভোক্তা',
    'sellCrops': 'আপনার ফসল বিক্রি করুন',
    'buyCrops': 'তাজা ফসল কিনুন',
    'addressInfo': 'ঠিকানা তথ্য',
    'state': 'রাজ্য',
    'district': 'জেলা',
    'village': 'গ্রাম/শহর',
    'pincode': 'পিনকোড',
    'voiceInput': 'ভয়েস ইনপুট',
    'startVoice': 'ভয়েস ইনপুট শুরু করুন',
    'stopVoice': 'রেকর্ডিং বন্ধ করুন',
    'listening': 'শুনছি...',
    'voiceNotSupported': 'ভয়েস ইনপুট সমর্থিত নয়',
    
    'signIn': 'আপনার অ্যাকাউন্টে সাইন ইন করুন',
    'welcomeBack': 'এগ্রিমার্কেটপ্লেসে আপনাকে স্বাগতম',
    'rememberMe': 'আমাকে মনে রাখুন',
    'forgotPassword': 'পাসওয়ার্ড ভুলে গেছেন?',
    'noAccount': 'অ্যাকাউন্ট নেই?',
    'haveAccount': 'ইতিমধ্যে অ্যাকাউন্ট আছে?',
    'signUp': 'নিবন্ধন করুন',
    'signIn': 'সাইন ইন',
    
    'farmerDashboard': 'কৃষক ড্যাশবোর্ড',
    'consumerDashboard': 'ভোক্তা ড্যাশবোর্ড',
    'manageCrops': 'আপনার ফসল পরিচালনা করুন এবং বিক্রয় ট্র্যাক করুন',
    'trackOrders': 'আপনার অর্ডার পরিচালনা করুন এবং ক্রয় ট্র্যাক করুন',
    'totalCrops': 'মোট ফসল',
    'totalValue': 'মোট মূল্য',
    'totalOrders': 'মোট অর্ডার',
    'activeCrops': 'সক্রিয় ফসল',
    'totalSpent': 'মোট ব্যয়',
    'pendingOrders': 'মুলতুবি অর্ডার',
    'completedOrders': 'সম্পন্ন অর্ডার',
    
    'cropName': 'ফসলের নাম',
    'price': 'মূল্য',
    'quantity': 'পরিমাণ',
    'description': 'বর্ণনা',
    'category': 'বিভাগ',
    'available': 'উপলব্ধ',
    'location': 'অবস্থান',
    'addNewCrop': 'নতুন ফসল যোগ করুন',
    'editCrop': 'ফসল সম্পাদনা করুন',
    
    'browseMarketplace': 'মার্কেটপ্লেস ব্রাউজ করুন',
    'topDemanded': 'শীর্ষ 8 সবচেয়ে বেশি চাহিদার ফসল',
    'discoverTrends': 'আপনার এলাকায় কী ট্রেন্ডে আছে তা আবিষ্কার করুন',
    'noCropsFound': 'কোনো ফসল পাওয়া যায়নি',
    'adjustFilters': 'আপনার ফিল্টার বা অনুসন্ধান শব্দ সামঞ্জস্য করার চেষ্টা করুন',
    'buyNow': 'এখনই কিনুন',
    'addToCart': 'কার্ট',
    
    'checkout': 'চেকআউট',
    'paymentDetails': 'পেমেন্ট বিবরণ',
    'payViaUPI': 'UPI এর মাধ্যমে পেমেন্ট করুন',
    'scanQR': 'যেকোনো UPI অ্যাপ দিয়ে QR কোড স্ক্যান করুন',
    'placeOrder': 'অর্ডার দিন',
    'paymentDone': 'পেমেন্ট হয়েছে?',
    'confirmPayment': 'পেমেন্ট নিশ্চিত করুন',
    'orderSuccessful': 'অর্ডার সফলভাবে দেওয়া হয়েছে!',
    'paymentSuccessful': 'পেমেন্ট সফল!',
    
    'offlineMode': 'অফলাইন মোড',
    'noInternet': 'ইন্টারনেট সংযোগ নেই',
    'dataSaved': 'আপনার ডেটা স্থানীয়ভাবে সংরক্ষিত হয়েছে',
    'syncWhenOnline': 'সংযোগ পুনরুদ্ধার হলে সিঙ্ক হবে',
    'syncing': 'ডেটা সিঙ্ক হচ্ছে...',
    'syncComplete': 'সিঙ্ক সম্পন্ন',
    'failedToSync': 'কিছু ডেটা সিঙ্ক করতে ব্যর্থ',
  },
  
  'te': {
    // Telugu translations
    'loading': 'లోడ్ అవుతోంది...',
    'error': 'లోపం',
    'save': 'సేవ్ చేయండి',
    'cancel': 'రద్దు చేయండి',
    'edit': 'ఎడిట్ చేయండి',
    'delete': 'తొలగించండి',
    'add': 'జోడించండి',
    'search': 'శోధించండి',
    'filter': 'ఫిల్టర్',
    'submit': 'సమర్పించండి',
    'back': 'వెనక్కి',
    'next': 'తరువాత',
    'previous': 'ముందు',
    
    'home': 'హోమ్',
    'marketplace': 'మార్కెట్‌ప్లేస్',
    'dashboard': 'డ్యాష్‌బోర్డ్',
    'login': 'లాగిన్',
    'register': 'నమోదు చేయండి',
    'logout': 'లాగ్‌అవుట్',
    
    'createAccount': 'మీ ఖాతాను సృష్టించండి',
    'fullName': 'పూర్తి పేరు',
    'emailAddress': 'ఇమెయిల్ చిరునామా',
    'phoneNumber': 'ఫోన్ నంబర్',
    'password': 'పాస్‌వర్డ్',
    'confirmPassword': 'పాస్‌వర్డ్‌ను నిర్ధారించండి',
    'selectRole': 'నేను నమోదు చేయాలనుకుంటున్నాను:',
    'farmer': 'రైతు',
    'consumer': 'వినియోగదారు',
    'sellCrops': 'మీ పంటలను అమ్మండి',
    'buyCrops': 'తాజా పంటలను కొనండి',
    'addressInfo': 'చిరునామా సమాచారం',
    'state': 'రాష్ట్రం',
    'district': 'జిల్లా',
    'village': 'గ్రామం/నగరం',
    'pincode': 'పిన్‌కోడ్',
    'voiceInput': 'వాయిస్ ఇన్‌పుట్',
    'startVoice': 'వాయిస్ ఇన్‌పుట్ ప్రారంభించండి',
    'stopVoice': 'రికార్డింగ్ ఆపండి',
    'listening': 'వింటిస్తున్నాను...',
    'voiceNotSupported': 'వాయిస్ ఇన్‌పుట్ మద్దతు లేదు',
    
    'signIn': 'మీ ఖాతాలోకి సైన్ ఇన్ చేయండి',
    'welcomeBack': 'అగ్రిమార్కెట్‌ప్లేస్‌కి మీకు స్వాగతం',
    'rememberMe': 'నన్ను గుర్తించుకోండి',
    'forgotPassword': 'పాస్‌వర్డ్ మర్చిపోయారా?',
    'noAccount': 'ఖాతా లేదా?',
    'haveAccount': 'ఇప్పటికే ఖాతా ఉందా?',
    'signUp': 'సైన్ అప్',
    'signIn': 'సైన్ ఇన్',
    
    'farmerDashboard': 'రైతు డ్యాష్‌బోర్డ్',
    'consumerDashboard': 'వినియోగదారు డ్యాష్‌బోర్డ్',
    'manageCrops': 'మీ పంటలను నిర్వహించండి మరియు అమ్మకం ట్రాక్ చేయండి',
    'trackOrders': 'మీ ఆర్డర్లను నిర్వహించండి మరియు కొనుగోళ్లను ట్రాక్ చేయండి',
    'totalCrops': 'మొత్తం పంటలు',
    'totalValue': 'మొత్తం విలువ',
    'totalOrders': 'మొత్తం ఆర్డర్లు',
    'activeCrops': 'చురుకుగా ఉన్న పంటలు',
    'totalSpent': 'మొత్తం ఖర్చు',
    'pendingOrders': 'పెండింగ్ ఆర్డర్లు',
    'completedOrders': 'పూర్తి చేసిన ఆర్డర్లు',
    
    'cropName': 'పంట పేరు',
    'price': 'ధర',
    'quantity': 'పరిమాణం',
    'description': 'వివరణ',
    'category': 'వర్గం',
    'available': 'అందుబాటులో ఉంది',
    'location': 'స్థానం',
    'addNewCrop': 'కొత్త పంటను జోడించండి',
    'editCrop': 'పంటను ఎడిట్ చేయండి',
    
    'browseMarketplace': 'మార్కెట్‌ప్లేస్‌ను బ్రౌజ్ చేయండి',
    'topDemanded': 'టాప్ 8 అత్యధిక డిమాండ్ ఉన్న పంటలు',
    'discoverTrends': 'మీ ప్రాంతంలో ట్రెండ్‌లో ఏమి ఉందో కనుగొనండి',
    'noCropsFound': 'పంటలు కనుగొనబడలేదు',
    'adjustFilters': 'మీ ఫిల్టర్‌లు లేదా శోధ పదాలను సర్దుపరచుకోవడానికి ప్రయత్నించండి',
    'buyNow': 'ఇప్పుడే కొనండి',
    'addToCart': 'కార్ట్',
    
    'checkout': 'చెకౌట్',
    'paymentDetails': 'చెల్లింపు వివరాలు',
    'payViaUPI': 'UPI ద్వారా చెల్లించండి',
    'scanQR': 'ఏదైనా UPI యాప్‌తో QR కోడ్‌ను స్కాన్ చేయండి',
    'placeOrder': 'ఆర్డర్ ఇవ్వండి',
    'paymentDone': 'చెల్లింపు అయిందా?',
    'confirmPayment': 'చెల్లింపును నిర్ధారించండి',
    'orderSuccessful': 'ఆర్డర్ విజయవంతంగా ఇవ్వబడింది!',
    'paymentSuccessful': 'చెల్లింపు విజయవంతంగా అయింది!',
    
    'offlineMode': 'ఆఫ్‌లైన్ మోడ్',
    'noInternet': 'ఇంటర్నెట్ కనెక్షన్ లేదు',
    'dataSaved': 'మీ డేటా స్థానికంగా సేవ్ చేయబడింది',
    'syncWhenOnline': 'కనెక్షన్ పునరుద్ధరించబడినప్పుడు సింక్ అవుతుంది',
    'syncing': 'డేటా సింక్ అవుతోంది...',
    'syncComplete': 'సింక్ పూర్తి',
    'failedToSync': 'కొన్ని డేటా సింక్ చేయడంలో విఫలమైంది',
  }
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(() => {
    // Get saved language or detect browser language
    const saved = localStorage.getItem('language');
    if (saved && translations[saved]) return saved;
    
    const browserLang = navigator.language.split('-')[0];
    return translations[browserLang] ? browserLang : 'en';
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const t = (key) => {
    return translations[currentLang]?.[key] || translations['en'][key] || key;
  };

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setCurrentLang(lang);
      localStorage.setItem('language', lang);
    }
  };

  const getVoiceLanguage = () => {
    const langMap = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'bn': 'bn-IN',
      'te': 'te-IN'
    };
    return langMap[currentLang] || 'en-IN';
  };

  const value = {
    currentLang,
    t,
    changeLanguage,
    isOnline,
    getVoiceLanguage,
    availableLanguages: Object.keys(translations)
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
