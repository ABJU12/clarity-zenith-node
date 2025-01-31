import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Ensures node registration works",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet_1 = accounts.get("wallet_1")!;
    
    let block = chain.mineBlock([
      Tx.contractCall(
        "zenith-node",
        "register-node",
        [],
        wallet_1.address
      )
    ]);
    assertEquals(block.receipts[0].result, "(ok true)");
    
    let result = chain.callReadOnlyFn(
      "zenith-node",
      "get-node-info",
      [types.principal(wallet_1.address)],
      wallet_1.address
    );
    assertEquals(result.result.startsWith('(ok (some'), true);
  }
});

Clarinet.test({
  name: "Ensures duplicate registration fails",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet_1 = accounts.get("wallet_1")!;
    
    let block = chain.mineBlock([
      Tx.contractCall(
        "zenith-node",
        "register-node",
        [],
        wallet_1.address
      ),
      Tx.contractCall(
        "zenith-node",
        "register-node",
        [],
        wallet_1.address
      )
    ]);
    assertEquals(block.receipts[0].result, "(ok true)");
    assertEquals(block.receipts[1].result, `(err u101)`);
  }
});

Clarinet.test({
  name: "Ensures status update works for registered nodes",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet_1 = accounts.get("wallet_1")!;
    
    let block = chain.mineBlock([
      Tx.contractCall(
        "zenith-node",
        "register-node",
        [],
        wallet_1.address
      ),
      Tx.contractCall(
        "zenith-node", 
        "update-status",
        [types.ascii("inactive")],
        wallet_1.address
      )
    ]);
    assertEquals(block.receipts[1].result, "(ok true)");
  }
});
