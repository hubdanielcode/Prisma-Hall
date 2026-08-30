/* - Admin - */

// 1.  Analytics

export { barIncomeSchema } from "@/lib/validations/admin/analytics-management/barIncomeSchema";
export { ticketIncomeSchema } from "@/lib/validations/admin/analytics-management/ticketIncomeSchema";

// 2. Bar

export { createProductSchema } from "@/lib/validations/admin/bar-management/createProductSchema";
export { editProductSchema } from "@/lib/validations/admin/bar-management/editProductSchema";

// 3. Events

export { createEventSchema } from "@/lib/validations/admin/events-management/createEventSchema";
export { editEventSchema } from "@/lib/validations/admin/events-management/editEventSchema";

// 4. Users

export { editUserSchema } from "@/lib/validations/admin/user-management/editUserSchema";

/* - Authentication - */

export {
  resetPasswordSchema,
  resetPasswordRequestSchema,
} from "@/lib/validations/authentication/resetPasswordSchemas";
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
