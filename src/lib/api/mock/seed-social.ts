/**
 * Mock community data: other readers' "read" lists drive the non-AI
 * "readers also read" co-occurrence, and seeded reviews fill the book pages.
 */
export const SEED_READERS: { id: string; name: string; read: string[] }[] = [
  { id: "r-maryam", name: "مریم", read: ["blind-owl", "symphony-of-the-dead", "the-stranger", "metamorphosis", "prince-ehtejab", "white-nights"] },
  { id: "r-ali", name: "علی", read: ["nineteen-eighty-four", "animal-farm", "blindness", "the-stranger", "crime-and-punishment"] },
  { id: "r-sara", name: "سارا", read: ["little-prince", "the-alchemist", "forty-rules-of-love", "little-black-fish", "white-nights"] },
  { id: "r-reza", name: "رضا", read: ["kelidar", "missing-soluch", "savushun", "symphony-of-the-dead", "shahnameh"] },
  { id: "r-niloofar", name: "نیلوفر", read: ["savushun", "i-turn-off-the-lights", "pride-and-prejudice", "anna-karenina", "forty-rules-of-love"] },
  { id: "r-kaveh", name: "کاوه", read: ["shahnameh", "gulistan", "rubaiyat", "my-uncle-napoleon", "don-quixote"] },
  { id: "r-shirin", name: "شیرین", read: ["one-hundred-years", "blindness", "the-stranger", "blind-owl", "metamorphosis"] },
  { id: "r-babak", name: "بابک", read: ["crime-and-punishment", "brothers-karamazov", "white-nights", "anna-karenina", "les-miserables"] },
  { id: "r-parisa", name: "پریسا", read: ["harry-potter-1", "little-prince", "catcher-in-the-rye", "the-alchemist", "pride-and-prejudice"] },
  { id: "r-hamid", name: "حمید", read: ["school-principal", "missing-soluch", "blind-owl", "my-uncle-napoleon", "savushun"] },
  { id: "r-leila", name: "لیلا", read: ["old-man-and-the-sea", "the-stranger", "catcher-in-the-rye", "one-hundred-years", "little-prince"] },
  { id: "r-omid", name: "امید", read: ["rubaiyat", "little-black-fish", "gulistan", "blind-owl", "symphony-of-the-dead"] },
  { id: "r-tara", name: "تارا", read: ["les-miserables", "don-quixote", "brothers-karamazov", "one-hundred-years", "nineteen-eighty-four"] },
  { id: "r-arash", name: "آرش", read: ["metamorphosis", "nineteen-eighty-four", "animal-farm", "blindness", "old-man-and-the-sea"] },
];

export const SEED_REVIEWS: {
  bookId: string;
  readerId: string;
  rating: number;
  text: string;
  spoiler: boolean;
  daysAgo: number;
}[] = [
  { bookId: "blind-owl", readerId: "r-maryam", rating: 5, text: "هر بار که می‌خوانمش چیز تازه‌ای پیدا می‌کنم. فضای تاریکش آدم را رها نمی‌کند.", spoiler: false, daysAgo: 12 },
  { bookId: "blind-owl", readerId: "r-shirin", rating: 4, text: "اینکه زن اثیری و لکاته در آخر یک نفرند و راوی همان پیرمرد خنزرپنزری است، کل کتاب را برایم دوباره معنا کرد.", spoiler: true, daysAgo: 30 },
  { bookId: "blind-owl", readerId: "r-hamid", rating: 3, text: "سنگین بود، اما نثرش را دوست داشتم. باید یک بار دیگر بخوانم.", spoiler: false, daysAgo: 64 },
  { bookId: "little-prince", readerId: "r-sara", rating: 5, text: "کتابی که در هر سنی معنای تازه‌ای دارد. روباه بهترین شخصیت ادبیات است!", spoiler: false, daysAgo: 5 },
  { bookId: "little-prince", readerId: "r-parisa", rating: 5, text: "آخرش که مار نیشش می‌زند و شازده به سیاره‌اش برمی‌گردد، گریه کردم.", spoiler: true, daysAgo: 21 },
  { bookId: "little-prince", readerId: "r-leila", rating: 4, text: "کوتاه و عمیق. برای عصرهای پاییزی عالی است.", spoiler: false, daysAgo: 40 },
  { bookId: "savushun", readerId: "r-niloofar", rating: 5, text: "زری را دوست دارم؛ ترس‌هایش واقعی‌اند. توصیف شیراز بی‌نظیر است.", spoiler: false, daysAgo: 8 },
  { bookId: "savushun", readerId: "r-reza", rating: 4, text: "مرگ یوسف و تشییع جنازه‌اش که به شکل سووشون درمی‌آید، اوج کتاب است.", spoiler: true, daysAgo: 50 },
  { bookId: "symphony-of-the-dead", readerId: "r-omid", rating: 5, text: "ساختار چندصدایی‌اش فوق‌العاده است. اردبیل برفی را هنوز حس می‌کنم.", spoiler: false, daysAgo: 15 },
  { bookId: "symphony-of-the-dead", readerId: "r-maryam", rating: 5, text: "اورهان آخر کتاب در برف دنبال آیدین می‌رود و خودش یخ می‌زند… چه پایانی.", spoiler: true, daysAgo: 70 },
  { bookId: "my-uncle-napoleon", readerId: "r-kaveh", rating: 5, text: "تا حالا هیچ کتابی این‌قدر بلند نخندانده بودم! «انگلیسی‌ها»…", spoiler: false, daysAgo: 3 },
  { bookId: "my-uncle-napoleon", readerId: "r-hamid", rating: 4, text: "مش‌قاسم شاهکار است. سریالش را هم دوباره دیدم.", spoiler: false, daysAgo: 90 },
  { bookId: "nineteen-eighty-four", readerId: "r-ali", rating: 5, text: "ترسناک‌تر از هر رمان وحشتی. اتاق ۱۰۱ را فراموش نمی‌کنم.", spoiler: false, daysAgo: 18 },
  { bookId: "nineteen-eighty-four", readerId: "r-arash", rating: 4, text: "اینکه وینستون در پایان واقعاً برادر بزرگ را دوست دارد، از هر شکنجه‌ای بدتر بود.", spoiler: true, daysAgo: 33 },
  { bookId: "one-hundred-years", readerId: "r-shirin", rating: 5, text: "اسم‌ها گیجم کرد ولی جادویش ارزشش را داشت. یادداشت شجره‌نامه کمک می‌کند!", spoiler: false, daysAgo: 25 },
  { bookId: "one-hundred-years", readerId: "r-tara", rating: 4, text: "رمزگشایی نوشته‌های ملکیادس در صفحهٔ آخر، همزمان با نابودی ماکوندو… مو به تنم سیخ شد.", spoiler: true, daysAgo: 60 },
  { bookId: "crime-and-punishment", readerId: "r-babak", rating: 5, text: "روان‌شناسی راسکولنیکف بی‌رحمانه دقیق است. سونیا قلب کتاب است.", spoiler: false, daysAgo: 11 },
  { bookId: "the-stranger", readerId: "r-leila", rating: 4, text: "کوتاه اما ذهنم را هفته‌ها مشغول کرد. آن آفتاب…", spoiler: false, daysAgo: 7 },
  { bookId: "the-alchemist", readerId: "r-sara", rating: 4, text: "شاید ساده باشد، ولی دقیقاً همان وقتی خواندمش که لازم داشتم.", spoiler: false, daysAgo: 14 },
  { bookId: "the-alchemist", readerId: "r-parisa", rating: 3, text: "اینکه گنج زیر همان درخت انجیر اول داستان بود، کمی قابل حدس بود.", spoiler: true, daysAgo: 45 },
  { bookId: "forty-rules-of-love", readerId: "r-niloofar", rating: 4, text: "بخش‌های شمس را بیشتر از بخش اِلا دوست داشتم.", spoiler: false, daysAgo: 20 },
  { bookId: "shahnameh", readerId: "r-kaveh", rating: 5, text: "داستان رستم و سهراب را هر بار که می‌خوانم دلم می‌گیرد.", spoiler: false, daysAgo: 35 },
  { bookId: "kelidar", readerId: "r-reza", rating: 5, text: "طولانی است ولی آدم با گل‌محمد زندگی می‌کند. نثر دولت‌آبادی جادوست.", spoiler: false, daysAgo: 55 },
  { bookId: "harry-potter-1", readerId: "r-parisa", rating: 5, text: "بچگی‌ام با این کتاب گذشت. هنوز هم نامهٔ هاگوارتز را منتظرم!", spoiler: false, daysAgo: 9 },
  { bookId: "metamorphosis", readerId: "r-arash", rating: 4, text: "غریب و غمگین. رفتار خانواده از خود تبدیل ترسناک‌تر بود.", spoiler: false, daysAgo: 27 },
  { bookId: "white-nights", readerId: "r-babak", rating: 4, text: "یک داستان کوتاه برای همهٔ آدم‌های رؤیاپرداز.", spoiler: false, daysAgo: 16 },
  { bookId: "white-nights", readerId: "r-sara", rating: 5, text: "اینکه ناستنکا در شب چهارم با مستأجر برمی‌گردد، قلبم را شکست.", spoiler: true, daysAgo: 38 },
  { bookId: "i-turn-off-the-lights", readerId: "r-niloofar", rating: 4, text: "آرام و دلنشین، مثل یک فنجان چای عصرگاهی در آبادان.", spoiler: false, daysAgo: 6 },
  { bookId: "blindness", readerId: "r-ali", rating: 5, text: "بدون علامت نقل‌قول نوشته شده و همین آدم را بیشتر درگیر می‌کند.", spoiler: false, daysAgo: 22 },
  { bookId: "pride-and-prejudice", readerId: "r-parisa", rating: 5, text: "دیالوگ‌های الیزابت و دارسی را هزار بار هم بخوانم کم است.", spoiler: false, daysAgo: 13 },
];
