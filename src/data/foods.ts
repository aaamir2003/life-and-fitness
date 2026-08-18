import type { FoodItem } from '../types';

const F = (
  id: string, name: string, fa: string, cat: string, serving: number,
  kcal: number, p: number, c: number, f: number, kw: string[] = [],
): FoodItem => ({ id, name, fa, cat, serving, kw, per100: { kcal, p, c, f } });

export const FOOD_CATEGORIES: Record<string, string> = {
  traditional: 'Traditional',
  fast: 'Fast Food',
  staple: 'Staples & Grains',
  protein: 'Protein',
  dairy: 'Dairy',
  fruit: 'Fruits',
  snack: 'Snacks & Sweets',
  drink: 'Drinks',
};

export const FOODS: FoodItem[] = [
  // Traditional Persian
  F('ghormeh', 'Ghormeh Sabzi', 'خورش قورمه‌سبزی', 'traditional', 250, 120, 8, 7, 7, ['ghorme', 'ghormeh', 'herb stew']),
  F('gheymeh', 'Gheymeh Stew', 'خورش قیمه', 'traditional', 250, 135, 9, 8, 8, ['gheime', 'ghayme']),
  F('fesenjan', 'Fesenjan', 'خورش فسنجان', 'traditional', 250, 240, 10, 12, 17, ['fesenjoon']),
  F('koobideh-rice', 'Chelo Kabab Koobideh', 'چلوکباب کوبیده', 'traditional', 350, 185, 12, 21, 6, ['chelo kabab', 'kabab rice']),
  F('koobideh', 'Kabab Koobideh', 'کباب کوبیده', 'traditional', 150, 250, 17, 2, 20, ['koobide', 'kabab']),
  F('joojeh', 'Joojeh Kabab', 'جوجه‌کباب', 'traditional', 200, 165, 22, 2, 8, ['jooje', 'chicken kabab']),
  F('barg', 'Kabab Barg', 'کباب برگ', 'traditional', 150, 210, 20, 1, 14, []),
  F('zereshk', 'Zereshk Polo ba Morgh', 'زرشک‌پلو با مرغ', 'traditional', 350, 180, 10, 25, 5, ['zereshk polo', 'barberry']),
  F('tahchin', 'Tahchin Morgh', 'ته‌چین مرغ', 'traditional', 250, 205, 9, 24, 9, []),
  F('baghali', 'Baghali Polo', 'باقالی‌پلو', 'traditional', 300, 170, 7, 27, 4, ['fava bean rice']),
  F('adas', 'Adas Polo', 'عدس‌پلو', 'traditional', 300, 150, 6, 26, 3, ['lentil rice']),
  F('sabzi-mahi', 'Sabzi Polo ba Mahi', 'سبزی‌پلو با ماهی', 'traditional', 350, 145, 12, 20, 3, ['fish rice']),
  F('ash', 'Ash Reshteh', 'آش رشته', 'traditional', 300, 90, 5, 13, 2, ['ash reshte', 'noodle soup']),
  F('kashk', 'Kashk-e Bademjan', 'کشک بادمجان', 'traditional', 200, 110, 6, 8, 6, ['kashke bademjan', 'eggplant']),
  F('mirza', 'Mirza Ghasemi', 'میرزاقاسمی', 'traditional', 200, 95, 4, 8, 5, ['mirza ghassemi']),
  F('abgoosht', 'Abgoosht (Dizi)', 'آبگوشت', 'traditional', 350, 160, 12, 12, 8, ['dizi', 'dizi abgoosht']),
  F('halim', 'Haleem', 'حلیم', 'traditional', 300, 110, 7, 14, 3, ['haleem', 'halim gandom']),
  F('olivieh', 'Salad Olivieh', 'سالاد الویه', 'traditional', 200, 190, 6, 16, 12, ['olovie', 'salad olivier']),
  F('kotlet', 'Kotlet', 'کتلت', 'traditional', 150, 220, 12, 14, 13, ['cutlet', 'shami']),
  F('kuku', 'Kuku Sabzi', 'کوکو سبزی', 'traditional', 150, 140, 8, 6, 10, ['coco sabzi', 'herb frittata']),
  F('dolma', 'Dolma (Barg Mo)', 'دلمه برگ مو', 'traditional', 200, 130, 5, 14, 6, ['dolmeh', 'stuffed grape']),
  F('tahdig', 'Tahdig (Crispy Rice)', 'ته‌دیگ', 'traditional', 80, 300, 4, 40, 13, []),
  F('shirazi', 'Salad Shirazi', 'سالاد شیرازی', 'traditional', 150, 40, 1, 6, 1, []),
  F('barbari', 'Barbari Bread', 'نان بربری', 'traditional', 80, 260, 8, 50, 2, ['naan', 'bread']),
  F('sangak', 'Sangak Bread', 'نان سنگک', 'traditional', 80, 250, 9, 48, 2, ['naan', 'bread']),
  F('lavash', 'Lavash Bread', 'نان لواش', 'traditional', 40, 270, 8, 54, 2, ['naan', 'bread']),
  F('shole', 'Sholeh Zard', 'شله‌زرد', 'traditional', 150, 150, 2, 30, 2, ['saffron pudding']),
  F('zoolbia', 'Zoolbia & Bamieh', 'زولبیا بامیه', 'traditional', 100, 380, 3, 60, 13, ['bamieh', 'zulbia']),
  // Fast food
  F('pizza', 'Cheese Pizza', 'پیتزا پنیر', 'fast', 120, 266, 11, 33, 10, ['pizza']),
  F('cheeseburger', 'Cheeseburger', 'چیزبرگر', 'fast', 200, 250, 13, 24, 12, ['burger', 'hamburger']),
  F('fries', 'French Fries', 'سیب‌زمینی سرخ‌کرده', 'fast', 120, 312, 4, 41, 15, ['fries', 'french fries']),
  F('hotdog', 'Hot Dog', 'هات‌داگ', 'fast', 150, 290, 10, 24, 17, ['hotdog']),
  F('kebabwrap', 'Kebab Wrap', 'ساندویچ کباب', 'fast', 250, 230, 12, 26, 9, ['sandwich kabab']),
  F('shawarma', 'Chicken Shawarma', 'شاورما مرغ', 'fast', 250, 200, 14, 16, 9, ['shaverma']),
  F('falafel', 'Falafel', 'فلافل', 'fast', 120, 333, 13, 32, 18, []),
  F('samosa', 'Samosa', 'سمبوسه', 'fast', 100, 260, 6, 30, 13, []),
  F('bandari', 'Sosis Bandari', 'سوسیس بندری', 'fast', 200, 240, 9, 14, 17, ['bandari']),
  F('friedchicken', 'Fried Chicken', 'مرغ سوخاری', 'fast', 150, 260, 17, 10, 17, ['sokhari']),
  F('caesar', 'Chicken Caesar Salad', 'سالاد سزار', 'fast', 250, 150, 9, 8, 9, []),
  // Staples
  F('rice', 'White Rice (Cooked)', 'برنج سفید پخته', 'staple', 200, 130, 3, 28, 0.3, ['chelo', 'polo', 'berenj']),
  F('brownrice', 'Brown Rice (Cooked)', 'برنج قهوه‌ای', 'staple', 200, 112, 3, 24, 1, []),
  F('oats', 'Oatmeal (Cooked)', 'جو دوسر', 'staple', 200, 71, 3, 12, 1.5, ['oatmeal', 'oats']),
  F('pasta', 'Pasta (Cooked)', 'پاستا / ماکارونی', 'staple', 250, 158, 6, 31, 1, ['macaroni']),
  // Protein
  F('chicken', 'Grilled Chicken Breast', 'سینه مرغ گریل', 'protein', 150, 165, 31, 0, 3.6, ['sine morgh']),
  F('beef', 'Lean Beef', 'گوشت گاو کم‌چرب', 'protein', 120, 250, 26, 0, 15, []),
  F('egg', 'Boiled Egg', 'تخم‌مرغ آب‌پز', 'protein', 50, 155, 13, 1, 11, ['tokhmorgh']),
  F('salmon', 'Grilled Salmon', 'سالمون کبابی', 'protein', 130, 208, 20, 0, 13, []),
  F('tuna', 'Canned Tuna', 'تن ماهی', 'protein', 100, 132, 28, 0, 1.3, []),
  F('lentil', 'Lentils (Cooked)', 'عدس پخته', 'protein', 150, 116, 9, 20, 0.4, []),
  // Dairy
  F('gyogurt', 'Greek Yogurt', 'ماست یونانی', 'dairy', 150, 97, 9, 4, 5, ['yogurt']),
  F('milk', 'Milk 2.5%', 'شیر', 'dairy', 250, 60, 3, 5, 2.5, ['shir']),
  F('feta', 'Feta Cheese', 'پنیر فتا', 'dairy', 40, 264, 14, 4, 21, ['panir', 'cheese']),
  F('doogh', 'Doogh', 'دوغ', 'dairy', 250, 25, 1, 3, 1, []),
  // Fruits
  F('banana', 'Banana', 'موز', 'fruit', 120, 89, 1, 23, 0.3, []),
  F('apple', 'Apple', 'سیب', 'fruit', 150, 52, 0.3, 14, 0.2, []),
  F('dates', 'Dates', 'خرما', 'fruit', 40, 282, 2, 75, 0.4, []),
  F('watermelon', 'Watermelon', 'هندوانه', 'fruit', 200, 30, 0.6, 8, 0.2, []),
  // Snacks & sweets
  F('almonds', 'Almonds', 'بادام', 'snack', 30, 579, 21, 22, 50, []),
  F('walnuts', 'Walnuts', 'گردو', 'snack', 30, 654, 15, 14, 65, []),
  F('pistachio', 'Pistachios', 'پسته', 'snack', 30, 560, 20, 28, 45, []),
  F('honey', 'Honey', 'عسل', 'snack', 20, 304, 0.3, 82, 0, []),
  F('darkchoc', 'Dark Chocolate', 'شکلات تلخ', 'snack', 30, 546, 5, 61, 31, []),
  F('icecream', 'Ice Cream', 'بستنی', 'snack', 100, 207, 3.5, 24, 11, ['bastani']),
  // Drinks
  F('orangejuice', 'Orange Juice', 'آب پرتقال', 'drink', 250, 45, 0.7, 10, 0.2, []),
  F('sugartea', 'Tea with Sugar', 'چای شیرین', 'drink', 250, 20, 0, 5, 0, ['chai']),
  F('espresso', 'Espresso', 'اسپرسو', 'drink', 60, 9, 0.5, 1.5, 0.2, ['ghahve', 'coffee']),
];

export function searchFoods(query: string): FoodItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored = FOODS
    .map(f => {
      let score = 0;
      const name = f.name.toLowerCase();
      const kw = f.kw.join(' ').toLowerCase();
      if (name.startsWith(q)) score += 5;
      else if (name.includes(q)) score += 3;
      if (f.fa.includes(query.trim())) score += 4;
      if (kw.includes(q)) score += 2;
      if (f.cat === q) score += 1;
      return { f, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, 8).map(x => x.f);
}
