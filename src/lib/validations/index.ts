/* - Admin - */

// 1.  Analytics Management

export { voucherIncomeSchema } from "@/lib/validations/admin/analytics-management/voucherIncomeSchema";
export { ticketIncomeSchema } from "@/lib/validations/admin/analytics-management/ticketIncomeSchema";
export { newVisitorsSchema } from "@/lib/validations/admin/analytics-management/newVisitorsSchema";

// 2. Bar Management

export { createProductSchema } from "@/lib/validations/admin/bar-management/createProductSchema";
export { editProductSchema } from "@/lib/validations/admin/bar-management/editProductSchema";

// 3. Events Management

export { cancelEventIdSchema } from "@/lib/validations/admin/events-management/cancelEventSchema";
export { createAttractionSchema } from "@/lib/validations/admin/events-management/createAttractionSchema";
export { createEventSchema } from "@/lib/validations/admin/events-management/createEventSchema";
export { editAttractionSchema } from "@/lib/validations/admin/events-management/editAttractionSchema";
export { editEventSchema } from "@/lib/validations/admin/events-management/editEventSchema";

// 4. Users Management

export { badgeLevelSchema } from "@/lib/validations/admin/user-management/badgeLevelSchema";
export { editUserSchema } from "@/lib/validations/admin/user-management/editUserSchema";
export { userSchema } from "@/lib/validations/admin/user-management/userSchema";

/* - Authentication - */

export { passwordResetSchema } from "@/lib/validations/authentication/passwordResetSchema";
export { requestPasswordResetSchema } from "@/lib/validations/authentication/requestPasswordResetSchema";
export { signInSchema } from "@/lib/validations/authentication/signInSchema";
export { signUpSchema } from "@/lib/validations/authentication/signUpSchema";

/* - Cart - */

export { cartItemIdSchema } from "@/lib/validations/cart/cartItemIdSchema";
export { cartItemSchema } from "@/lib/validations/cart/cartItemSchema";
export { paymentMethodSchema } from "@/lib/validations/cart/paymentMethodSchema";
export { updateCartItemSchema } from "@/lib/validations/cart/updateCartItemSchema";

/* - Events - */

export { createReviewSchema } from "@/lib/validations/events/createReviewSchema";
export { favoriteEventIdSchema } from "@/lib/validations/events/favoriteEventSchema";
export { updateReviewSchema } from "@/lib/validations/events/updateReviewSchema";

/* - Newsletter - */

export { newsletterSchema } from "@/lib/validations/newsletter/newsletterSchema";

/* - Payments - */

export { stripeCheckoutSchema } from "@/lib/validations/payments/stripeCheckoutSchema";

/* - Shared - */

export { categorySchema } from "@/lib/validations/shared/categorySchema";
export { imageFileSchema } from "@/lib/validations/shared/imageFileSchema";
export { periodSchema } from "@/lib/validations/shared/periodSchema";
export { tagFilterSchema } from "@/lib/validations/shared/tagFilterSchema";
export { tagSchema } from "@/lib/validations/shared/tagSchema";

/* - Users - */

export { buyTicketsSchema } from "@/lib/validations/users/buyTicketsSchema";
export { buyVouchersSchema } from "@/lib/validations/users/buyVouchersSchema";
export { newProfileSchema } from "@/lib/validations/users/newProfileSchema";
export { notificationIdSchema } from "@/lib/validations/users/notificationIdSchema";
export { notificationPreferencesSchema } from "@/lib/validations/users/notificationPreferencesSchema";
export { orderIdSchema } from "@/lib/validations/users/orderIdSchema";
export { profileSchema } from "@/lib/validations/users/profileSchema";
export { updateNotificationPreferencesSchema } from "@/lib/validations/users/updateNotificationPreferencesSchema";
export { updateProfileSchema } from "@/lib/validations/users/updateProfileSchema";
