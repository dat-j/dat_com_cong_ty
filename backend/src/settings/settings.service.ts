import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from './settings.entity';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(Settings)
    private settingsRepository: Repository<Settings>,
  ) {}

  async onModuleInit() {
    await this.ensureDefaultSettings();
  }

  async ensureDefaultSettings() {
    const orderingEnabledSetting = await this.settingsRepository.findOne({
      where: { key: 'ordering_enabled' },
    });

    if (!orderingEnabledSetting) {
      await this.settingsRepository.save({
        key: 'ordering_enabled',
        value: 'true',
      });
    }
  }

  async getOrderingStatus(): Promise<boolean> {
    const setting = await this.settingsRepository.findOne({
      where: { key: 'ordering_enabled' },
    });
    return setting?.value === 'true';
  }

  async setOrderingStatus(enabled: boolean): Promise<void> {
    const setting = await this.settingsRepository.findOne({
      where: { key: 'ordering_enabled' },
    });

    if (setting) {
      setting.value = enabled.toString();
      await this.settingsRepository.save(setting);
    } else {
      await this.settingsRepository.save({
        key: 'ordering_enabled',
        value: enabled.toString(),
      });
    }
  }
}
