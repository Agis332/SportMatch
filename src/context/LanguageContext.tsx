import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'lt';

export interface Translations {
  tabs: {
    trainers: string;
    map: string;
    chats: string;
    settings: string;
  };
  settings: {
    editProfile: string;
    sections: {
      account: string;
      preferences: string;
      support: string;
      about: string;
    };
    rows: {
      editProfile: string;
      savedTrainers: string;
      myBookings: string;
      paymentMethods: string;
      notifications: string;
      privacy: string;
      language: string;
      location: string;
      darkMode: string;
      helpCenter: string;
      rateApp: string;
      contactUs: string;
      version: string;
      termsOfService: string;
      privacyPolicy: string;
    };
    logOut: string;
  };
  home: {
    search: string;
    searchPlaceholder: string;
    individual: string;
    individualSub: string;
    group: string;
    groupSub: string;
    noTrainers: string;
    selectCity: string;
    sportAll: string;
  };
  booking: {
    headerTitle: string;
    steps: {
      date: string;
      time: string;
      type: string;
      details: string;
    };
    selectDate: string;
    selectDateSub: string;
    selectTime: string;
    sessionType: string;
    sessionTypeSub: string;
    individual: string;
    individualSub: string;
    group: string;
    groupSub: string;
    groupRate: string;
    individualRate: string;
    perPerson: string;
    yourDetails: string;
    name: string;
    surname: string;
    phone: string;
    email: string;
    notes: string;
    namePlaceholder: string;
    surnamePlaceholder: string;
    phonePlaceholder: string;
    emailPlaceholder: string;
    notesPlaceholder: string;
    bookingSummary: string;
    trainer: string;
    sport: string;
    date: string;
    time: string;
    session: string;
    total: string;
    next: string;
    bookNow: string;
    booked: string;
    confirmed: string;
    sessionWith: string;
    bookedFor: string;
    at: string;
    backToHome: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    tabs: {
      trainers: 'Trainers',
      map: 'Map',
      chats: 'Chats',
      settings: 'Settings',
    },
    settings: {
      editProfile: 'Edit Profile',
      sections: {
        account: 'Account',
        preferences: 'Preferences',
        support: 'Support',
        about: 'About',
      },
      rows: {
        editProfile: 'Edit Profile',
        savedTrainers: 'Saved Trainers',
        myBookings: 'My Bookings',
        paymentMethods: 'Payment Methods',
        notifications: 'Notifications',
        privacy: 'Privacy',
        language: 'Language',
        location: 'Location',
        darkMode: 'Dark Mode',
        helpCenter: 'Help Center',
        rateApp: 'Rate App',
        contactUs: 'Contact Us',
        version: 'Version',
        termsOfService: 'Terms of Service',
        privacyPolicy: 'Privacy Policy',
      },
      logOut: 'Log Out',
    },
    home: {
      search: 'Search',
      searchPlaceholder: 'Search your trainer...',
      individual: 'Individual',
      individualSub: '1-on-1 training',
      group: 'Group',
      groupSub: '2–8 people',
      noTrainers: 'No trainers found',
      selectCity: 'Select a city',
      sportAll: 'All',
    },
    booking: {
      headerTitle: 'Book a Session',
      steps: {
        date: 'Date',
        time: 'Time',
        type: 'Type',
        details: 'Details',
      },
      selectDate: 'Select a Date',
      selectDateSub: 'Choose your preferred training day',
      selectTime: 'Select a Time',
      sessionType: 'Session Type',
      sessionTypeSub: 'How would you like to train?',
      individual: 'Individual',
      individualSub: '1-on-1 with trainer',
      group: 'Group',
      groupSub: 'Train with 2–8 people',
      groupRate: 'Group rate',
      individualRate: 'Individual rate',
      perPerson: 'per person',
      yourDetails: 'Your Details',
      name: 'Name',
      surname: 'Surname',
      phone: 'Phone',
      email: 'Email',
      notes: 'Special requests (optional)',
      namePlaceholder: 'Name',
      surnamePlaceholder: 'Surname',
      phonePlaceholder: '+370 600 00000',
      emailPlaceholder: 'your@email.com',
      notesPlaceholder: 'Anything the trainer should know...',
      bookingSummary: 'Booking Summary',
      trainer: 'Trainer',
      sport: 'Sport',
      date: 'Date',
      time: 'Time',
      session: 'Session',
      total: 'Total',
      next: 'Next  →',
      bookNow: 'Book Now',
      booked: 'booked',
      confirmed: 'Booking Confirmed!',
      sessionWith: 'Your session with',
      bookedFor: 'is booked for',
      at: 'at',
      backToHome: 'Back to Home',
    },
  },
  lt: {
    tabs: {
      trainers: 'Treneriai',
      map: 'Žemėlapis',
      chats: 'Pokalbiai',
      settings: 'Nustatymai',
    },
    settings: {
      editProfile: 'Redaguoti profilį',
      sections: {
        account: 'Paskyra',
        preferences: 'Nuostatos',
        support: 'Pagalba',
        about: 'Apie',
      },
      rows: {
        editProfile: 'Redaguoti profilį',
        savedTrainers: 'Išsaugoti treneriai',
        myBookings: 'Mano rezervacijos',
        paymentMethods: 'Mokėjimo metodai',
        notifications: 'Pranešimai',
        privacy: 'Privatumas',
        language: 'Kalba',
        location: 'Vieta',
        darkMode: 'Tamsus režimas',
        helpCenter: 'Pagalbos centras',
        rateApp: 'Įvertinti programą',
        contactUs: 'Susisiekite',
        version: 'Versija',
        termsOfService: 'Naudojimo sąlygos',
        privacyPolicy: 'Privatumo politika',
      },
      logOut: 'Atsijungti',
    },
    home: {
      search: 'Ieškoti',
      searchPlaceholder: 'Ieškokite savo trenerio...',
      individual: 'Individualus',
      individualSub: 'Vienas su vienu',
      group: 'Grupė',
      groupSub: '2–8 žmonės',
      noTrainers: 'Trenerių nerasta',
      selectCity: 'Pasirinkite miestą',
      sportAll: 'Visi',
    },
    booking: {
      headerTitle: 'Rezervuoti sesiją',
      steps: {
        date: 'Data',
        time: 'Laikas',
        type: 'Tipas',
        details: 'Duomenys',
      },
      selectDate: 'Pasirinkite datą',
      selectDateSub: 'Pasirinkite pageidaujamą treniruotės dieną',
      selectTime: 'Pasirinkite laiką',
      sessionType: 'Sesijos tipas',
      sessionTypeSub: 'Kaip norėtumėte treniruotis?',
      individual: 'Individualus',
      individualSub: 'Vienas su treneriu',
      group: 'Grupė',
      groupSub: 'Treniruotis su 2–8 žmonėmis',
      groupRate: 'Grupės kaina',
      individualRate: 'Individualios sesijos kaina',
      perPerson: 'asmeniui',
      yourDetails: 'Jūsų duomenys',
      name: 'Vardas',
      surname: 'Pavardė',
      phone: 'Telefonas',
      email: 'El. paštas',
      notes: 'Specialūs pageidavimai (neprivaloma)',
      namePlaceholder: 'Vardas',
      surnamePlaceholder: 'Pavardė',
      phonePlaceholder: '+370 600 00000',
      emailPlaceholder: 'jusu@email.com',
      notesPlaceholder: 'Ką treneris turėtų žinoti...',
      bookingSummary: 'Rezervacijos santrauka',
      trainer: 'Treneris',
      sport: 'Sportas',
      date: 'Data',
      time: 'Laikas',
      session: 'Sesija',
      total: 'Iš viso',
      next: 'Toliau  →',
      bookNow: 'Rezervuoti',
      booked: 'užimta',
      confirmed: 'Rezervacija patvirtinta!',
      sessionWith: 'Jūsų sesija su',
      bookedFor: 'rezervuota',
      at: 'val.',
      backToHome: 'Grįžti į pradžią',
    },
  },
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
