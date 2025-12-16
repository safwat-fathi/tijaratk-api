import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Category } from './entities/category.entity';

export const seedCategories = async (dataSource: DataSource) => {
  const logger = new Logger('SeedCategories');
  const categoryRepository = dataSource.getRepository(Category);

  const categories = [
    {
      key: 'fashion',
      name_en: 'Fashion & Clothing',
      name_ar: 'الأزياء والملابس',
      suggested_sub_categories: [
        { name_en: 'Women’s Clothing', name_ar: 'ملابس حريمي' },
        { name_en: 'Men’s Clothing', name_ar: 'ملابس رجالي' },
        { name_en: 'Kids & Baby Clothing', name_ar: 'ملابس أطفال' },
        { name_en: 'Modest Wear / Hijab', name_ar: 'ملابس محجبات' },
        { name_en: 'Sportswear', name_ar: 'ملابس رياضية' },
        { name_en: 'Accessories', name_ar: 'إكسسوارات' },
      ],
    },
    {
      key: 'shoes_bags',
      name_en: 'Shoes, Bags & Accessories',
      name_ar: 'الأحذية والشنط والإكسسوارات',
      suggested_sub_categories: [
        { name_en: 'Women’s Shoes', name_ar: 'أحذية حريمي' },
        { name_en: 'Men’s Shoes', name_ar: 'أحذية رجالي' },
        { name_en: 'Kids Shoes', name_ar: 'أحذية أطفال' },
        { name_en: 'Handbags', name_ar: 'شنط حريمي' },
        { name_en: 'Backpacks', name_ar: 'حقائب ظهر' },
        { name_en: 'Wallets', name_ar: 'محافظ' },
        { name_en: 'Watches & Jewelry', name_ar: 'ساعات ومجوهرات' },
      ],
    },
    {
      key: 'beauty',
      name_en: 'Beauty & Personal Care',
      name_ar: 'الجمال والعناية الشخصية',
      suggested_sub_categories: [
        { name_en: 'Skin Care', name_ar: 'العناية بالبشرة' },
        { name_en: 'Makeup', name_ar: 'مكياج' },
        { name_en: 'Hair Care', name_ar: 'العناية بالشعر' },
        { name_en: 'Perfumes', name_ar: 'عطور' },
        { name_en: 'Personal Hygiene', name_ar: 'العناية الشخصية' },
        { name_en: 'Beauty Tools', name_ar: 'أدوات التجميل' },
      ],
    },
    {
      key: 'home_living',
      name_en: 'Home & Living',
      name_ar: 'المنزل والمعيشة',
      suggested_sub_categories: [
        { name_en: 'Home Decor', name_ar: 'ديكور' },
        { name_en: 'Kitchen Tools', name_ar: 'أدوات مطبخ' },
        { name_en: 'Bedding', name_ar: 'مفروشات' },
        { name_en: 'Storage & Organization', name_ar: 'تخزين وتنظيم' },
        { name_en: 'Handmade Home Items', name_ar: 'ديكور يدوي' },
        { name_en: 'Small Furniture', name_ar: 'أثاث صغير' },
      ],
    },
    {
      key: 'electronics',
      name_en: 'Electronics & Gadgets',
      name_ar: 'الإلكترونيات والأجهزة',
      suggested_sub_categories: [
        { name_en: 'Mobile Accessories', name_ar: 'إكسسوارات موبايل' },
        { name_en: 'Smart Devices', name_ar: 'أجهزة ذكية' },
        { name_en: 'Headphones & Audio', name_ar: 'سماعات وصوتيات' },
        { name_en: 'Computer Accessories', name_ar: 'إكسسوارات كمبيوتر' },
        { name_en: 'Gaming Accessories', name_ar: 'إكسسوارات ألعاب' },
        { name_en: 'Wearables', name_ar: 'ساعات ذكية' },
      ],
    },
    {
      key: 'jewelry',
      name_en: 'Jewelry & Accessories',
      name_ar: 'المجوهرات والإكسسوارات',
      suggested_sub_categories: [
        { name_en: 'Silver', name_ar: 'فضة' },
        { name_en: 'Gold-Plated', name_ar: 'ذهب صيني' },
        { name_en: 'Custom Name Jewelry', name_ar: 'اسماء مخصصة' },
        { name_en: 'Handmade Jewelry', name_ar: 'مجوهرات يدوية' },
        { name_en: 'Fashion Jewelry', name_ar: 'إكسسوارات' },
      ],
    },
    {
      key: 'handmade',
      name_en: 'Handmade & Crafts',
      name_ar: 'المنتجات اليدوية والحرف',
      suggested_sub_categories: [
        { name_en: 'Crochet', name_ar: 'كروشيه' },
        { name_en: 'Resin Art', name_ar: 'ريزن' },
        { name_en: 'Custom Gifts', name_ar: 'هدايا مخصصة' },
        { name_en: 'Art Prints', name_ar: 'لوحات فنية' },
        { name_en: 'Pottery', name_ar: 'خزف' },
        { name_en: 'Handmade Decor', name_ar: 'ديكور يدوي' },
      ],
    },
    {
      key: 'food',
      name_en: 'Food & Beverages',
      name_ar: 'الأطعمة والمشروبات',
      suggested_sub_categories: [
        { name_en: 'Homemade Food', name_ar: 'أكل بيتي' },
        { name_en: 'Desserts', name_ar: 'حلويات' },
        { name_en: 'Healthy Foods', name_ar: 'أكل صحي' },
        { name_en: 'Coffee & Drinks', name_ar: 'مشروبات' },
        { name_en: 'Spices', name_ar: 'توابل' },
        { name_en: 'Snacks', name_ar: 'سناكس' },
      ],
    },
    {
      key: 'kids',
      name_en: 'Kids & Baby',
      name_ar: 'الأطفال والرضع',
      suggested_sub_categories: [
        { name_en: 'Baby Essentials', name_ar: 'مستلزمات رضع' },
        { name_en: 'Toys', name_ar: 'ألعاب' },
        { name_en: 'Kids Clothing', name_ar: 'ملابس أطفال' },
        { name_en: 'School Supplies', name_ar: 'مستلزمات مدارس' },
        { name_en: 'Party Supplies', name_ar: 'مستلزمات حفلات' },
      ],
    },
    {
      key: 'fitness',
      name_en: 'Fitness & Health',
      name_ar: 'اللياقة والصحة',
      suggested_sub_categories: [
        { name_en: 'Supplements', name_ar: 'مكملات غذائية' },
        { name_en: 'Gym Gear', name_ar: 'أدوات رياضية' },
        { name_en: 'Sports Equipment', name_ar: 'معدات رياضية' },
        { name_en: 'Healthy Snacks', name_ar: 'وجبات صحية' },
      ],
    },
    {
      key: 'pets',
      name_en: 'Pets',
      name_ar: 'الحيوانات الأليفة',
      suggested_sub_categories: [
        { name_en: 'Pet Food', name_ar: 'طعام الحيوانات' },
        { name_en: 'Pet Accessories', name_ar: 'مستلزمات الحيوانات' },
        { name_en: 'Pet Care', name_ar: 'العناية بالحيوانات' },
        { name_en: 'Birds / Aquarium', name_ar: 'طيور وأسماك' },
      ],
    },
    {
      key: 'automotive',
      name_en: 'Automotive',
      name_ar: 'السيارات وملحقاتها',
      suggested_sub_categories: [
        { name_en: 'Car Accessories', name_ar: 'إكسسوارات سيارات' },
        { name_en: 'Car Care', name_ar: 'العناية بالسيارة' },
        { name_en: 'Oils & Tools', name_ar: 'زيوت وأدوات' },
      ],
    },
    {
      key: 'books',
      name_en: 'Books & Stationery',
      name_ar: 'الكتب والأدوات المكتبية',
      suggested_sub_categories: [
        { name_en: 'Books', name_ar: 'كتب' },
        { name_en: 'Notebooks', name_ar: 'دفاتر' },
        { name_en: 'Art Supplies', name_ar: 'أدوات رسم' },
        { name_en: 'Office Supplies', name_ar: 'مكتبات' },
      ],
    },
    {
      key: 'services',
      name_en: 'Services',
      name_ar: 'الخدمات',
      suggested_sub_categories: [
        { name_en: 'Graphic Design', name_ar: 'تصميم جرافيك' },
        { name_en: 'Photography', name_ar: 'تصوير' },
        { name_en: 'Marketing', name_ar: 'تسويق' },
        { name_en: 'Fitness Coaching', name_ar: 'تدريب' },
        { name_en: 'Beauty Services', name_ar: 'خدمات تجميل' },
        { name_en: 'Tailoring', name_ar: 'تفصيل وخياطة' },
      ],
    },
  ];

  for (const categoryData of categories) {
    const existing = await categoryRepository.findOne({
      where: { key: categoryData.key },
    });

    if (existing) {
      logger.log(`Category ${categoryData.key} already exists. Skipping...`);
      continue;
    }

    const category = categoryRepository.create(categoryData);
    await categoryRepository.save(category);
    logger.log(`Category ${categoryData.key} created.`);
  }
};
