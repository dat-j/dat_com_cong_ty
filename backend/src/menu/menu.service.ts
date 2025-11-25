import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from './menu-item.entity';
import { CreateMenuItemDto, CreateMenuItemsDto, UpdateMenuItemDto } from './dto/menu.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuItem)
    private menuRepository: Repository<MenuItem>,
  ) {}

  async getTodayMenu(): Promise<MenuItem[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get both default menu items and today's special items
    return this.menuRepository.find({
      where: [
        { isDefaultMenu: true, isAvailable: true },
        { date: today, isAvailable: true, isDefaultMenu: false }
      ],
      order: { isDefaultMenu: 'DESC', name: 'ASC' }
    });
  }

  async getMenuByDate(date: Date): Promise<MenuItem[]> {
    const searchDate = new Date(date);
    searchDate.setHours(0, 0, 0, 0);
    
    return this.menuRepository.find({
      where: {
        date: searchDate,
      },
    });
  }

  async createMenuItem(createMenuItemDto: CreateMenuItemDto): Promise<MenuItem> {
    const date = createMenuItemDto.date ? new Date(createMenuItemDto.date) : new Date();
    date.setHours(0, 0, 0, 0);
    
    const menuItem = this.menuRepository.create({
      name: createMenuItemDto.name,
      price: createMenuItemDto.price,
      date,
    });

    return this.menuRepository.save(menuItem);
  }

  async createMenuItems(createMenuItemsDto: CreateMenuItemsDto): Promise<MenuItem[]> {
    const date = createMenuItemsDto.date ? new Date(createMenuItemsDto.date) : new Date();
    date.setHours(0, 0, 0, 0);
    
    const menuItems = createMenuItemsDto.items.map(item => 
      this.menuRepository.create({
        name: item.name,
        price: item.price,
        date,
      })
    );

    return this.menuRepository.save(menuItems);
  }

  async updateMenuItem(id: string, updateMenuItemDto: UpdateMenuItemDto): Promise<MenuItem | null> {
    await this.menuRepository.update(id, updateMenuItemDto);
    return this.menuRepository.findOne({ where: { id } });
  }

  async deleteMenuItem(id: string): Promise<void> {
    await this.menuRepository.delete(id);
  }

  async findById(id: string): Promise<MenuItem | null> {
    return this.menuRepository.findOne({ where: { id } });
  }
}
