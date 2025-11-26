import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SettingsService } from './settings.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('ordering-status')
  async getOrderingStatus() {
    const enabled = await this.settingsService.getOrderingStatus();
    return { enabled };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch('ordering-status')
  async updateOrderingStatus(@Body('enabled') enabled: boolean) {
    await this.settingsService.setOrderingStatus(enabled);
    return { enabled };
  }
}
