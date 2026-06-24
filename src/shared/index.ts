/* - Components - */

export { CustomPasswordInput } from "@/shared/components/CustomPasswordInput";
export { CustomTextInput } from "@/shared/components/CustomTextInput";
export { Footer } from "@/shared/components/Footer";
export { Header } from "@/shared/components/Header";
export { HeroSection } from "@/shared/components/HeroSection";
export { BarSection } from "@/features/bar/components/BarSection";

/* - Context - */

export { MobileContext, MobileProvider } from "@/shared/context/MobileContext";
export { ThemeContext, ThemeProvider } from "@/shared/context/ThemeContext";

/* - Hooks - */

export { useMobileContext } from "@/shared/hooks/UseMobileContext";
export { useThemeContext } from "@/shared/hooks/useThemeContext";

/* - Pages - */

// 1. General Pages

export { MainContent } from "@/shared/pages/MainContent";
export { Missing } from "@/shared/pages/Missing";

// 2. Footer Links Pages

export { About } from "@/shared/pages/footer-links/About";
export { FrequentlyAskedQuestions } from "@/shared/pages/footer-links/FrequentlyAskedQuestions";
export { HelpingCentral } from "@/shared/pages/footer-links/HelpingCentral";
export { PrivacyPolicy } from "@/shared/pages/footer-links/PrivacyPolicy";
export { TermsOfUse } from "@/shared/pages/footer-links/TermsOfUse";

/* - Utils - */

export { parsedDate, formattedDate } from "@/shared/utils/dates";
export { masks } from "@/shared/utils/masks";
export { photos, photosCategories } from "@/shared/utils/photos";
export { regex } from "@/shared/utils/regex";
export { rotatingImages } from "@/shared/utils/rotatingImages";
export { getTheme, saveTheme, applyTheme } from "@/shared/utils/theme";
