import { CustomPasswordInput } from "./CustomPasswordInput";

export default {
  title: "Components/Shared/Inputs",
  component: CustomPasswordInput,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
};

const myPasswordInput = () => {
  return (
    <CustomPasswordInput
      label="Sua Senha"
      placeholder="•••••••"
      value="•••••••"
      onChange={() => {}}
      maxLength={50}
    />
  );
};

export { myPasswordInput as "Custom Password Input" };
