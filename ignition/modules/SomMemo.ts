import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SOMNIA_PRECOMPILE_ADDRESS = "0x0000000000000000000000000000000000000100";
const SomMemoModule = buildModule("SomMemoModule", (m) => {

  const somMemo = m.contract("SomMemo", [SOMNIA_PRECOMPILE_ADDRESS]);
  return { somMemo };
});

export default SomMemoModule;
