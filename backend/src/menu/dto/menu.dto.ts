import { IsNotEmpty, IsString, IsNumber, IsDateString, IsOptional, IsBoolean } from 'class-validator';

export class CreateMenuItemDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsDateString()
  date?: string; // If not provided, use today's date
}

export class CreateMenuItemsDto {
  @IsNotEmpty()
  items: { name: string; price: number }[];
  
  @IsOptional()
  @IsDateString()
  date?: string;
}

export class UpdateMenuItemDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
