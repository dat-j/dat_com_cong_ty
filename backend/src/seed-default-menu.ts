import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MenuService } from './menu/menu.service';

async function seedDefaultMenu() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const menuService = app.get(MenuService);

  const defaultMenuItems = [
    { name: 'Cơm Gà Sốt Mắm Tỏi (nhỏ)', price: 35 },
    { name: 'Cơm Gà Sốt Mắm Tỏi (to)', price: 45 },
    { name: 'Cơm Gà Sốt Me (nhỏ)', price: 35 },
    { name: 'Cơm Gà Sốt Me (to)', price: 45 },
    { name: 'Cơm Gà Sốt Hành (nhỏ)', price: 35 },
    { name: 'Cơm Gà Sốt Hành (to)', price: 45 },
    { name: 'Cơm Thịt Heo Xá Xíu', price: 35 },
    { name: 'Cơm Gà Chiên Mắm', price: 35 },
    { name: 'Cơm Thịt Ba Chỉ Rang', price: 35 },
    { name: 'Cơm Thịt Chưng Mắm Tép', price: 35 },
    { name: 'Cơm Thịt Kho Tàu', price: 35 },
    { name: 'Cơm Sườn', price: 45 },
    { name: 'Cơm Cá Basa Kho Tộ', price: 35 },
    { name: 'Cơm Chiên Thập Cẩm', price: 35 },
    { name: 'Cơm Chiên Dưa Bỏ', price: 35 },
    { name: 'Cơm Chiên Cá Bò', price: 35 },
  ];

  try {
    console.log('🍱 Creating default menu items...');
    
    for (const item of defaultMenuItems) {
      await menuService['menuRepository'].save({
        name: item.name,
        price: item.price,
        date: new Date(),
        isAvailable: true,
        isDefaultMenu: true,
      });
      console.log(`  ✓ Added: ${item.name} - ${item.price}k`);
    }

    console.log('\n✅ Default menu created successfully!');
    console.log(`📋 Total items: ${defaultMenuItems.length}`);
  } catch (error) {
    console.error('Error seeding default menu:', error);
  } finally {
    await app.close();
  }
}

seedDefaultMenu();
