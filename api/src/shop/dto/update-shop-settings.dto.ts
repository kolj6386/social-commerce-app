import { Transform } from 'class-transformer'
import { IsBoolean, IsOptional, IsString, Matches, MaxLength } from 'class-validator'

const LANGUAGE_FILTER_PATTERN =
  /^$|^[a-zA-Z]+(?: [a-zA-Z]+)?(?:, [a-zA-Z]+(?: [a-zA-Z]+)?)*$/

export class UpdateShopSettingsDto {
  @IsOptional()
  @IsBoolean()
  allowGuestPosting?: boolean

  @IsOptional()
  @IsBoolean()
  autoApproveLoggedInPosts?: boolean

  @IsOptional()
  @IsBoolean()
  notificationsEnabled?: boolean

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(LANGUAGE_FILTER_PATTERN, {
    message:
      "Language filter must be empty or comma-separated words, e.g. 'word, word with space'",
  })
  languageFilter?: string
}
