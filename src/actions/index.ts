/* - Admin - */

export { checkIsAdmin } from "@/actions/admin/checkIsAdmin";

// 1.  Analytics Management

export { getNewVisitors } from "@/actions/admin/analytics-management/getNewVisitors";
export { getTicketIncome } from "@/actions/admin/analytics-management/getTicketIncome";
export { getVoucherIncome } from "@/actions/admin/analytics-management/getVoucherIncome";

// 2. Bar Management

export { createProduct } from "@/actions/admin/bar-management/createProduct";
export { deleteProduct } from "@/actions/admin/bar-management/deleteProduct";
export { editProduct } from "@/actions/admin/bar-management/editProduct";

// 3. Events Management

export { createAttraction } from "@/actions/admin/events-management/createAttraction";
export { deleteAttraction } from "@/actions/admin/events-management/deleteAttraction";
export { editAttraction } from "@/actions/admin/events-management/editAttraction";

export { createEvent } from "@/actions/admin/events-management/createEvent";
export { deleteEvent } from "@/actions/admin/events-management/deleteEvent";
export { editEvent } from "@/actions/admin/events-management/editEvent";

// 4. Users Management

export { deleteUser } from "@/actions/admin/users-management/deleteUser";
export { editUser } from "@/actions/admin/users-management/editUser";
export { getAllUsers } from "@/actions/admin/users-management/getAllUsers";
export { getSingleUser } from "@/actions/admin/users-management/getSingleUser";

/* - Authentication - */

export { passwordReset } from "@/actions/authentication/passwordReset";
export { requestPasswordReset } from "@/actions/authentication/requestPasswordReset";
export { signIn } from "@/actions/authentication/signIn";
export { signUp } from "@/actions/authentication/signUp";

/* - Bar - */

export { getAllProducts } from "@/actions/bar/getAllProducts";
export { getSingleProduct } from "@/actions/bar/getSingleProduct";

/* - Cart - */

// export { addItemToCart } from "@/actions/cart/addItemToCart";
// export { getCartItems } from "@/actions/cart/getCartItems";
// export { removeItemFromCart } from "@/actions/cart/removeItemFromCart";
// export { updateItemQuantity } from "@/actions/cart/updateItemQuantity";

/* - Events - */

// 1. Agenda

export { getAllAttractions } from "@/actions/events/agenda/getAllAttractions";
export { getAllEvents } from "@/actions/events/agenda/getAllEvents";

// 2. Event

export { getSingleAttraction } from "@/actions/events/event/getSingleAttraction";
export { getSingleEvent } from "@/actions/events/event/getSingleEvent";

// 3. Gallery

// export { getEventPicture } from "@/actions/events/gallery/getEventPictures";
// export { likeEventPicture } from "@/actions/events/gallery/likeEventPictures";

// 4. Reviews

// export { deleteReview } from "@/actions/events/reviews/deleteReview";
// export { postReview } from "@/actions/events/reviews/postReview";
// export { updateReview } from "@/actions/events/reviews/updateReview";

/* - Session - */

export { createSession } from "@/actions/session/createSession";
export { revokeSession } from "@/actions/session/revokeSession";
export { validateSession } from "@/actions/session/validateSession";

/* - Users - */

export { getShoppingHistory } from "@/actions/users/getShoppingHistory";

// 1. Profile

export { deleteProfile } from "@/actions/users/profile/deleteProfile";
export { getProfile } from "@/actions/users/profile/getProfile";
export { updateProfile } from "@/actions/users/profile/updateProfile";

// 2. Tickets

export { buyTickets } from "@/actions/users/tickets/buyTickets";
export { cancelTicketOrder } from "@/actions/users/tickets/cancelTicketOrder";
export { getMyTickets } from "@/actions/users/tickets/getMyTickets";
export { getTicketOrder } from "@/actions/users/tickets/getTicketOrder";

// 3. Vouchers

export { buyVouchers } from "@/actions/users/vouchers/buyVouchers";
export { cancelVoucherOrder } from "@/actions/users/vouchers/cancelVoucherOrder";
export { getMyVouchers } from "@/actions/users/vouchers/getMyVouchers";
export { getVoucherOrder } from "@/actions/users/vouchers/getVoucherOrder";
