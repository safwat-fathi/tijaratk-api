import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { StoreCategory } from './entities/store-category.entity';

/**
 * Seed data for store categories.
 * These are top-level categories only (no sub-categories).
 * Sub-categories can be added later via parent_id if needed.
 */
export const seedStoreCategories = async (dataSource: DataSource) => {
  const logger = new Logger('SeedStoreCategories');
  const categoryRepository = dataSource.getRepository(StoreCategory);

  const categories = [
    {
      key: 'grocery',
      name_en: 'Grocery & Supermarket',
      name_ar: 'البقالة والسوبر ماركت',
      icon: 'shopping-cart',
      sort_order: 1,
    },
    {
      key: 'restaurants',
      name_en: 'Restaurants & Cafes',
      name_ar: 'المطاعم والكافيهات',
      icon: 'utensils',
      sort_order: 2,
    },
    {
      key: 'fashion',
      name_en: 'Fashion & Clothing',
      name_ar: 'الأزياء والملابس',
      icon: 'shirt',
      sort_order: 3,
    },
    {
      key: 'shoes_bags',
      name_en: 'Shoes, Bags & Accessories',
      name_ar: 'الأحذية والشنط والإكسسوارات',
      icon: 'shopping-bag',
      sort_order: 4,
    },
    {
      key: 'beauty',
      name_en: 'Beauty & Personal Care',
      name_ar: 'الجمال والعناية الشخصية',
      icon: 'sparkles',
      sort_order: 5,
    },
    {
      key: 'pharmacy',
      name_en: 'Pharmacy & Health',
      name_ar: 'الصيدلية والصحة',
      icon: 'pill',
      sort_order: 6,
    },
    {
      key: 'home_living',
      name_en: 'Home & Living',
      name_ar: 'المنزل والمعيشة',
      icon: 'home',
      sort_order: 7,
    },
    {
      key: 'furniture',
      name_en: 'Furniture & Decor',
      name_ar: 'الأثاث والديكور',
      icon: 'sofa',
      sort_order: 8,
    },
    {
      key: 'electronics',
      name_en: 'Electronics & Gadgets',
      name_ar: 'الإلكترونيات والأجهزة',
      icon: 'smartphone',
      sort_order: 9,
    },
    {
      key: 'jewelry',
      name_en: 'Jewelry & Accessories',
      name_ar: 'المجوهرات والإكسسوارات',
      icon: 'gem',
      sort_order: 10,
    },
    {
      key: 'handmade',
      name_en: 'Handmade & Crafts',
      name_ar: 'المنتجات اليدوية والحرف',
      icon: 'scissors',
      sort_order: 11,
    },
    {
      key: 'food',
      name_en: 'Homemade Food & Beverages',
      name_ar: 'الأكل البيتي والمشروبات',
      icon: 'chef-hat',
      sort_order: 12,
    },
    {
      key: 'bakery',
      name_en: 'Bakery & Desserts',
      name_ar: 'المخبوزات والحلويات',
      icon: 'cake',
      sort_order: 13,
    },
    {
      key: 'kids',
      name_en: 'Kids & Baby',
      name_ar: 'الأطفال والرضع',
      icon: 'baby',
      sort_order: 14,
    },
    {
      key: 'toys',
      name_en: 'Toys & Games',
      name_ar: 'الألعاب',
      icon: 'gamepad-2',
      sort_order: 15,
    },
    {
      key: 'fitness',
      name_en: 'Fitness & Health',
      name_ar: 'اللياقة والصحة',
      icon: 'dumbbell',
      sort_order: 16,
    },
    {
      key: 'sports',
      name_en: 'Sports & Outdoors',
      name_ar: 'الرياضة والأنشطة الخارجية',
      icon: 'trophy',
      sort_order: 17,
    },
    {
      key: 'pets',
      name_en: 'Pets',
      name_ar: 'الحيوانات الأليفة',
      icon: 'paw-print',
      sort_order: 18,
    },
    {
      key: 'automotive',
      name_en: 'Automotive',
      name_ar: 'السيارات وملحقاتها',
      icon: 'car',
      sort_order: 19,
    },
    {
      key: 'books',
      name_en: 'Books & Stationery',
      name_ar: 'الكتب والأدوات المكتبية',
      icon: 'book',
      sort_order: 20,
    },
    {
      key: 'gifts',
      name_en: 'Gifts & Flowers',
      name_ar: 'الهدايا والورود',
      icon: 'gift',
      sort_order: 21,
    },
    {
      key: 'digital',
      name_en: 'Digital Products',
      name_ar: 'المنتجات الرقمية',
      icon: 'download',
      sort_order: 22,
    },
    {
      key: 'travel',
      name_en: 'Travel & Tourism',
      name_ar: 'السفر والسياحة',
      icon: 'plane',
      sort_order: 23,
    },
    {
      key: 'services',
      name_en: 'Services',
      name_ar: 'الخدمات',
      icon: 'briefcase',
      sort_order: 24,
    },
    {
      key: 'other',
      name_en: 'Other',
      name_ar: 'أخرى',
      icon: 'more-horizontal',
      sort_order: 25,
    },
  ];

  for (const categoryData of categories) {
    const existing = await categoryRepository.findOne({
      where: { key: categoryData.key },
    });

    if (existing) {
      logger.log(`StoreCategory ${categoryData.key} already exists. Skipping...`);
      continue;
    }

    const category = categoryRepository.create(categoryData);
    await categoryRepository.save(category);
    logger.log(`StoreCategory ${categoryData.key} created.`);
  }
};
