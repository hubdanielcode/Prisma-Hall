import { fn } from "storybook/test";

const useNewsletter = () => ({
  isSubscribed: false,
  isLoading: false,
  error: null,
  isSubscribing: false,
  subscribeToNewsletterMutation: fn(async () => true),
});

export { useNewsletter };
