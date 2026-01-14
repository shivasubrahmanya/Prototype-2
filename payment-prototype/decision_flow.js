/**
 * Safety-First Customer Support Decision Logic
 * Case: "Payment Failed but Amount Debited"
 */

/*
Data Shape:
{
  status: 'FAILED' | 'PENDING' | 'SUCCESS',
  gateway_response: 'FAILURE' | 'TIMEOUT' | 'SUCCESS',
  amount: number,
  currency: string,
  debited_from_customer: boolean,
  time_elapsed_hours: number,
  system_certainty_score: number (0-1)
}
*/

const RULES = {
  HIGH_VALUE_THRESHOLD: 5000,
  AUTO_REVERSAL_WINDOW_HOURS: 24,
  CERTAINTY_THRESHOLD: 1.0 // Must be 100% sure to automate
};

function analyzeCase(data) {
  console.log("Analyzing Case:", JSON.stringify(data, null, 2));
  
  // FAIL-SAFE 1: If money was debited but gateway says failed -> ESCALATE IMMEDIATELY
  // This is the classic "money in limbo" scary state.
  if (data.debited_from_customer && data.status === 'FAILED') {
    return {
      decision: "ESCALATE",
      reason: "CRITICAL: Customer debited but transaction marked FAILED. Reconciliation required."
    };
  }

  // FAIL-SAFE 2: High Value Transaction
  if (data.amount > RULES.HIGH_VALUE_THRESHOLD) {
    return {
      decision: "ESCALATE",
      reason: `RISK: Transaction amount (${data.amount}) exceeds safety threshold. Human review mandatory.`
    };
  }

  // FAIL-SAFE 3: Low Certainty
  if (data.system_certainty_score < RULES.CERTAINTY_THRESHOLD) {
    return {
      decision: "ESCALATE",
      reason: "UNCERTIANTY: System cannot definitively verify funds location."
    };
  }

  // SCENARIO: Pending State
  if (data.status === 'PENDING') {
    if (data.time_elapsed_hours < RULES.AUTO_REVERSAL_WINDOW_HOURS) {
      return {
        decision: "WAIT",
        reason: `STANDARD PROCESS: Transaction is pending. Auto-reversal window (${RULES.AUTO_REVERSAL_WINDOW_HOURS}h) active. Advise customer to wait.`
      };
    } else {
      return {
        decision: "ESCALATE",
        reason: "SLA BREACH: Pending state exceeded auto-reversal window."
      };
    }
  }

  // Default Fail-Safe
  return {
    decision: "ESCALATE",
    reason: "DEFAULT: Case did not match safe automation attributes."
  };
}

// ==========================================
// TEST CASES (Simulating inputs)
// ==========================================

const scenarios = [
  {
    name: "Standard Pending Reversal",
    data: {
      status: 'PENDING',
      gateway_response: 'TIMEOUT',
      amount: 150,
      debited_from_customer: true,
      time_elapsed_hours: 2,
      system_certainty_score: 1.0
    }
  },
  {
    name: "Money Limbo (Debited but Failed)",
    data: {
      status: 'FAILED',
      gateway_response: 'FAILURE',
      amount: 4500,
      debited_from_customer: true,
      time_elapsed_hours: 0.5,
      system_certainty_score: 1.0
    }
  },
  {
    name: "High Value Panic",
    data: {
      status: 'PENDING',
      gateway_response: 'TIMEOUT',
      amount: 12000,
      debited_from_customer: true,
      time_elapsed_hours: 1,
      system_certainty_score: 1.0
    }
  }
];

// Run Tests
console.log("=== RUNNING DECISION PROTO CODES ===\n");
scenarios.forEach(scenario => {
  console.log(`--- Scenario: ${scenario.name} ---`);
  const result = analyzeCase(scenario.data);
  console.log("OUTPUT:", result);
  console.log("\n");
});

// Export for UI use (if we were bundling, but for this proto we'll just paste logic mock in UI)
if (typeof module !== 'undefined') module.exports = { analyzeCase };
