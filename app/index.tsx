import { Redirect } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';

export default function Index() {
  const onboardingCompleted = useAppStore((s) => s.settings.onboardingCompleted);
  return <Redirect href={onboardingCompleted ? '/(tabs)/today' : '/onboarding'} />;
}
