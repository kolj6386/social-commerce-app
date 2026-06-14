import { Type } from 'class-transformer'
import { IsInt, IsPositive, Min } from 'class-validator'

export class DeletePostQueryDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Min(1)
  postId: number

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Min(1)
  userId: number
}

/** Admin delete body — same shape as legacy DeletePostQueryObject */
export class DeletePostBodyDto {
  @IsInt()
  @IsPositive()
  @Min(1)
  postId: number

  @IsInt()
  @IsPositive()
  @Min(1)
  userId: number
}
