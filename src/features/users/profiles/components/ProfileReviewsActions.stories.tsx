import { expect, fn, userEvent, within } from "storybook/test";
import { fakeReview } from "@/storybook/mocks/hooks/events/reviews/useReviews";
import { ProfileReviewsActions } from "./ProfileReviewsActions";

export default {
  title: "Layouts/Protected/Profile/Actions",
  component: ProfileReviewsActions,
  parameters: {
    layout: "fullscreen",
  },
};

/* - Container padrão das variações - */

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="flex bg-[#1A1A1A] text-white font-semibold min-h-screen p-10">{children}</div>
);

/* - Avaliação criada agora: o botão de editar aparece e some sozinho depois do prazo - */

const onEditWithinWindow = fn();
const onDeleteWithinWindow = fn();

const WithinEditWindow = () => {
  const freshReview = { ...fakeReview, createdAt: new Date().toISOString() };

  return (
    <Wrapper>
      <ProfileReviewsActions
        review={freshReview}
        onEdit={onEditWithinWindow}
        onDelete={onDeleteWithinWindow}
      />
    </Wrapper>
  );
};

WithinEditWindow.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);

  await expect(canvas.getByRole("button", { name: /Editar Avaliação/ })).toBeVisible();
  await expect(canvas.getByRole("button", { name: /Excluir Avaliação/ })).toBeVisible();

  await userEvent.click(canvas.getByRole("button", { name: /Editar Avaliação/ }));
  await expect(onEditWithinWindow).toHaveBeenCalledTimes(1);

  await userEvent.click(canvas.getByRole("button", { name: /Excluir Avaliação/ }));
  await expect(onDeleteWithinWindow).toHaveBeenCalledTimes(1);
};

/* - Prazo vencido: só o botão de excluir aparece - */

const onDeleteExpired = fn();

const EditWindowExpired = () => {
  const oldReview = { ...fakeReview, createdAt: new Date("2020-01-01").toISOString() };

  return (
    <Wrapper>
      <ProfileReviewsActions
        review={oldReview}
        onEdit={fn()}
        onDelete={onDeleteExpired}
      />
    </Wrapper>
  );
};

EditWindowExpired.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);

  await expect(canvas.queryByRole("button", { name: /Editar Avaliação/ })).toBeNull();
  await expect(canvas.getByRole("button", { name: /Excluir Avaliação/ })).toBeVisible();

  await userEvent.click(canvas.getByRole("button", { name: /Excluir Avaliação/ }));
  await expect(onDeleteExpired).toHaveBeenCalledTimes(1);
};

export { EditWindowExpired as "Profile Review Actions (Without Edit) ", WithinEditWindow as "Profile Review Actions (With Edit)" };
