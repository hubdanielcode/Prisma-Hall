import { expect, fn, userEvent, within } from "storybook/test";
import { fakePickupOrders } from "@/storybook/mocks/hooks/pickup/usePickup";
import { PickupOrderCard } from "./PickupOrderCard";
import type { PickupBlockReason } from "../types/pickupOrder";

export default {
  title: "Layouts/Admin/Pickup Management/Cards",
  component: PickupOrderCard,
  parameters: {
    layout: "padded",
  },
};

const [confirmedOrder, pendingOrder, cancelledOrder, pickedUpOrder] = fakePickupOrders;

/* - Retirada registrada com sucesso, depois da confirmação explícita - */

const registerPickup = fn(async () => true as const);

const Confirmed = () => (
  <PickupOrderCard
    onRegister={registerPickup}
    order={confirmedOrder}
  />
);

Confirmed.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);

  // 1. Clicar uma vez só pede a confirmação; nada é registrado ainda

  await userEvent.click(canvas.getByRole("button", { name: "Registrar retirada" }));
  await expect(registerPickup).not.toHaveBeenCalled();
  await expect(canvas.getByText(/Confirmar a retirada do pedido/)).toBeVisible();

  // 2. Só a confirmação registra, uma única vez

  await userEvent.click(canvas.getByRole("button", { name: "Confirmar retirada" }));
  await expect(registerPickup).toHaveBeenCalledTimes(1);
  await expect(await canvas.findByText("Retirada registrada com sucesso.")).toBeVisible();
  await expect(canvas.queryByRole("button", { name: "Registrar retirada" })).toBeNull();
};

/* - Retirada duplicada: o servidor recusa porque outra retirada foi registrada no meio do caminho - */

const duplicatePickup = fn(async (): Promise<PickupBlockReason> => "already_picked_up");

const DuplicatePickup = () => (
  <PickupOrderCard
    onRegister={duplicatePickup}
    order={confirmedOrder}
  />
);

DuplicatePickup.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);

  await userEvent.click(canvas.getByRole("button", { name: "Registrar retirada" }));
  await userEvent.click(canvas.getByRole("button", { name: "Confirmar retirada" }));

  await expect(await canvas.findByText("A retirada deste pedido já foi registrada.")).toBeVisible();
  await expect(canvas.queryByText("Retirada registrada com sucesso.")).toBeNull();
};

/* - Pedido que já foi retirado - */

const AlreadyPickedUp = () => (
  <PickupOrderCard
    onRegister={fn(async () => true as const)}
    order={pickedUpOrder}
  />
);

AlreadyPickedUp.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);

  await expect(canvas.getByText("A retirada deste pedido já foi registrada.")).toBeVisible();
  await expect(canvas.queryByRole("button", { name: "Registrar retirada" })).toBeNull();
};

/* - Pagamento pendente: não há botão de retirada - */

const PendingPayment = () => (
  <PickupOrderCard
    onRegister={fn(async () => true as const)}
    order={pendingOrder}
  />
);

PendingPayment.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);

  await expect(canvas.getByText(/Pagamento pendente: a retirada só é liberada/)).toBeVisible();
  await expect(canvas.queryByRole("button", { name: "Registrar retirada" })).toBeNull();
};

/* - Pedido cancelado: não há botão de retirada - */

const CancelledOrder = () => (
  <PickupOrderCard
    onRegister={fn(async () => true as const)}
    order={cancelledOrder}
  />
);

CancelledOrder.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);

  await expect(canvas.getByText("Pedido cancelado: a retirada não pode ser registrada.")).toBeVisible();
  await expect(canvas.queryByRole("button", { name: "Registrar retirada" })).toBeNull();
};

export {
  AlreadyPickedUp as "Already Picked Up",
  CancelledOrder as "Cancelled Order",
  Confirmed as "Confirmed Order",
  DuplicatePickup as "Duplicate Pickup",
  PendingPayment as "Pending Payment",
};
