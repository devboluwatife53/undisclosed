import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.16.0');

const _descriptor_0 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_1 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

const _descriptor_2 = new __compactRuntime.CompactTypeUnsignedInteger(1n, 1);

class _ShieldedPool_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_2.alignment()));
  }
  fromValue(value_0) {
    return {
      noteCommitment: _descriptor_0.fromValue(value_0),
      value: _descriptor_1.fromValue(value_0),
      isSpent: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.noteCommitment).concat(_descriptor_1.toValue(value_0.value).concat(_descriptor_2.toValue(value_0.isSpent)));
  }
}

const _descriptor_3 = new _ShieldedPool_0();

class _PayrollRun_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment())))));
  }
  fromValue(value_0) {
    return {
      id: _descriptor_1.fromValue(value_0),
      employer: _descriptor_0.fromValue(value_0),
      merkleRoot: _descriptor_0.fromValue(value_0),
      totalCommitted: _descriptor_1.fromValue(value_0),
      isActive: _descriptor_2.fromValue(value_0),
      isFinalized: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.id).concat(_descriptor_0.toValue(value_0.employer).concat(_descriptor_0.toValue(value_0.merkleRoot).concat(_descriptor_1.toValue(value_0.totalCommitted).concat(_descriptor_2.toValue(value_0.isActive).concat(_descriptor_2.toValue(value_0.isFinalized))))));
  }
}

const _descriptor_4 = new _PayrollRun_0();

const _descriptor_5 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);

class _MerkleProof_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment())))));
  }
  fromValue(value_0) {
    return {
      leaf: _descriptor_0.fromValue(value_0),
      path0: _descriptor_0.fromValue(value_0),
      path1: _descriptor_0.fromValue(value_0),
      path2: _descriptor_0.fromValue(value_0),
      path3: _descriptor_0.fromValue(value_0),
      indices: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.leaf).concat(_descriptor_0.toValue(value_0.path0).concat(_descriptor_0.toValue(value_0.path1).concat(_descriptor_0.toValue(value_0.path2).concat(_descriptor_0.toValue(value_0.path3).concat(_descriptor_0.toValue(value_0.indices))))));
  }
}

const _descriptor_6 = new _MerkleProof_0();

class _WithdrawalProof_0 {
  alignment() {
    return _descriptor_6.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()))));
  }
  fromValue(value_0) {
    return {
      merkleProof: _descriptor_6.fromValue(value_0),
      nullifier: _descriptor_0.fromValue(value_0),
      amount: _descriptor_0.fromValue(value_0),
      pubkey: _descriptor_0.fromValue(value_0),
      nonce: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_6.toValue(value_0.merkleProof).concat(_descriptor_0.toValue(value_0.nullifier).concat(_descriptor_0.toValue(value_0.amount).concat(_descriptor_0.toValue(value_0.pubkey).concat(_descriptor_0.toValue(value_0.nonce)))));
  }
}

const _descriptor_7 = new _WithdrawalProof_0();

const _descriptor_8 = __compactRuntime.CompactTypeBoolean;

const _descriptor_9 = new __compactRuntime.CompactTypeVector(2, _descriptor_0);

const _descriptor_10 = new __compactRuntime.CompactTypeVector(3, _descriptor_0);

class _Either_0 {
  alignment() {
    return _descriptor_8.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_8.fromValue(value_0),
      left: _descriptor_0.fromValue(value_0),
      right: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_8.toValue(value_0.is_left).concat(_descriptor_0.toValue(value_0.left).concat(_descriptor_0.toValue(value_0.right)));
  }
}

const _descriptor_11 = new _Either_0();

const _descriptor_12 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

class _ContractAddress_0 {
  alignment() {
    return _descriptor_0.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.bytes);
  }
}

const _descriptor_13 = new _ContractAddress_0();

const _descriptor_14 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

export class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    if (typeof(witnesses_0.employerSecretKey) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named employerSecretKey');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      computeCommitment(context, ...args_1) {
        return { result: pureCircuits.computeCommitment(...args_1), context };
      },
      computeNullifier(context, ...args_1) {
        return { result: pureCircuits.computeNullifier(...args_1), context };
      },
      verifyMerkleProof(context, ...args_1) {
        return { result: pureCircuits.verifyMerkleProof(...args_1), context };
      },
      verifyWithdrawalProof(context, ...args_1) {
        return { result: pureCircuits.verifyWithdrawalProof(...args_1), context };
      },
      computeShieldedCommitment(context, ...args_1) {
        return { result: pureCircuits.computeShieldedCommitment(...args_1), context };
      },
      verifyShieldedOpening(context, ...args_1) {
        return { result: pureCircuits.verifyShieldedOpening(...args_1), context };
      },
      createPayrollRun: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`createPayrollRun: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const merkleRoot_0 = args_1[1];
        const totalCommitted_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('createPayrollRun',
                                     'argument 1 (as invoked from Typescript)',
                                     'payroll.compact line 157 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(merkleRoot_0.buffer instanceof ArrayBuffer && merkleRoot_0.BYTES_PER_ELEMENT === 1 && merkleRoot_0.length === 32)) {
          __compactRuntime.typeError('createPayrollRun',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'payroll.compact line 157 char 1',
                                     'Bytes<32>',
                                     merkleRoot_0)
        }
        if (!(typeof(totalCommitted_0) === 'bigint' && totalCommitted_0 >= 0n && totalCommitted_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('createPayrollRun',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'payroll.compact line 157 char 1',
                                     'Uint<0..18446744073709551616>',
                                     totalCommitted_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(merkleRoot_0).concat(_descriptor_1.toValue(totalCommitted_0)),
            alignment: _descriptor_0.alignment().concat(_descriptor_1.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._createPayrollRun_0(context,
                                                  partialProofData,
                                                  merkleRoot_0,
                                                  totalCommitted_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      fundPayroll: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`fundPayroll: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const noteCommitment_0 = args_1[1];
        const value_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('fundPayroll',
                                     'argument 1 (as invoked from Typescript)',
                                     'payroll.compact line 177 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(noteCommitment_0.buffer instanceof ArrayBuffer && noteCommitment_0.BYTES_PER_ELEMENT === 1 && noteCommitment_0.length === 32)) {
          __compactRuntime.typeError('fundPayroll',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'payroll.compact line 177 char 1',
                                     'Bytes<32>',
                                     noteCommitment_0)
        }
        if (!(typeof(value_0) === 'bigint' && value_0 >= 0n && value_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('fundPayroll',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'payroll.compact line 177 char 1',
                                     'Uint<0..18446744073709551616>',
                                     value_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(noteCommitment_0).concat(_descriptor_1.toValue(value_0)),
            alignment: _descriptor_0.alignment().concat(_descriptor_1.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._fundPayroll_0(context,
                                             partialProofData,
                                             noteCommitment_0,
                                             value_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      withdraw: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`withdraw: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const proof_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('withdraw',
                                     'argument 1 (as invoked from Typescript)',
                                     'payroll.compact line 192 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(proof_0) === 'object' && typeof(proof_0.merkleProof) === 'object' && proof_0.merkleProof.leaf.buffer instanceof ArrayBuffer && proof_0.merkleProof.leaf.BYTES_PER_ELEMENT === 1 && proof_0.merkleProof.leaf.length === 32 && proof_0.merkleProof.path0.buffer instanceof ArrayBuffer && proof_0.merkleProof.path0.BYTES_PER_ELEMENT === 1 && proof_0.merkleProof.path0.length === 32 && proof_0.merkleProof.path1.buffer instanceof ArrayBuffer && proof_0.merkleProof.path1.BYTES_PER_ELEMENT === 1 && proof_0.merkleProof.path1.length === 32 && proof_0.merkleProof.path2.buffer instanceof ArrayBuffer && proof_0.merkleProof.path2.BYTES_PER_ELEMENT === 1 && proof_0.merkleProof.path2.length === 32 && proof_0.merkleProof.path3.buffer instanceof ArrayBuffer && proof_0.merkleProof.path3.BYTES_PER_ELEMENT === 1 && proof_0.merkleProof.path3.length === 32 && proof_0.merkleProof.indices.buffer instanceof ArrayBuffer && proof_0.merkleProof.indices.BYTES_PER_ELEMENT === 1 && proof_0.merkleProof.indices.length === 32 && proof_0.nullifier.buffer instanceof ArrayBuffer && proof_0.nullifier.BYTES_PER_ELEMENT === 1 && proof_0.nullifier.length === 32 && proof_0.amount.buffer instanceof ArrayBuffer && proof_0.amount.BYTES_PER_ELEMENT === 1 && proof_0.amount.length === 32 && proof_0.pubkey.buffer instanceof ArrayBuffer && proof_0.pubkey.BYTES_PER_ELEMENT === 1 && proof_0.pubkey.length === 32 && proof_0.nonce.buffer instanceof ArrayBuffer && proof_0.nonce.BYTES_PER_ELEMENT === 1 && proof_0.nonce.length === 32)) {
          __compactRuntime.typeError('withdraw',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'payroll.compact line 192 char 1',
                                     'struct WithdrawalProof<merkleProof: struct MerkleProof<leaf: Bytes<32>, path0: Bytes<32>, path1: Bytes<32>, path2: Bytes<32>, path3: Bytes<32>, indices: Bytes<32>>, nullifier: Bytes<32>, amount: Bytes<32>, pubkey: Bytes<32>, nonce: Bytes<32>>',
                                     proof_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_7.toValue(proof_0),
            alignment: _descriptor_7.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._withdraw_0(context, partialProofData, proof_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      finalizePayroll: (...args_1) => {
        if (args_1.length !== 1) {
          throw new __compactRuntime.CompactError(`finalizePayroll: expected 1 argument (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('finalizePayroll',
                                     'argument 1 (as invoked from Typescript)',
                                     'payroll.compact line 210 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: { value: [], alignment: [] },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._finalizePayroll_0(context, partialProofData);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      publicKey(context, ...args_1) {
        return { result: pureCircuits.publicKey(...args_1), context };
      },
      getCurrentRun: (...args_1) => {
        if (args_1.length !== 1) {
          throw new __compactRuntime.CompactError(`getCurrentRun: expected 1 argument (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('getCurrentRun',
                                     'argument 1 (as invoked from Typescript)',
                                     'payroll.compact line 245 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: { value: [], alignment: [] },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._getCurrentRun_0(context, partialProofData);
        partialProofData.output = { value: _descriptor_4.toValue(result_0), alignment: _descriptor_4.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      hasActivePayrollRun: (...args_1) => {
        if (args_1.length !== 1) {
          throw new __compactRuntime.CompactError(`hasActivePayrollRun: expected 1 argument (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('hasActivePayrollRun',
                                     'argument 1 (as invoked from Typescript)',
                                     'payroll.compact line 250 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: { value: [], alignment: [] },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._hasActivePayrollRun_0(context, partialProofData);
        partialProofData.output = { value: _descriptor_2.toValue(result_0), alignment: _descriptor_2.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      getNullifierCount: (...args_1) => {
        if (args_1.length !== 1) {
          throw new __compactRuntime.CompactError(`getNullifierCount: expected 1 argument (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('getNullifierCount',
                                     'argument 1 (as invoked from Typescript)',
                                     'payroll.compact line 255 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: { value: [], alignment: [] },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._getNullifierCount_0(context, partialProofData);
        partialProofData.output = { value: _descriptor_1.toValue(result_0), alignment: _descriptor_1.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      getShieldedPool: (...args_1) => {
        if (args_1.length !== 1) {
          throw new __compactRuntime.CompactError(`getShieldedPool: expected 1 argument (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('getShieldedPool',
                                     'argument 1 (as invoked from Typescript)',
                                     'payroll.compact line 260 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: { value: [], alignment: [] },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._getShieldedPool_0(context, partialProofData);
        partialProofData.output = { value: _descriptor_3.toValue(result_0), alignment: _descriptor_3.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      getPayrollCounter: (...args_1) => {
        if (args_1.length !== 1) {
          throw new __compactRuntime.CompactError(`getPayrollCounter: expected 1 argument (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('getPayrollCounter',
                                     'argument 1 (as invoked from Typescript)',
                                     'payroll.compact line 265 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: { value: [], alignment: [] },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._getPayrollCounter_0(context, partialProofData);
        partialProofData.output = { value: _descriptor_1.toValue(result_0), alignment: _descriptor_1.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      }
    };
    this.impureCircuits = {
      createPayrollRun: this.circuits.createPayrollRun,
      fundPayroll: this.circuits.fundPayroll,
      withdraw: this.circuits.withdraw,
      finalizePayroll: this.circuits.finalizePayroll,
      getCurrentRun: this.circuits.getCurrentRun,
      hasActivePayrollRun: this.circuits.hasActivePayrollRun,
      getNullifierCount: this.circuits.getNullifierCount,
      getShieldedPool: this.circuits.getShieldedPool,
      getPayrollCounter: this.circuits.getPayrollCounter
    };
    this.provableCircuits = {
      createPayrollRun: this.circuits.createPayrollRun,
      fundPayroll: this.circuits.fundPayroll,
      withdraw: this.circuits.withdraw,
      finalizePayroll: this.circuits.finalizePayroll,
      getCurrentRun: this.circuits.getCurrentRun,
      hasActivePayrollRun: this.circuits.hasActivePayrollRun,
      getNullifierCount: this.circuits.getNullifierCount,
      getShieldedPool: this.circuits.getShieldedPool,
      getPayrollCounter: this.circuits.getPayrollCounter
    };
  }
  initialState(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialPrivateState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialPrivateState' in argument 1 (as invoked from Typescript)`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('createPayrollRun', new __compactRuntime.ContractOperation());
    state_0.setOperation('fundPayroll', new __compactRuntime.ContractOperation());
    state_0.setOperation('withdraw', new __compactRuntime.ContractOperation());
    state_0.setOperation('finalizePayroll', new __compactRuntime.ContractOperation());
    state_0.setOperation('getCurrentRun', new __compactRuntime.ContractOperation());
    state_0.setOperation('hasActivePayrollRun', new __compactRuntime.ContractOperation());
    state_0.setOperation('getNullifierCount', new __compactRuntime.ContractOperation());
    state_0.setOperation('getShieldedPool', new __compactRuntime.ContractOperation());
    state_0.setOperation('getPayrollCounter', new __compactRuntime.ContractOperation());
    const context = __compactRuntime.createCircuitContext(__compactRuntime.dummyContractAddress(), constructorContext_0.initialZswapLocalState.coinPublicKey, state_0.data, constructorContext_0.initialPrivateState);
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(0n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(1n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(2n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue({ id: 0n, employer: new Uint8Array(32), merkleRoot: new Uint8Array(32), totalCommitted: 0n, isActive: 0n, isFinalized: 0n }),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(3n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(0n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(4n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue({ noteCommitment: new Uint8Array(32), value: 0n, isSpent: 0n }),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    state_0.data = new __compactRuntime.ChargedState(context.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_10, value_0);
    return result_0;
  }
  _persistentHash_1(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_9, value_0);
    return result_0;
  }
  _employerSecretKey_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.employerSecretKey(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('employerSecretKey',
                                 'return value',
                                 'payroll.compact line 71 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _computeCommitment_0(pubkey_0, amount_0, nonce_0) {
    return this._persistentHash_0([pubkey_0, amount_0, nonce_0]);
  }
  _computeNullifier_0(commitment_0, secret_0) {
    return this._persistentHash_1([commitment_0, secret_0]);
  }
  _verifyMerkleProof_0(root_0, proof_0) {
    return this._equal_0(proof_0.leaf, root_0);
  }
  _verifyWithdrawalProof_0(merkleRoot_0, proof_0) {
    const validMerkle_0 = this._verifyMerkleProof_0(merkleRoot_0,
                                                    proof_0.merkleProof);
    __compactRuntime.assert(validMerkle_0, 'Invalid Merkle proof');
    const computedCommitment_0 = this._computeCommitment_0(proof_0.pubkey,
                                                           proof_0.amount,
                                                           proof_0.nonce);
    __compactRuntime.assert(this._equal_1(computedCommitment_0,
                                          proof_0.merkleProof.leaf),
                            'Commitment mismatch');
    const computedNullifier_0 = this._computeNullifier_0(proof_0.merkleProof.leaf,
                                                         proof_0.nonce);
    __compactRuntime.assert(this._equal_2(computedNullifier_0, proof_0.nullifier),
                            'Nullifier mismatch');
    return true;
  }
  _computeShieldedCommitment_0(value_0, secret_0) {
    return this._persistentHash_1([value_0, secret_0]);
  }
  _verifyShieldedOpening_0(commitment_0, value_0, secret_0) {
    const computed_0 = this._computeShieldedCommitment_0(value_0, secret_0);
    return this._equal_3(computed_0, commitment_0);
  }
  _createPayrollRun_0(context, partialProofData, merkleRoot_0, totalCommitted_0)
  {
    const employer_0 = this._publicKey_0(this._employerSecretKey_0(context,
                                                                   partialProofData));
    const tmp_0 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_14.toValue(1n),
                                                                  alignment: _descriptor_14.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_5.toValue(tmp_0),
                                                                alignment: _descriptor_5.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 1 } }]);
    const runId_0 = _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                              partialProofData,
                                                                              [
                                                                               { dup: { n: 0 } },
                                                                               { idx: { cached: false,
                                                                                        pushPath: false,
                                                                                        path: [
                                                                                               { tag: 'value',
                                                                                                 value: { value: _descriptor_14.toValue(1n),
                                                                                                          alignment: _descriptor_14.alignment() } }] } },
                                                                               { popeq: { cached: true,
                                                                                          result: undefined } }]).value);
    const tmp_1 = { id: runId_0,
                    employer: employer_0,
                    merkleRoot: merkleRoot_0,
                    totalCommitted: totalCommitted_0,
                    isActive: 1n,
                    isFinalized: 0n };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(2n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(tmp_1),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(3n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(1n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    return [];
  }
  _fundPayroll_0(context, partialProofData, noteCommitment_0, value_0) {
    __compactRuntime.assert(this._equal_4(_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_14.toValue(3n),
                                                                                                                                alignment: _descriptor_14.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value),
                                          1n),
                            'No active payroll run');
    __compactRuntime.assert(this._equal_5(_descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_14.toValue(2n),
                                                                                                                                alignment: _descriptor_14.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value).isActive,
                                          1n),
                            'Payroll run not active');
    __compactRuntime.assert(this._equal_6(_descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_14.toValue(2n),
                                                                                                                                alignment: _descriptor_14.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value).totalCommitted,
                                          value_0),
                            'Value mismatch with committed total');
    const tmp_0 = { noteCommitment: noteCommitment_0,
                    value: value_0,
                    isSpent: 0n };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(4n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(tmp_0),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    return [];
  }
  _withdraw_0(context, partialProofData, proof_0) {
    __compactRuntime.assert(this._equal_7(_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_14.toValue(3n),
                                                                                                                                alignment: _descriptor_14.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value),
                                          1n),
                            'No active payroll run');
    __compactRuntime.assert(this._equal_8(_descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_14.toValue(2n),
                                                                                                                                alignment: _descriptor_14.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value).isActive,
                                          1n),
                            'Payroll run not active');
    __compactRuntime.assert(this._equal_9(_descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_14.toValue(4n),
                                                                                                                                alignment: _descriptor_14.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value).isSpent,
                                          0n),
                            'Pool already spent');
    const valid_0 = this._verifyWithdrawalProof_0(_descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                            partialProofData,
                                                                                                            [
                                                                                                             { dup: { n: 0 } },
                                                                                                             { idx: { cached: false,
                                                                                                                      pushPath: false,
                                                                                                                      path: [
                                                                                                                             { tag: 'value',
                                                                                                                               value: { value: _descriptor_14.toValue(2n),
                                                                                                                                        alignment: _descriptor_14.alignment() } }] } },
                                                                                                             { popeq: { cached: false,
                                                                                                                        result: undefined } }]).value).merkleRoot,
                                                  proof_0);
    __compactRuntime.assert(valid_0, 'Invalid withdrawal proof');
    const tmp_0 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_14.toValue(0n),
                                                                  alignment: _descriptor_14.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_5.toValue(tmp_0),
                                                                alignment: _descriptor_5.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _finalizePayroll_0(context, partialProofData) {
    __compactRuntime.assert(this._equal_10(_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                     partialProofData,
                                                                                                     [
                                                                                                      { dup: { n: 0 } },
                                                                                                      { idx: { cached: false,
                                                                                                               pushPath: false,
                                                                                                               path: [
                                                                                                                      { tag: 'value',
                                                                                                                        value: { value: _descriptor_14.toValue(3n),
                                                                                                                                 alignment: _descriptor_14.alignment() } }] } },
                                                                                                      { popeq: { cached: false,
                                                                                                                 result: undefined } }]).value),
                                           1n),
                            'No active payroll run');
    __compactRuntime.assert(this._equal_11(_descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                     partialProofData,
                                                                                                     [
                                                                                                      { dup: { n: 0 } },
                                                                                                      { idx: { cached: false,
                                                                                                               pushPath: false,
                                                                                                               path: [
                                                                                                                      { tag: 'value',
                                                                                                                        value: { value: _descriptor_14.toValue(2n),
                                                                                                                                 alignment: _descriptor_14.alignment() } }] } },
                                                                                                      { popeq: { cached: false,
                                                                                                                 result: undefined } }]).value).isActive,
                                           1n),
                            'Payroll run not active');
    const tmp_0 = { id:
                      _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                partialProofData,
                                                                                [
                                                                                 { dup: { n: 0 } },
                                                                                 { idx: { cached: false,
                                                                                          pushPath: false,
                                                                                          path: [
                                                                                                 { tag: 'value',
                                                                                                   value: { value: _descriptor_14.toValue(2n),
                                                                                                            alignment: _descriptor_14.alignment() } }] } },
                                                                                 { popeq: { cached: false,
                                                                                            result: undefined } }]).value).id,
                    employer:
                      _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                partialProofData,
                                                                                [
                                                                                 { dup: { n: 0 } },
                                                                                 { idx: { cached: false,
                                                                                          pushPath: false,
                                                                                          path: [
                                                                                                 { tag: 'value',
                                                                                                   value: { value: _descriptor_14.toValue(2n),
                                                                                                            alignment: _descriptor_14.alignment() } }] } },
                                                                                 { popeq: { cached: false,
                                                                                            result: undefined } }]).value).employer,
                    merkleRoot:
                      _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                partialProofData,
                                                                                [
                                                                                 { dup: { n: 0 } },
                                                                                 { idx: { cached: false,
                                                                                          pushPath: false,
                                                                                          path: [
                                                                                                 { tag: 'value',
                                                                                                   value: { value: _descriptor_14.toValue(2n),
                                                                                                            alignment: _descriptor_14.alignment() } }] } },
                                                                                 { popeq: { cached: false,
                                                                                            result: undefined } }]).value).merkleRoot,
                    totalCommitted:
                      _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                partialProofData,
                                                                                [
                                                                                 { dup: { n: 0 } },
                                                                                 { idx: { cached: false,
                                                                                          pushPath: false,
                                                                                          path: [
                                                                                                 { tag: 'value',
                                                                                                   value: { value: _descriptor_14.toValue(2n),
                                                                                                            alignment: _descriptor_14.alignment() } }] } },
                                                                                 { popeq: { cached: false,
                                                                                            result: undefined } }]).value).totalCommitted,
                    isActive: 0n,
                    isFinalized: 1n };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(2n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(tmp_0),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_1 = 0n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(3n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(tmp_1),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_2 = { noteCommitment:
                      _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                partialProofData,
                                                                                [
                                                                                 { dup: { n: 0 } },
                                                                                 { idx: { cached: false,
                                                                                          pushPath: false,
                                                                                          path: [
                                                                                                 { tag: 'value',
                                                                                                   value: { value: _descriptor_14.toValue(4n),
                                                                                                            alignment: _descriptor_14.alignment() } }] } },
                                                                                 { popeq: { cached: false,
                                                                                            result: undefined } }]).value).noteCommitment,
                    value:
                      _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                partialProofData,
                                                                                [
                                                                                 { dup: { n: 0 } },
                                                                                 { idx: { cached: false,
                                                                                          pushPath: false,
                                                                                          path: [
                                                                                                 { tag: 'value',
                                                                                                   value: { value: _descriptor_14.toValue(4n),
                                                                                                            alignment: _descriptor_14.alignment() } }] } },
                                                                                 { popeq: { cached: false,
                                                                                            result: undefined } }]).value).value,
                    isSpent: 1n };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(4n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(tmp_2),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    return [];
  }
  _publicKey_0(sk_0) {
    return this._persistentHash_1([new Uint8Array([112, 97, 121, 114, 111, 108, 108, 58, 112, 107, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   sk_0]);
  }
  _getCurrentRun_0(context, partialProofData) {
    return _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                     partialProofData,
                                                                     [
                                                                      { dup: { n: 0 } },
                                                                      { idx: { cached: false,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_14.toValue(2n),
                                                                                                 alignment: _descriptor_14.alignment() } }] } },
                                                                      { popeq: { cached: false,
                                                                                 result: undefined } }]).value);
  }
  _hasActivePayrollRun_0(context, partialProofData) {
    return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                     partialProofData,
                                                                     [
                                                                      { dup: { n: 0 } },
                                                                      { idx: { cached: false,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_14.toValue(3n),
                                                                                                 alignment: _descriptor_14.alignment() } }] } },
                                                                      { popeq: { cached: false,
                                                                                 result: undefined } }]).value);
  }
  _getNullifierCount_0(context, partialProofData) {
    return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                     partialProofData,
                                                                     [
                                                                      { dup: { n: 0 } },
                                                                      { idx: { cached: false,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_14.toValue(0n),
                                                                                                 alignment: _descriptor_14.alignment() } }] } },
                                                                      { popeq: { cached: true,
                                                                                 result: undefined } }]).value);
  }
  _getShieldedPool_0(context, partialProofData) {
    return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                     partialProofData,
                                                                     [
                                                                      { dup: { n: 0 } },
                                                                      { idx: { cached: false,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_14.toValue(4n),
                                                                                                 alignment: _descriptor_14.alignment() } }] } },
                                                                      { popeq: { cached: false,
                                                                                 result: undefined } }]).value);
  }
  _getPayrollCounter_0(context, partialProofData) {
    return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                     partialProofData,
                                                                     [
                                                                      { dup: { n: 0 } },
                                                                      { idx: { cached: false,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_14.toValue(1n),
                                                                                                 alignment: _descriptor_14.alignment() } }] } },
                                                                      { popeq: { cached: true,
                                                                                 result: undefined } }]).value);
  }
  _equal_0(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_1(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_2(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_3(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_4(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_5(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_6(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_7(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_8(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_9(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_10(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_11(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
}
export function ledger(stateOrChargedState) {
  const state = stateOrChargedState instanceof __compactRuntime.StateValue ? stateOrChargedState : stateOrChargedState.state;
  const chargedState = stateOrChargedState instanceof __compactRuntime.StateValue ? new __compactRuntime.ChargedState(stateOrChargedState) : stateOrChargedState;
  const context = {
    currentQueryContext: new __compactRuntime.QueryContext(chargedState, __compactRuntime.dummyContractAddress()),
    costModel: __compactRuntime.CostModel.initialCostModel()
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
    get nullifierCount() {
      return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_14.toValue(0n),
                                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                                        { popeq: { cached: true,
                                                                                   result: undefined } }]).value);
    },
    get payrollCounter() {
      return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_14.toValue(1n),
                                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                                        { popeq: { cached: true,
                                                                                   result: undefined } }]).value);
    },
    get currentRun() {
      return _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_14.toValue(2n),
                                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get hasActiveRun() {
      return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_14.toValue(3n),
                                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get shieldedPool() {
      return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_14.toValue(4n),
                                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    }
  };
}
const _emptyContext = {
  currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({
  employerSecretKey: (...args) => undefined
});
export const pureCircuits = {
  computeCommitment: (...args_0) => {
    if (args_0.length !== 3) {
      throw new __compactRuntime.CompactError(`computeCommitment: expected 3 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const pubkey_0 = args_0[0];
    const amount_0 = args_0[1];
    const nonce_0 = args_0[2];
    if (!(pubkey_0.buffer instanceof ArrayBuffer && pubkey_0.BYTES_PER_ELEMENT === 1 && pubkey_0.length === 32)) {
      __compactRuntime.typeError('computeCommitment',
                                 'argument 1',
                                 'payroll.compact line 85 char 1',
                                 'Bytes<32>',
                                 pubkey_0)
    }
    if (!(amount_0.buffer instanceof ArrayBuffer && amount_0.BYTES_PER_ELEMENT === 1 && amount_0.length === 32)) {
      __compactRuntime.typeError('computeCommitment',
                                 'argument 2',
                                 'payroll.compact line 85 char 1',
                                 'Bytes<32>',
                                 amount_0)
    }
    if (!(nonce_0.buffer instanceof ArrayBuffer && nonce_0.BYTES_PER_ELEMENT === 1 && nonce_0.length === 32)) {
      __compactRuntime.typeError('computeCommitment',
                                 'argument 3',
                                 'payroll.compact line 85 char 1',
                                 'Bytes<32>',
                                 nonce_0)
    }
    return _dummyContract._computeCommitment_0(pubkey_0, amount_0, nonce_0);
  },
  computeNullifier: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`computeNullifier: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const commitment_0 = args_0[0];
    const secret_0 = args_0[1];
    if (!(commitment_0.buffer instanceof ArrayBuffer && commitment_0.BYTES_PER_ELEMENT === 1 && commitment_0.length === 32)) {
      __compactRuntime.typeError('computeNullifier',
                                 'argument 1',
                                 'payroll.compact line 92 char 1',
                                 'Bytes<32>',
                                 commitment_0)
    }
    if (!(secret_0.buffer instanceof ArrayBuffer && secret_0.BYTES_PER_ELEMENT === 1 && secret_0.length === 32)) {
      __compactRuntime.typeError('computeNullifier',
                                 'argument 2',
                                 'payroll.compact line 92 char 1',
                                 'Bytes<32>',
                                 secret_0)
    }
    return _dummyContract._computeNullifier_0(commitment_0, secret_0);
  },
  verifyMerkleProof: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`verifyMerkleProof: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const root_0 = args_0[0];
    const proof_0 = args_0[1];
    if (!(root_0.buffer instanceof ArrayBuffer && root_0.BYTES_PER_ELEMENT === 1 && root_0.length === 32)) {
      __compactRuntime.typeError('verifyMerkleProof',
                                 'argument 1',
                                 'payroll.compact line 99 char 1',
                                 'Bytes<32>',
                                 root_0)
    }
    if (!(typeof(proof_0) === 'object' && proof_0.leaf.buffer instanceof ArrayBuffer && proof_0.leaf.BYTES_PER_ELEMENT === 1 && proof_0.leaf.length === 32 && proof_0.path0.buffer instanceof ArrayBuffer && proof_0.path0.BYTES_PER_ELEMENT === 1 && proof_0.path0.length === 32 && proof_0.path1.buffer instanceof ArrayBuffer && proof_0.path1.BYTES_PER_ELEMENT === 1 && proof_0.path1.length === 32 && proof_0.path2.buffer instanceof ArrayBuffer && proof_0.path2.BYTES_PER_ELEMENT === 1 && proof_0.path2.length === 32 && proof_0.path3.buffer instanceof ArrayBuffer && proof_0.path3.BYTES_PER_ELEMENT === 1 && proof_0.path3.length === 32 && proof_0.indices.buffer instanceof ArrayBuffer && proof_0.indices.BYTES_PER_ELEMENT === 1 && proof_0.indices.length === 32)) {
      __compactRuntime.typeError('verifyMerkleProof',
                                 'argument 2',
                                 'payroll.compact line 99 char 1',
                                 'struct MerkleProof<leaf: Bytes<32>, path0: Bytes<32>, path1: Bytes<32>, path2: Bytes<32>, path3: Bytes<32>, indices: Bytes<32>>',
                                 proof_0)
    }
    return _dummyContract._verifyMerkleProof_0(root_0, proof_0);
  },
  verifyWithdrawalProof: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`verifyWithdrawalProof: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const merkleRoot_0 = args_0[0];
    const proof_0 = args_0[1];
    if (!(merkleRoot_0.buffer instanceof ArrayBuffer && merkleRoot_0.BYTES_PER_ELEMENT === 1 && merkleRoot_0.length === 32)) {
      __compactRuntime.typeError('verifyWithdrawalProof',
                                 'argument 1',
                                 'payroll.compact line 108 char 1',
                                 'Bytes<32>',
                                 merkleRoot_0)
    }
    if (!(typeof(proof_0) === 'object' && typeof(proof_0.merkleProof) === 'object' && proof_0.merkleProof.leaf.buffer instanceof ArrayBuffer && proof_0.merkleProof.leaf.BYTES_PER_ELEMENT === 1 && proof_0.merkleProof.leaf.length === 32 && proof_0.merkleProof.path0.buffer instanceof ArrayBuffer && proof_0.merkleProof.path0.BYTES_PER_ELEMENT === 1 && proof_0.merkleProof.path0.length === 32 && proof_0.merkleProof.path1.buffer instanceof ArrayBuffer && proof_0.merkleProof.path1.BYTES_PER_ELEMENT === 1 && proof_0.merkleProof.path1.length === 32 && proof_0.merkleProof.path2.buffer instanceof ArrayBuffer && proof_0.merkleProof.path2.BYTES_PER_ELEMENT === 1 && proof_0.merkleProof.path2.length === 32 && proof_0.merkleProof.path3.buffer instanceof ArrayBuffer && proof_0.merkleProof.path3.BYTES_PER_ELEMENT === 1 && proof_0.merkleProof.path3.length === 32 && proof_0.merkleProof.indices.buffer instanceof ArrayBuffer && proof_0.merkleProof.indices.BYTES_PER_ELEMENT === 1 && proof_0.merkleProof.indices.length === 32 && proof_0.nullifier.buffer instanceof ArrayBuffer && proof_0.nullifier.BYTES_PER_ELEMENT === 1 && proof_0.nullifier.length === 32 && proof_0.amount.buffer instanceof ArrayBuffer && proof_0.amount.BYTES_PER_ELEMENT === 1 && proof_0.amount.length === 32 && proof_0.pubkey.buffer instanceof ArrayBuffer && proof_0.pubkey.BYTES_PER_ELEMENT === 1 && proof_0.pubkey.length === 32 && proof_0.nonce.buffer instanceof ArrayBuffer && proof_0.nonce.BYTES_PER_ELEMENT === 1 && proof_0.nonce.length === 32)) {
      __compactRuntime.typeError('verifyWithdrawalProof',
                                 'argument 2',
                                 'payroll.compact line 108 char 1',
                                 'struct WithdrawalProof<merkleProof: struct MerkleProof<leaf: Bytes<32>, path0: Bytes<32>, path1: Bytes<32>, path2: Bytes<32>, path3: Bytes<32>, indices: Bytes<32>>, nullifier: Bytes<32>, amount: Bytes<32>, pubkey: Bytes<32>, nonce: Bytes<32>>',
                                 proof_0)
    }
    return _dummyContract._verifyWithdrawalProof_0(merkleRoot_0, proof_0);
  },
  computeShieldedCommitment: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`computeShieldedCommitment: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const value_0 = args_0[0];
    const secret_0 = args_0[1];
    if (!(value_0.buffer instanceof ArrayBuffer && value_0.BYTES_PER_ELEMENT === 1 && value_0.length === 32)) {
      __compactRuntime.typeError('computeShieldedCommitment',
                                 'argument 1',
                                 'payroll.compact line 134 char 1',
                                 'Bytes<32>',
                                 value_0)
    }
    if (!(secret_0.buffer instanceof ArrayBuffer && secret_0.BYTES_PER_ELEMENT === 1 && secret_0.length === 32)) {
      __compactRuntime.typeError('computeShieldedCommitment',
                                 'argument 2',
                                 'payroll.compact line 134 char 1',
                                 'Bytes<32>',
                                 secret_0)
    }
    return _dummyContract._computeShieldedCommitment_0(value_0, secret_0);
  },
  verifyShieldedOpening: (...args_0) => {
    if (args_0.length !== 3) {
      throw new __compactRuntime.CompactError(`verifyShieldedOpening: expected 3 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const commitment_0 = args_0[0];
    const value_0 = args_0[1];
    const secret_0 = args_0[2];
    if (!(commitment_0.buffer instanceof ArrayBuffer && commitment_0.BYTES_PER_ELEMENT === 1 && commitment_0.length === 32)) {
      __compactRuntime.typeError('verifyShieldedOpening',
                                 'argument 1',
                                 'payroll.compact line 141 char 1',
                                 'Bytes<32>',
                                 commitment_0)
    }
    if (!(value_0.buffer instanceof ArrayBuffer && value_0.BYTES_PER_ELEMENT === 1 && value_0.length === 32)) {
      __compactRuntime.typeError('verifyShieldedOpening',
                                 'argument 2',
                                 'payroll.compact line 141 char 1',
                                 'Bytes<32>',
                                 value_0)
    }
    if (!(secret_0.buffer instanceof ArrayBuffer && secret_0.BYTES_PER_ELEMENT === 1 && secret_0.length === 32)) {
      __compactRuntime.typeError('verifyShieldedOpening',
                                 'argument 3',
                                 'payroll.compact line 141 char 1',
                                 'Bytes<32>',
                                 secret_0)
    }
    return _dummyContract._verifyShieldedOpening_0(commitment_0,
                                                   value_0,
                                                   secret_0);
  },
  publicKey: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`publicKey: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const sk_0 = args_0[0];
    if (!(sk_0.buffer instanceof ArrayBuffer && sk_0.BYTES_PER_ELEMENT === 1 && sk_0.length === 32)) {
      __compactRuntime.typeError('publicKey',
                                 'argument 1',
                                 'payroll.compact line 236 char 1',
                                 'Bytes<32>',
                                 sk_0)
    }
    return _dummyContract._publicKey_0(sk_0);
  }
};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
//# sourceMappingURL=index.js.map
