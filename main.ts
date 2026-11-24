import { PostgresAdapter } from './src/connector/adapter/postgres-adapter';
import { TransactionController } from './src/connector/controller/transaction-controller';
import { BuyingInvoiceRepository } from './src/connector/repository/buying-invoice-repository';
import { CompanyRepository } from './src/connector/repository/company-repository';
import { TransactionRepository } from './src/connector/repository/transaction-repository';
import { AutoMatchUseCase } from './src/application/usecases/auto-match-use-case';
import { config } from './src/config';

async function main() {
  const postgresAdapter = new PostgresAdapter(config.db);
  const companiesRepo = new CompanyRepository(postgresAdapter.pool);
  const transactionsRepo = new TransactionRepository(postgresAdapter.pool);
  const invoicesRepo = new BuyingInvoiceRepository(postgresAdapter.pool);
  const autoMatchUseCase = new AutoMatchUseCase(
    companiesRepo,
    transactionsRepo,
    invoicesRepo,
  );
  const transactionController = new TransactionController(autoMatchUseCase);

  try {
    const result = await transactionController.matchTransactionWithInvoice('900997767');
    console.log(`Matched ${result.matched} of ${result.totalTransactions} transactions`);
  } finally {
    await postgresAdapter.stop();
  }
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
