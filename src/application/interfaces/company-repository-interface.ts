export interface CompanyRepositoryInterface {
  findIdBySiren(siren: string): Promise<string | null>;
}
