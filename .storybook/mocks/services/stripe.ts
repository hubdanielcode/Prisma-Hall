const stripe = {
  checkout: {
    sessions: {
      create: async () => ({
        id: "fakeCheckoutSession",
        url: "https://checkout.com/fakeCheckoutSession",
      }),
      list: async (): Promise<{ data: unknown[] }> => ({ data: [] }),
    },
  },

  paymentIntents: {
    create: async (): Promise<{ id: string }> => ({ id: "fakePaymentIntentId" }),
  },

  refunds: {
    search: async () => ({ id: "fakeRefundId" }),
  },

  webhooks: {
    constructEvent: () => ({}),
  },
};

export { stripe };
