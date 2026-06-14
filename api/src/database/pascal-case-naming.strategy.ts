import { DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm'

/** Keeps explicit PascalCase table/column names instead of lowercasing for PostgreSQL. */
export class PascalCaseNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  override tableName(targetTableName: string, userSpecifiedName: string | undefined): string {
    return userSpecifiedName ?? targetTableName
  }

  override columnName(
    propertyName: string,
    customName: string | undefined,
    embeddedPrefixes: string[],
  ): string {
    return customName ?? propertyName
  }
}
