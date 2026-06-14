import { Type } from 'class-transformer'
import { IsInt, IsPositive, Max, Min } from 'class-validator'

export class UnapprovedPostsQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsPositive()
  pageNumber: number = 1

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsPositive()
  resultsPerPage: number = 10
}
