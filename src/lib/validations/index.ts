/* - Admin - */

// 1.  Analytics Management

export { voucherIncomeSchema } from "@/lib/validations/admin/analytics-management/voucherIncomeSchema";
export { ticketIncomeSchema } from "@/lib/validations/admin/analytics-management/ticketIncomeSchema";
export { newVisitorsSchema } from "@/lib/validations/admin/analytics-management/newVisitorsSchema";

// 2. Bar Management

export { createProductSchema } from "@/lib/validations/admin/bar-management/createProductSchema";
export { editProductSchema } from "@/lib/validations/admin/bar-management/editProductSchema";

// 3. Events Management

export { createAttractionSchema } from "@/lib/validations/admin/events-management/createAttractionSchema";
export { createEventSchema } from "@/lib/validations/admin/events-management/createEventSchema";
export { editAttractionSchema } from "@/lib/validations/admin/events-management/editAttractionSchema";
export { editEventSchema } from "@/lib/validations/admin/events-management/editEventSchema";

// 4. Users Management

export { editUserSchema } from "@/lib/validations/admin/user-management/editUserSchema";

/* - Authentication - */

export { resetPasswordSchema, resetPasswordRequestSchema } from "@/lib/validations/authentication/resetPasswordSchemas";
export { signInSchema } from "@/lib/validations/authentication/signInSchema";
export { signUpSchema } from "@/lib/validations/authentication/signUpSchema";

/* - Cart - */

export { cartItemSchema } from "@/lib/validations/cart/cartItemSchema";

/* - Events - */

export { createReviewSchema } from "@/lib/validations/events/createReviewSchema";
export { updateReviewSchema } from "@/lib/validations/events/updateReviewSchema";

/* - Users - */

export { buyTicketsSchema } from "@/lib/validations/users/buyTicketsSchema";
export { profileSchema } from "@/lib/validations/users/profileSchema";
export { updateProfileSchema } from "@/lib/validations/users/updateProfileSchema";

/* - Shared - */

export { imageFileSchema } from "@/lib/validations/shared/imageFileSchema";
export { periodSchema } from "@/lib/validations/shared/periodSchema";
export { tagSchema } from "@/lib/validations/shared/tagSchema";
