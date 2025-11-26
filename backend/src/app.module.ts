import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MenuModule } from './menu/menu.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'dpg-d4ipeuc9c44c73b1pdd0-a',
      port: 5432,
      username: 'dattx',
      password: 'AE5brJEkOC6T5onvJiOxWQC5KhuKN9CR',
      database: 'lunch_order_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Auto-create tables (only for development)
      logging: true,
    }),
    AuthModule,
    UsersModule,
    MenuModule,
    OrdersModule,
  ],
})
export class AppModule {}
