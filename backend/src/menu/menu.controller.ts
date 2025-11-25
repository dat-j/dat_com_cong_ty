import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MenuService } from './menu.service';
import { CreateMenuItemDto, CreateMenuItemsDto, UpdateMenuItemDto } from './dto/menu.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('menu')
export class MenuController {
  constructor(private menuService: MenuService) {}

  @Get('today')
  async getTodayMenu() {
    return this.menuService.getTodayMenu();
  }

  @Get('by-date')
  async getMenuByDate(@Query('date') date: string) {
    return this.menuService.getMenuByDate(new Date(date));
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post()
  async createMenuItem(@Body() createMenuItemDto: CreateMenuItemDto) {
    return this.menuService.createMenuItem(createMenuItemDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post('bulk')
  async createMenuItems(@Body() createMenuItemsDto: CreateMenuItemsDto) {
    return this.menuService.createMenuItems(createMenuItemsDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Put(':id')
  async updateMenuItem(@Param('id') id: string, @Body() updateMenuItemDto: UpdateMenuItemDto) {
    return this.menuService.updateMenuItem(id, updateMenuItemDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async deleteMenuItem(@Param('id') id: string) {
    await this.menuService.deleteMenuItem(id);
    return { message: 'Menu item deleted successfully' };
  }
}
