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
    <div className="[&>div>span:first-child]:text-white/60">
      <CustomPasswordInput
        label="Sua Senha"
        placeholder="•••••••"
        value="•••••••"
        onChange={() => {}}
        maxLength={50}
      />
    </div>
  );
};

export { myPasswordInput as "Custom Password Input" };
