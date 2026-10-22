/* - Admin - */

export { checkIsAdmin } from "./admin/checkIsAdmin";

// 1.  Analytics Management

export { getNewVisitors } from "./admin/analytics-management/getNewVisitors";
export { getTicketIncome } from "./admin/analytics-management/getTicketIncome";
export { getVoucherIncome } from "./admin/analytics-management/getVoucherIncome";

// 2. Bar Management

export { createProduct } from "./admin/bar-management/createProduct";
export { deleteProduct } from "./admin/bar-management/deleteProduct";
export { editProduct } from "./admin/bar-management/editProduct";
export { getAllProductsAdmins } from "./admin/bar-management/getAllProductsAdmins";

// 3. Events Management

export { cancelEvent } from "./admin/events-management/cancelEvent";
export { createAttraction } from "./admin/events-management/createAttraction";
export { createEvent } from "./admin/events-management/createEvent";
export { deleteAttraction } from "./admin/events-management/deleteAttraction";
export { deleteEvent } from "./admin/events-management/deleteEvent";
export { editAttraction } from "./admin/events-management/editAttraction";
export { editEvent } from "./admin/events-management/editEvent";

// 4. Users Management

export { deleteUser } from "./admin/users-management/deleteUser";
export { editUser } from "./admin/users-management/editUser";
export { getAllUsers } from "./admin/users-management/getAllUsers";
export { getSingleUser } from "./admin/users-management/getSingleUser";

/* - Authentication - */

export { passwordReset } from "./authentication/passwordReset";
export { requestPasswordReset } from "./authentication/requestPasswordReset";
export { signIn } from "./authentication/signIn";
export { signUp } from "./authentication/signUp";

/* - Bar - */

export { getAllProductsUsers } from "./bar/getAllProductsUsers";
export { getSingleProduct } from "./bar/getSingleProduct";

/* - Cart - */

export { addItemToCart } from "./cart/addItemToCart";
export { checkoutCart } from "./cart/checkoutCart";
export { clearCart } from "./cart/clearCart";
export { getCartItems } from "./cart/getCartItems";
export { removeItemFromCart } from "./cart/removeItemFromCart";
export { updateItemQuantity } from "./cart/updateItemQuantity";

/* - Events - */

// 1. Agenda

export { getAllAttractions } from "./events/agenda/getAllAttractions";
export { getAllEvents } from "./events/agenda/getAllEvents";

// 2. Event

export { getSingleAttraction } from "./events/event/getSingleAttraction";
export { getSingleEvent } from "./events/event/getSingleEvent";

// 3. Gallery

export { getEventPictures } from "./events/gallery/getEventPictures";
export { likeEventPicture } from "./events/gallery/likeEventPicture";

// 4. Reviews

export { deleteReview } from "./events/reviews/deleteReview";
export { getAllReviews } from "./events/reviews/getAllReviews";
export { postReview } from "./events/reviews/postReview";
export { updateReview } from "./events/reviews/updateReview";

// 5. Favorites

export { favoriteEvent } from "./events/event/favoriteEvent";
export { getFavoriteEvents } from "./events/event/getFavoriteEvents";

/* - Newsletter - */

export { subscribeToNewsletter } from "./newsletter/subscribeToNewsletter";
export { getMySubscription } from "./newsletter/getMySubscription";

/* - Payments - */

export { createStripeCheckoutSession } from "./payments/createStripeCheckoutSession";

/* - Session - */

export { revokeSession } from "./authentication/revokeSession";
export { validateSession } from "./authentication/validateSession";

/* - Users - */

// 1. Notifications

export { getMyNotifications } from "./users/notifications/getMyNotifications";
export { getNotificationPreferences } from "./users/notifications/getNotificationPreferences";
export { markAllNotificationsAsRead } from "./users/notifications/markAllNotificationsAsRead";
export { markSingleNotificationAsRead } from "./users/notifications/markSingleNotificationAsRead";
export { updateNotificationPreferences } from "./users/notifications/updateNotificationPreferences";

// 2. Profile

export { deleteProfile } from "./users/profile/deleteProfile";
export { getProfile } from "./users/profile/getProfile";
export { updateProfile } from "./users/profile/updateProfile";

// 3. Tickets

export { buyTickets } from "./users/tickets/buyTickets";
export { cancelTicketOrder } from "./users/tickets/cancelTicketOrder";
export { getMyTickets } from "./users/tickets/getMyTickets";
export { getTicketOrder } from "./users/tickets/getTicketOrder";

// 4. User

export { getShoppingHistory } from "./users/user/getShoppingHistory";

// 5. Vouchers

export { buyVouchers } from "./users/vouchers/buyVouchers";
export { cancelVoucherOrder } from "./users/vouchers/cancelVoucherOrder";
export { getMyVouchers } from "./users/vouchers/getMyVouchers";
export { getVoucherOrder } from "./users/vouchers/getVoucherOrder";
