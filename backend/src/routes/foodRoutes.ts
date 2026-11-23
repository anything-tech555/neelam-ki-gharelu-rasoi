import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/storage';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { FoodItem, Category } from '../types/shared';

export const foodRouter = Router();

// ================== CATEGORIES ==================

// GET all categories
foodRouter.get('/categories', (_req, res: Response) => {
  const categories = db.get('categories') || [];
  return res.json({ success: true, categories: categories.sort((a, b) => a.displayOrder - b.displayOrder) });
});

// Admin: Create category
foodRouter.post('/categories', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { name, hindiName, description, icon, displayOrder } = req.body;
  if (!name || !hindiName) {
    return res.status(400).json({ success: false, message: 'Category English & Hindi names are required.' });
  }

  const newCat: Category = {
    id: `cat-${uuidv4().substring(0, 8)}`,
    name: name.trim(),
    hindiName: hindiName.trim(),
    description: description ? description.trim() : undefined,
    icon: icon || 'Utensils',
    displayOrder: displayOrder !== undefined ? Number(displayOrder) : 99,
    isActive: true
  };

  db.mutate(data => {
    data.categories.push(newCat);
  });

  return res.status(201).json({ success: true, message: 'Category created.', category: newCat });
});

// Admin: Update category
foodRouter.put('/categories/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const catId = req.params.id;
  const { name, hindiName, description, icon, displayOrder, isActive } = req.body;

  let updated: Category | null = null;

  db.mutate(data => {
    const idx = data.categories.findIndex(c => c.id === catId);
    if (idx !== -1) {
      if (name) data.categories[idx].name = name.trim();
      if (hindiName) data.categories[idx].hindiName = hindiName.trim();
      if (description !== undefined) data.categories[idx].description = description.trim();
      if (icon !== undefined) data.categories[idx].icon = icon;
      if (displayOrder !== undefined) data.categories[idx].displayOrder = Number(displayOrder);
      if (isActive !== undefined) data.categories[idx].isActive = Boolean(isActive);
      updated = data.categories[idx];
    }
  });

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Category not found.' });
  }

  return res.json({ success: true, message: 'Category updated.', category: updated });
});

// Admin: Delete category
foodRouter.delete('/categories/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const catId = req.params.id;

  db.mutate(data => {
    data.categories = data.categories.filter(c => c.id !== catId);
  });

  return res.json({ success: true, message: 'Category removed.' });
});

// ================== FOOD ITEMS ==================

// GET all food items (with search, category filter, etc.)
foodRouter.get('/items', (req, res: Response) => {
  const { categoryId, search, isSpecial, isFeatured, availableOnly } = req.query;
  let items = db.get('foodItems') || [];

  if (categoryId) {
    items = items.filter(i => i.categoryId === categoryId);
  }

  if (isSpecial === 'true') {
    items = items.filter(i => i.isSpecial);
  }

  if (isFeatured === 'true') {
    items = items.filter(i => i.isFeatured);
  }

  if (availableOnly === 'true') {
    items = items.filter(i => i.isAvailable);
  }

  if (search) {
    const q = String(search).toLowerCase().trim();
    items = items.filter(
      i =>
        i.name.toLowerCase().includes(q) ||
        (i.hindiName && i.hindiName.includes(q)) ||
        i.description.toLowerCase().includes(q) ||
        (i.hindiDescription && i.hindiDescription.includes(q))
    );
  }

  items.sort((a, b) => a.displayOrder - b.displayOrder);

  return res.json({ success: true, count: items.length, foodItems: items });
});

// GET single food item
foodRouter.get('/items/:id', (req, res: Response) => {
  const items = db.get('foodItems') || [];
  const item = items.find(i => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Food item not found.' });
  }
  return res.json({ success: true, foodItem: item });
});

// Admin: Create food item
foodRouter.post('/items', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name,
      hindiName,
      description,
      hindiDescription,
      price,
      discountPrice,
      categoryId,
      imageUrl,
      galleryImages,
      isAvailable,
      isFeatured,
      isSpecial,
      prepTimeMinutes,
      displayOrder
    } = req.body;

    if (!name || price === undefined || !categoryId) {
      return res.status(400).json({ success: false, message: 'Item name, price, and category are required.' });
    }

    const categories = db.get('categories') || [];
    const cat = categories.find(c => c.id === categoryId);

    const mainImg = imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80';

    const newItem: FoodItem = {
      id: `food-${uuidv4().substring(0, 8)}`,
      name: name.trim(),
      hindiName: hindiName ? hindiName.trim() : undefined,
      description: description ? description.trim() : '',
      hindiDescription: hindiDescription ? hindiDescription.trim() : undefined,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      categoryId,
      categoryName: cat ? cat.name : undefined,
      imageUrl: mainImg,
      galleryImages: Array.isArray(galleryImages) && galleryImages.length > 0 ? galleryImages : [mainImg],
      isVeg: true, // Neelam Ki Gharelu Rasoi is 100% pure vegetarian
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      isFeatured: Boolean(isFeatured),
      isSpecial: Boolean(isSpecial),
      prepTimeMinutes: prepTimeMinutes ? Number(prepTimeMinutes) : 20,
      rating: 5.0,
      ratingCount: 1,
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : 50,
      createdAt: new Date().toISOString()
    };

    db.mutate(data => {
      data.foodItems.push(newItem);
    });

    return res.status(201).json({ success: true, message: 'Dish added to menu.', foodItem: newItem });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create food item.' });
  }
});

// Admin: Update food item
foodRouter.put('/items/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const itemId = req.params.id;
  const updates = req.body;

  let updatedItem: FoodItem | null = null;

  db.mutate(data => {
    const idx = data.foodItems.findIndex(i => i.id === itemId);
    if (idx !== -1) {
      const current = data.foodItems[idx];
      let catName = current.categoryName;
      if (updates.categoryId && updates.categoryId !== current.categoryId) {
        const cat = data.categories.find(c => c.id === updates.categoryId);
        if (cat) catName = cat.name;
      }

      data.foodItems[idx] = {
        ...current,
        name: updates.name ? updates.name.trim() : current.name,
        hindiName: updates.hindiName !== undefined ? updates.hindiName.trim() : current.hindiName,
        description: updates.description !== undefined ? updates.description.trim() : current.description,
        hindiDescription: updates.hindiDescription !== undefined ? updates.hindiDescription.trim() : current.hindiDescription,
        price: updates.price !== undefined ? Number(updates.price) : current.price,
        discountPrice: updates.discountPrice !== undefined ? (updates.discountPrice ? Number(updates.discountPrice) : undefined) : current.discountPrice,
        categoryId: updates.categoryId || current.categoryId,
        categoryName: catName,
        imageUrl: updates.imageUrl || current.imageUrl,
        galleryImages: Array.isArray(updates.galleryImages)
          ? updates.galleryImages
          : (updates.imageUrl ? [updates.imageUrl] : current.galleryImages),
        isAvailable: updates.isAvailable !== undefined ? Boolean(updates.isAvailable) : current.isAvailable,
        isFeatured: updates.isFeatured !== undefined ? Boolean(updates.isFeatured) : current.isFeatured,
        isSpecial: updates.isSpecial !== undefined ? Boolean(updates.isSpecial) : current.isSpecial,
        prepTimeMinutes: updates.prepTimeMinutes !== undefined ? Number(updates.prepTimeMinutes) : current.prepTimeMinutes,
        displayOrder: updates.displayOrder !== undefined ? Number(updates.displayOrder) : current.displayOrder
      };
      updatedItem = data.foodItems[idx];
    }
  });

  if (!updatedItem) {
    return res.status(404).json({ success: false, message: 'Food item not found.' });
  }

  return res.json({ success: true, message: 'Dish updated.', foodItem: updatedItem });
});

// Admin: Quick Availability toggle
foodRouter.patch('/items/:id/availability', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const itemId = req.params.id;
  let newStatus: boolean | null = null;

  db.mutate(data => {
    const item = data.foodItems.find(i => i.id === itemId);
    if (item) {
      item.isAvailable = !item.isAvailable;
      newStatus = item.isAvailable;
    }
  });

  if (newStatus === null) {
    return res.status(404).json({ success: false, message: 'Item not found.' });
  }

  return res.json({ success: true, isAvailable: newStatus, message: `Item marked as ${newStatus ? 'available' : 'unavailable'}.` });
});

// Admin: Delete food item
foodRouter.delete('/items/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const itemId = req.params.id;

  db.mutate(data => {
    data.foodItems = data.foodItems.filter(i => i.id !== itemId);
  });

  return res.json({ success: true, message: 'Dish removed from menu.' });
});
