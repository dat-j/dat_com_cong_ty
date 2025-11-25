import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { UserRole } from './users/user.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  try {
    // Check if admin already exists
    const existingAdmin = await usersService.findByUsername('admin');
    
    if (existingAdmin) {
      console.log('✓ Admin user already exists');
    } else {
      // Create admin user
      await usersService.create('admin', 'admin123', 'Administrator', UserRole.ADMIN);
      console.log('✓ Admin user created successfully');
      console.log('  Username: admin');
      console.log('  Password: admin123');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await app.close();
  }
}

seed();
