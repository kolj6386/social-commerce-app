import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'

export class EditPostDto {
  @IsInt()
  @IsPositive()
  @Min(1)
  postId: number

  @IsInt()
  @IsPositive()
  @Min(1)
  userid: number

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(280)
  @Matches(/^[^<>]*$/, { message: 'HTML is not allowed' })
  postContent: string
}
