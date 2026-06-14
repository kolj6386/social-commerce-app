import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
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
  @MinLength(1)
  @MaxLength(100)
  @IsNotEmpty()
  @Matches(/^[^<>]*$/, { message: 'HTML is not allowed' })
  firstName: string

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsNotEmpty()
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
  @IsPositive()
  @Min(1)
  userId: number

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  postMedia: string[] = []
}
