import fs from 'node:fs';
import solc from 'solc';

export function compileRegistry() {
  const source = fs.readFileSync('contracts/DiagnosticProofRegistry.sol', 'utf8');
  const input = { language: 'Solidity', sources: { 'DiagnosticProofRegistry.sol': { content: source } }, settings: { optimizer: { enabled: true, runs: 200 }, evmVersion: 'paris', outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object', 'evm.deployedBytecode.object'] } } } };
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const errors = (output.errors || []).filter((e) => e.severity === 'error');
  if (errors.length) throw new Error(errors.map((e) => e.formattedMessage).join('\n'));
  const contract = output.contracts['DiagnosticProofRegistry.sol'].DiagnosticProofRegistry;
  return { compiler: solc.version(), abi: contract.abi, bytecode: `0x${contract.evm.bytecode.object}`, deployedBytecode: `0x${contract.evm.deployedBytecode.object}` };
}

if (process.argv[1]?.endsWith('compile-registry.mjs')) {
  fs.mkdirSync('deployment', { recursive: true });
  const artifact = compileRegistry();
  fs.writeFileSync('deployment/registry-artifact.json', JSON.stringify(artifact, null, 2) + '\n');
  console.log(`Compiled DiagnosticProofRegistry with solc ${artifact.compiler} (EVM paris)`);
}
