import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';

export const DEMO_USER_EMAIL = 'demo-visitor@dinedesk.invalid';
const DEMO_RESTAURANT_ID = 'dinedesk-demo-restaurant';

const categories = [
  { id: 'dinedesk-demo-category-starters', name: 'Starters', description: 'Small plates and appetizers' },
  { id: 'dinedesk-demo-category-mains', name: 'Main Course', description: 'Kitchen favorites and hearty meals' },
  { id: 'dinedesk-demo-category-drinks', name: 'Drinks & Desserts', description: 'Refreshing drinks and sweet finishes' },
];

const tables = [
  { id: 'dinedesk-demo-table-1', tableNumber: 1, seats: 2 },
  { id: 'dinedesk-demo-table-2', tableNumber: 2, seats: 4 },
  { id: 'dinedesk-demo-table-3', tableNumber: 3, seats: 4 },
  { id: 'dinedesk-demo-table-4', tableNumber: 4, seats: 6 },
  { id: 'dinedesk-demo-table-5', tableNumber: 5, seats: 2 },
];

const menuItems = [
  { id: 'dinedesk-demo-item-paneer', name: 'Tandoori Paneer Tikka', categoryId: categories[0].id, price: '280.00', description: 'Char-grilled paneer with peppers and house spices', prepTimeMinutes: 18 },
  { id: 'dinedesk-demo-item-dosa', name: 'Masala Dosa', categoryId: categories[1].id, price: '190.00', description: 'Crisp dosa with potato masala, sambar and chutneys', prepTimeMinutes: 15 },
  { id: 'dinedesk-demo-item-butter-chicken', name: 'Butter Chicken', categoryId: categories[1].id, price: '390.00', description: 'Slow-cooked chicken in a creamy tomato gravy', prepTimeMinutes: 25 },
  { id: 'dinedesk-demo-item-lassi', name: 'Mango Lassi', categoryId: categories[2].id, price: '100.00', description: 'Chilled yogurt drink blended with ripe mango', prepTimeMinutes: 5 },
  { id: 'dinedesk-demo-item-jalebi', name: 'Warm Jalebi', categoryId: categories[2].id, price: '120.00', description: 'Crisp spirals finished with saffron syrup', prepTimeMinutes: 10 },
];

const menuById = Object.fromEntries(menuItems.map((item) => [item.id, item]));

const sampleOrders = [
  {
    id: 'dinedesk-demo-order-1004', orderNumber: 'DEMO-1004', orderType: 'DINE_IN', status: 'PREPARING',
    customerName: 'Aarav Sharma', tableNumber: 2, paymentStatus: 'UNPAID', paymentMethod: null,
    items: [{ menuItemId: 'dinedesk-demo-item-paneer', quantity: 1 }, { menuItemId: 'dinedesk-demo-item-lassi', quantity: 2 }],
  },
  {
    id: 'dinedesk-demo-order-1003', orderNumber: 'DEMO-1003', orderType: 'TAKEAWAY', status: 'READY',
    customerName: 'Meera Patel', tableNumber: null, paymentStatus: 'PAID', paymentMethod: 'UPI',
    items: [{ menuItemId: 'dinedesk-demo-item-dosa', quantity: 2 }, { menuItemId: 'dinedesk-demo-item-lassi', quantity: 1 }],
  },
  {
    id: 'dinedesk-demo-order-1002', orderNumber: 'DEMO-1002', orderType: 'DINE_IN', status: 'COMPLETED',
    customerName: 'Kabir Rao', tableNumber: 1, paymentStatus: 'PAID', paymentMethod: 'CARD',
    items: [{ menuItemId: 'dinedesk-demo-item-butter-chicken', quantity: 1 }, { menuItemId: 'dinedesk-demo-item-dosa', quantity: 1 }],
  },
  {
    id: 'dinedesk-demo-order-1001', orderNumber: 'DEMO-1001', orderType: 'DELIVERY', status: 'PLACED',
    customerName: 'Ananya Shah', tableNumber: null, paymentStatus: 'UNPAID', paymentMethod: null,
    items: [{ menuItemId: 'dinedesk-demo-item-paneer', quantity: 1 }, { menuItemId: 'dinedesk-demo-item-jalebi', quantity: 2 }],
  },
];

async function seedDemoWorkspace(tx, demoUser) {
  const restaurant = await tx.restaurant.upsert({
    where: { id: DEMO_RESTAURANT_ID },
    create: {
      id: DEMO_RESTAURANT_ID,
      name: 'DineDesk Demo Bistro',
      address: '42 Market Street, Bengaluru',
      phone: '+91 80 5555 0100',
    },
    update: {
      name: 'DineDesk Demo Bistro',
      address: '42 Market Street, Bengaluru',
      phone: '+91 80 5555 0100',
    },
  });

  for (const category of categories) {
    await tx.menuCategory.upsert({
      where: { restaurantId_name: { restaurantId: restaurant.id, name: category.name } },
      create: { ...category, restaurantId: restaurant.id },
      update: { description: category.description },
    });
  }

  for (const table of tables) {
    await tx.diningTable.upsert({
      where: { restaurantId_tableNumber: { restaurantId: restaurant.id, tableNumber: table.tableNumber } },
      create: { ...table, restaurantId: restaurant.id },
      update: { seats: table.seats, isActive: true },
    });
  }

  for (const item of menuItems) {
    await tx.menuItem.upsert({
      where: { id: item.id },
      create: { ...item, restaurantId: restaurant.id, isAvailable: true },
      update: {
        name: item.name,
        categoryId: item.categoryId,
        price: item.price,
        description: item.description,
        prepTimeMinutes: item.prepTimeMinutes,
        restaurantId: restaurant.id,
        isAvailable: true,
      },
    });
  }

  for (const sample of sampleOrders) {
    const orderItems = sample.items.map(({ menuItemId, quantity }) => {
      const item = menuById[menuItemId];
      const lineTotal = Number(item.price) * quantity;
      return {
        itemName: item.name,
        menuItemId,
        quantity,
        unitPrice: item.price,
        lineTotal: lineTotal.toFixed(2),
      };
    });
    const subtotal = orderItems.reduce((total, item) => total + Number(item.lineTotal), 0);
    const tax = Number((subtotal * 0.05).toFixed(2));

    await tx.order.upsert({
      where: { restaurantId_orderNumber: { restaurantId: restaurant.id, orderNumber: sample.orderNumber } },
      create: {
        id: sample.id,
        orderNumber: sample.orderNumber,
        customerName: sample.customerName,
        orderType: sample.orderType,
        status: sample.status,
        paymentStatus: sample.paymentStatus,
        paymentMethod: sample.paymentMethod,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        discount: '0.00',
        total: (subtotal + tax).toFixed(2),
        restaurantId: restaurant.id,
        tableId: sample.tableNumber ? tables[sample.tableNumber - 1].id : null,
        createdById: demoUser.id,
        notes: 'Sample order for the DineDesk demo workspace.',
        items: { create: orderItems },
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: sample.status,
            note: 'Sample order status',
            changedById: demoUser.id,
          },
        },
      },
      update: {},
    });
  }

  return restaurant;
}

export async function ensureDemoAccount() {
  const existingUser = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
    select: { id: true, restaurantId: true, password: true },
  });

  if (existingUser && existingUser.restaurantId !== DEMO_RESTAURANT_ID) {
    const error = new Error('Demo access is temporarily unavailable.');
    error.status = 503;
    throw error;
  }

  const password = existingUser?.password || await bcrypt.hash(randomBytes(48).toString('base64url'), 10);

  return prisma.$transaction(async (tx) => {
    const restaurant = await tx.restaurant.upsert({
      where: { id: DEMO_RESTAURANT_ID },
      create: {
        id: DEMO_RESTAURANT_ID,
        name: 'DineDesk Demo Bistro',
        address: '42 Market Street, Bengaluru',
        phone: '+91 80 5555 0100',
      },
      update: {},
    });

    const demoUser = await tx.user.upsert({
      where: { email: DEMO_USER_EMAIL },
      create: {
        name: 'Demo Visitor',
        email: DEMO_USER_EMAIL,
        password,
        role: 'MANAGER',
        isActive: true,
        restaurantId: restaurant.id,
      },
      update: {
        name: 'Demo Visitor',
        role: 'MANAGER',
        isActive: true,
        restaurantId: restaurant.id,
      },
      include: { restaurant: true },
    });

    await seedDemoWorkspace(tx, demoUser);
    return demoUser;
  }, { timeout: 20000, maxWait: 10000 });
}
