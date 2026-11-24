import {
    AutoMatchUseCase,
    type AutoMatchResult,
} from "../../application/usecases/auto-match-use-case";

class TransactionController {
    constructor(private readonly autoMatchUseCase: AutoMatchUseCase) {}

    matchTransactionWithInvoice(companySiren: string): Promise<AutoMatchResult> {
        return this.autoMatchUseCase.execute(companySiren);
    }
}

export { TransactionController };