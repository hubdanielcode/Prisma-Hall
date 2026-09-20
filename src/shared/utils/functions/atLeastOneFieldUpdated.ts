const atLeastOneFieldUpdated = <Type extends object>(value: Type) => {
  return Object.values(value).some((item) => {
    if (item !== undefined) {
      return true;
    } else {
      return false;
    }
  });
};

export { atLeastOneFieldUpdated };
