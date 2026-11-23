import { Company } from "../../domain/entities/company";

export interface CompanyRepositoryInterface {
  findCompanyBySiren(siren: string): Promise<Company | null>;
}
