import { IsInt, IsOptional, IsPositive, Min } from 'class-validator'

export class IncrementViewDto {
  @IsInt()
  @IsPositive()
  @Min(1)
  postId: number

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Min(1)
  userId?: number | null
}
