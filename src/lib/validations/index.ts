/* - Admin - */

// 1.  Analytics Management

export { voucherIncomeSchema } from "./admin/analytics-management/voucherIncomeSchema";
export { ticketIncomeSchema } from "./admin/analytics-management/ticketIncomeSchema";
export { newVisitorsSchema } from "./admin/analytics-management/newVisitorsSchema";

// 2. Bar Management

export { createProductSchema } from "./admin/bar-management/createProductSchema";
export { editProductSchema } from "./admin/bar-management/editProductSchema";

// 3. Events Management

// 3.1 Attraction

export { createAttractionSchema } from "./admin/events-management/attraction-management/createAttractionSchema";
export { editAttractionSchema } from "./admin/events-management/attraction-management/editAttractionSchema";

// 3.2 Event

export { cancelEventIdSchema } from "./admin/events-management/event-management/cancelEventSchema";
export { createEventSchema } from "./admin/events-management/event-management/createEventSchema";
export { editEventSchema } from "./admin/events-management/event-management/editEventSchema";

// 4. Users Management

export { badgeLevelSchema } from "./admin/user-management/badgeLevelSchema";
export { editUserSchema } from "./admin/user-management/editUserSchema";
export { getAllUsersSchema } from "./admin/user-management/getAllUsersSchema";
export { userSchema } from "./admin/user-management/userSchema";

// 5. Pickup Management

export { findPickupOrdersSchema } from "./admin/pickup-management/findPickupOrdersSchema";
export { registerPickupSchema } from "./admin/pickup-management/registerPickupSchema";

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

// 1. Event

export { favoriteEventIdSchema } from "./events/event/favoriteEventSchema";

// 2. Gallery

// 3. Reviews

export { createReviewSchema } from "./events/reviews/createReviewSchema";
export { getAllReviewsSchema } from "./events/reviews/getAllReviewsSchema";
export { reviewIdSchema } from "./events/reviews/reviewIdSchema";
export { updateReviewSchema } from "./events/reviews/updateReviewSchema";

/* - Newsletter - */

export { newsletterSchema } from "./newsletter/newsletterSchema";

/* - Shared - */

export { categorySchema } from "./shared/categorySchema";
export { imageFileSchema } from "./shared/imageFileSchema";
export { periodSchema } from "./shared/periodSchema";
export { tagFilterSchema } from "./shared/tagFilterSchema";
export { tagSchema } from "./shared/tagSchema";

/* - Users - */

// 1. Notification

export { notificationIdSchema } from "./users/notifications/notificationIdSchema";
export { notificationPreferencesSchema } from "./users/notifications/notificationPreferencesSchema";
export { updateNotificationPreferencesSchema } from "./users/notifications/updateNotificationPreferencesSchema";

// 2. Profile

export { newProfileSchema } from "./users/profile/newProfileSchema";
export { profileSchema } from "./users/profile/profileSchema";
export { updateProfileSchema } from "./users/profile/updateProfileSchema";

// 3. Tickets

export { buyTicketsSchema } from "./users/tickets/buyTicketsSchema";

// 4. User

export { orderIdSchema } from "./users/user/orderIdSchema";
export { userIdSchema } from "./users/user/userIdSchema";

// 5. Vouchers

export { buyVouchersSchema } from "./users/vouchers/buyVouchersSchema";
