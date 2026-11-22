import { Transform, Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional, IsPositive, Max, Min } from 'class-validator'

const parseStatus = (value: unknown): 'all' | 'pending' => {
  if (value === 'pending' || value === 'unapproved') return 'pending'
  return 'all'
}

export class AdminCommentsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsPositive()
  pageNumber: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsPositive()
  resultsPerPage: number = 20

  @IsOptional()
  @Transform(({ obj }) => parseStatus(obj.status))
  @IsIn(['all', 'pending'])
  status: 'all' | 'pending' = 'all'
}
