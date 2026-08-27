import {
  IsArray,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'

export class CreatePostDto {
  @IsString()
  @MaxLength(100)
  @Matches(/^[^<>]*$/, { message: 'HTML is not allowed' })
  firstName: string

  @IsString()
  @MaxLength(100)
  @Matches(/^[^<>]*$/, { message: 'HTML is not allowed' })
  lastName: string

  @IsString()
  @MinLength(5)
  @MaxLength(280)
  @Matches(/^[^<>]*$/, { message: 'HTML is not allowed' })
  postContent: string

  @IsInt()
  @IsPositive()
  @Min(1)
  productId: number

  @IsInt()
  @Min(0)
  userId: number

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  postMedia: string[] = []
}
