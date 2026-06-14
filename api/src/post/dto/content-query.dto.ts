import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator'

const parseApprovedPosts = (value: unknown): boolean => {
  if (value === undefined || value === null || value === '') {
    return true
  }
  if (value === true || value === 'true' || value === '1') {
    return true
  }
  if (value === false || value === 'false' || value === '0') {
    return false
  }
  return true
}

export class ContentQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional()
  pageNumber?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @ApiPropertyOptional()
  resultsPerPage?: number = 10

  @IsOptional()
  @Transform(({ obj }) => parseApprovedPosts(obj.approvedPosts))
  @IsBoolean()
  @ApiPropertyOptional({ type: Boolean, default: true })
  approvedPosts?: boolean = true
}
