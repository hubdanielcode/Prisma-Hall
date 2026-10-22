/* - Admin - */

// 1.  Analytics Management

export { voucherIncomeSchema } from "./admin/analytics-management/voucherIncomeSchema";
export { ticketIncomeSchema } from "./admin/analytics-management/ticketIncomeSchema";
export { newVisitorsSchema } from "./admin/analytics-management/newVisitorsSchema";

// 2. Bar Management

export { createProductSchema } from "./admin/bar-management/createProductSchema";
export { editProductSchema } from "./admin/bar-management/editProductSchema";

// 3. Events Management

export { cancelEventIdSchema } from "./admin/events-management/cancelEventSchema";
export { createAttractionSchema } from "./admin/events-management/createAttractionSchema";
export { createEventSchema } from "./admin/events-management/createEventSchema";
export { editAttractionSchema } from "./admin/events-management/editAttractionSchema";
export { editEventSchema } from "./admin/events-management/editEventSchema";

// 4. Users Management

export { badgeLevelSchema } from "./admin/user-management/badgeLevelSchema";
export { editUserSchema } from "./admin/user-management/editUserSchema";
export { getAllUsersSchema } from "./admin/user-management/getAllUsersSchema";
export { userSchema } from "./admin/user-management/userSchema";

/* - Authentication - */

export { passwordResetSchema } from "./authentication/passwordResetSchema";
export { requestPasswordResetSchema } from "./authentication/requestPasswordResetSchema";
export { signInSchema } from "./authentication/signInSchema";
export { signUpSchema } from "./authentication/signUpSchema";

/* - Cart - */

export { cartItemIdSchema } from "./cart/cartItemIdSchema";
export { cartItemSchema } from "./cart/cartItemSchema";
export { paymentMethodSchema } from "./cart/paymentMethodSchema";
export { stripeCheckoutSchema } from "./cart/stripeCheckoutSchema";
export { updateCartItemSchema } from "./cart/updateCartItemSchema";

/* - Events - */

export { createReviewSchema } from "./events/createReviewSchema";
export { favoriteEventIdSchema } from "./events/favoriteEventSchema";
export { getAllReviewsSchema } from "./events/getAllReviewsSchema";
export { reviewIdSchema } from "./events/reviewIdSchema";
export { updateReviewSchema } from "./events/updateReviewSchema";

/* - Newsletter - */

export { newsletterSchema } from "./newsletter/newsletterSchema";

/* - Shared - */

export { categorySchema } from "./shared/categorySchema";
export { imageFileSchema } from "./shared/imageFileSchema";
export { periodSchema } from "./shared/periodSchema";
export { tagFilterSchema } from "./shared/tagFilterSchema";
export { tagSchema } from "./shared/tagSchema";

/* - Users - */

export { buyTicketsSchema } from "./users/buyTicketsSchema";
export { buyVouchersSchema } from "./users/buyVouchersSchema";
export { newProfileSchema } from "./users/newProfileSchema";
export { notificationIdSchema } from "./users/notificationIdSchema";
export { notificationPreferencesSchema } from "./users/notificationPreferencesSchema";
export { orderIdSchema } from "./users/orderIdSchema";
export { profileSchema } from "./users/profileSchema";
export { updateNotificationPreferencesSchema } from "./users/updateNotificationPreferencesSchema";
export { updateProfileSchema } from "./users/updateProfileSchema";
export { userIdSchema } from "./users/userIdSchema";
