// SENB vocabulary, conjugations, image mappings, and sentence presets.

        const CATEGORIES = [
            { id: '01 subject', name: 'أشخاص / فاعل', color: 'bg-blue-500', icon: '👤', path: 'images/01 subject/' },
            { id: '02 verbs', name: 'أفعال', color: 'bg-emerald-500', icon: '🏃', path: 'images/02 verbs/' },
            { id: '03 object', name: 'أشياء / مفعول', color: 'bg-amber-500', icon: '🍎', path: 'images/03 object/' },
            { id: '04 place', name: 'أماكن', color: 'bg-purple-500', icon: '🏠', path: 'images/04 place/' },
            { id: '05 adjectives', name: 'صفات', color: 'bg-pink-500', icon: '⭐', path: 'images/05 adjectives/' },
            { id: '06 time', name: 'زمان', color: 'bg-indigo-500', icon: '⏰', path: 'images/06 time/' },
            { id: '07 Pronoun', name: 'ضمائر', color: 'bg-sky-500', icon: '👆', path: 'images/07 Pronoun/' },
            { id: '08 linking', name: 'أدوات ربط', color: 'bg-teal-500', icon: '🔗', path: 'images/08 linking/' },
            { id: '09 Prepositions', name: 'حروف جر', color: 'bg-orange-500', icon: '📍', path: 'images/09 Prepositions/' },
            { id: '10 colors', name: 'ألوان', color: 'bg-rose-500', icon: '🎨', path: 'images/10 colors/' },
            { id: '11 numbers', name: 'أرقام', color: 'bg-cyan-500', icon: '🔢', path: 'images/11 numbers/' },
            { id: '12 questions', name: 'أسئلة', color: 'bg-yellow-500', icon: '❓', path: 'images/12 questions/' }
        ];

        // Each row maps subgroups 1–8 to their image folders.
        const ADV_IMAGE_FOLDER_MAP = {
            2: ['6/1', '3/2', '2/3', '6/4', '5/5', '3/6', '2/7', '4/8'],
            3: ['6/1', '3/2', '3/3', '6/4', '5/5', '3/6', '3/7', '4/8'],
            4: ['6/1', '4/2', '6/3', '6/4', '5/5', '5/6', '4/7', '4/8'],
            5: ['6/1', '6/2', '6/3', '6/4', '5/5', '5/6', '6/7', '6/8'],
            6: ['6/1', '6/2', '6/3', '6/4', '6/5', '6/6', '6/7', '6/8']
        };

        const ITEMS_DATABASE = {
'01 subject': [
    { id: 1, title: 'ولد', genderCode: 'he', gender: 'male' },
    { id: 2, title: 'بنت', genderCode: 'she', gender: 'female' },
    { id: 3, title: 'ولدين', genderCode: 'they', gender: 'male' },
    { id: 4, title: 'اولاد', genderCode: 'they', gender: 'male' },
    { id: 5, title: 'بابا', genderCode: 'he', gender: 'male' },
    { id: 6, title: 'ماما', genderCode: 'she', gender: 'female' },
    { id: 7, title: 'بيبي', genderCode: 'he', gender: 'male' },
    { id: 8, title: 'صبيان', genderCode: 'they', gender: 'male' },
    { id: 9, title: 'بنات', genderCode: 'they', gender: 'female' },
    { id: 10, title: 'ولد و بنت', genderCode: 'they', gender: 'male' },
    { id: 11, title: 'بنتين', genderCode: 'they', gender: 'female' },
    { id: 12, title: 'تاتا', genderCode: 'she', gender: 'female' },
    { id: 13, title: 'جدو', genderCode: 'he', gender: 'male' },
    { id: 14, title: 'خالة', genderCode: 'she', gender: 'female' },
    { id: 15, title: 'عمو', genderCode: 'he', gender: 'male' },
    { id: 16, title: 'استاذ', genderCode: 'he', gender: 'male' },
    { id: 17, title: 'انسة', genderCode: 'she', gender: 'female' },
    { id: 18, title: 'طالب', genderCode: 'he', gender: 'male' },
    { id: 19, title: 'طالبة', genderCode: 'she', gender: 'female' },
    { id: 20, title: 'طلاب', genderCode: 'they', gender: 'male' },
    { id: 21, title: 'دكتور', genderCode: 'he', gender: 'male' },
    { id: 22, title: 'دكتورة', genderCode: 'she', gender: 'female' },
    { id: 23, title: 'دكاترة', genderCode: 'they', gender: 'male' },
    { id: 24, title: 'شرطي', genderCode: 'he', gender: 'male' },
    { id: 25, title: 'شرطية', genderCode: 'she', gender: 'female' },
    { id: 26, title: 'شرطة', genderCode: 'they', gender: 'male' },
    { id: 27, title: 'طيار', genderCode: 'he', gender: 'male' },
    { id: 28, title: 'طبيب عيون', genderCode: 'he', gender: 'male' },
    { id: 29, title: 'طبيبة عيون', genderCode: 'she', gender: 'female' },
    { id: 30, title: 'طبيب اسنان', genderCode: 'he', gender: 'male' },
    { id: 31, title: 'طبيبة اسنان', genderCode: 'she', gender: 'female' },
    { id: 32, title: 'ممرضة', genderCode: 'she', gender: 'female' },
    { id: 33, title: 'اطفائي', genderCode: 'he', gender: 'male' },
    { id: 34, title: 'اطفائية', genderCode: 'she', gender: 'female' },
    { id: 35, title: 'اطفائيين', genderCode: 'they', gender: 'male' },
    { id: 36, title: 'سائق', genderCode: 'he', gender: 'male' },
    { id: 37, title: 'سائقة', genderCode: 'she', gender: 'female' },
    { id: 38, title: 'حلاق', genderCode: 'he', gender: 'male' },
    { id: 39, title: 'كوافرا', genderCode: 'she', gender: 'female' },
    { id: 40, title: 'بياع', genderCode: 'he', gender: 'male' },
    { id: 41, title: 'بياعة', genderCode: 'she', gender: 'female' },
    { id: 42, title: 'رجل فضاء', genderCode: 'he', gender: 'male' },
    { id: 43, title: 'بنت فضاء', genderCode: 'she', gender: 'female' },
    { id: 44, title: 'مزارع', genderCode: 'he', gender: 'male' },
    { id: 45, title: 'مزارعة', genderCode: 'she', gender: 'female' },
    { id: 46, title: 'مهندس', genderCode: 'he', gender: 'male' },
    { id: 47, title: 'مهندسة', genderCode: 'she', gender: 'female' },
    { id: 48, title: 'ملك', genderCode: 'he', gender: 'male' },
    { id: 49, title: 'ملكة', genderCode: 'she', gender: 'female' },
    { id: 50, title: 'ملكات', genderCode: 'they', gender: 'female' },
    { id: 51, title: 'حارس', genderCode: 'he', gender: 'male' },
    { id: 52, title: 'حارسة', genderCode: 'she', gender: 'female' },
    { id: 53, title: 'رسام', genderCode: 'he', gender: 'male' },
    { id: 54, title: 'رسامة', genderCode: 'she', gender: 'female' },
    { id: 55, title: 'رسامين', genderCode: 'they', gender: 'male' },
    { id: 56, title: 'طباخ', genderCode: 'he', gender: 'male' },
    { id: 57, title: 'طباخة', genderCode: 'she', gender: 'female' },
    { id: 58, title: 'طباخين', genderCode: 'they', gender: 'male' },
    { id: 59, title: 'حرامي', genderCode: 'he', gender: 'male' },
    { id: 60, title: 'حرامية', genderCode: 'she', gender: 'female' },
    { id: 61, title: 'حرامين', genderCode: 'they', gender: 'male' },
    { id: 62, title: 'ساحرة', genderCode: 'she', gender: 'female' },
    { id: 63, title: 'ساحرات', genderCode: 'they', gender: 'female' },
    { id: 64, title: 'جندي', genderCode: 'he', gender: 'male' },
    { id: 65, title: 'جندية', genderCode: 'she', gender: 'female' },
    { id: 66, title: 'طبيب بيطري', genderCode: 'he', gender: 'male' },
    { id: 67, title: 'مصلح', genderCode: 'he', gender: 'male' },
    { id: 68, title: 'ساحر', genderCode: 'he', gender: 'male' },
    { id: 69, title: 'نحلة', genderCode: 'she', gender: 'female' },
    { id: 70, title: 'نحلات', genderCode: 'they', gender: 'female' },
    { id: 71, title: 'قطة', genderCode: 'she', gender: 'female' },
    { id: 72, title: 'قطتين', genderCode: 'they', gender: 'female' },
    { id: 73, title: 'قطط', genderCode: 'they', gender: 'male' },
    { id: 74, title: 'كلب', genderCode: 'he', gender: 'male' },
    { id: 75, title: 'كلبين', genderCode: 'they', gender: 'male' },
    { id: 76, title: 'كلاب', genderCode: 'they', gender: 'male' },
    { id: 77, title: 'فارة', genderCode: 'she', gender: 'female' },
    { id: 78, title: 'فارتين', genderCode: 'they', gender: 'female' },
    { id: 79, title: 'فيران', genderCode: 'they', gender: 'male' },
    { id: 80, title: 'دب', genderCode: 'he', gender: 'male' },
    { id: 81, title: 'نملة', genderCode: 'she', gender: 'female' },
    { id: 82, title: 'نملتين', genderCode: 'they', gender: 'female' },
    { id: 83, title: 'نملات', genderCode: 'they', gender: 'female' },
    { id: 84, title: 'ديناصور', genderCode: 'he', gender: 'male' },
    { id: 85, title: 'ديناصورات', genderCode: 'they', gender: 'male' },
    { id: 86, title: 'دودة', genderCode: 'she', gender: 'female' },
    { id: 87, title: 'دودتين', genderCode: 'they', gender: 'female' },
    { id: 88, title: 'دودات', genderCode: 'they', gender: 'female' },
    { id: 89, title: 'فضائي', genderCode: 'he', gender: 'male' },
    { id: 90, title: 'فيل', genderCode: 'he', gender: 'male' },
    { id: 91, title: 'عصفور', genderCode: 'he', gender: 'male' },
    { id: 92, title: 'عصافير', genderCode: 'they', gender: 'male' },
    { id: 93, title: 'سمكة', genderCode: 'she', gender: 'female' },
    { id: 94, title: 'سمكتين', genderCode: 'they', gender: 'female' },
    { id: 95, title: 'سمك', genderCode: 'they', gender: 'male' },
    { id: 96, title: 'اسد', genderCode: 'he', gender: 'male' },
    { id: 97, title: 'بقرة', genderCode: 'she', gender: 'female' },
    { id: 98, title: 'بقرتين', genderCode: 'they', gender: 'female' },
    { id: 99, title: 'ابقار', genderCode: 'they', gender: 'male' },
    { id: 100, title: 'ارنب', genderCode: 'he', gender: 'male' },
    { id: 101, title: 'ارنبين', genderCode: 'they', gender: 'male' },
    { id: 102, title: 'ارانب', genderCode: 'they', gender: 'male' },
    { id: 103, title: 'حورية', genderCode: 'she', gender: 'female' },
    { id: 104, title: 'حوريات', genderCode: 'they', gender: 'female' },
    { id: 105, title: 'مومياء', genderCode: 'she', gender: 'female' },
    { id: 106, title: 'حصان', genderCode: 'he', gender: 'male' },
    { id: 107, title: 'حصانين', genderCode: 'they', gender: 'male' },
    { id: 108, title: 'احصنة', genderCode: 'they', gender: 'male' },
    { id: 109, title: 'شبح', genderCode: 'he', gender: 'male' },
    { id: 110, title: 'اشباح', genderCode: 'they', gender: 'male' },
    { id: 111, title: 'زرافة', genderCode: 'she', gender: 'female' },
    { id: 112, title: 'زرافتين', genderCode: 'they', gender: 'female' },
    { id: 113, title: 'يوني كورن', genderCode: 'he', gender: 'male' },
    { id: 114, title: 'ذئب', genderCode: 'he', gender: 'male' },
    { id: 115, title: 'ذئاب', genderCode: 'they', gender: 'male' },
    { id: 116, title: 'أهل', genderCode: 'they', gender: 'male' },
    { id: 117, title: 'زرافات', genderCode: 'they', gender: 'female' },
    { id: 118, title: 'الحائط', genderCode: 'he', gender: 'male' },
    { id: 119, title: 'الاسعاف', genderCode: 'he', gender: 'male' },
    { id: 120, title: 'الموبايل', genderCode: 'he', gender: 'male' },
    { id: 121, title: 'النحل', genderCode: 'he', gender: 'male' },
    { id: 122, title: 'البيت', genderCode: 'he', gender: 'male' },
    { id: 123, title: 'الفواكه', genderCode: 'he', gender: 'male' },
    { id: 124, title: 'الليل', genderCode: 'he', gender: 'male' },
    { id: 125, title: 'العصفور', genderCode: 'he', gender: 'male' },
    { id: 126, title: 'فرشاة', genderCode: 'he', gender: 'male' },
    { id: 127, title: 'الاسنان', genderCode: 'he', gender: 'male' },
    { id: 128, title: 'معجون', genderCode: 'he', gender: 'male' },
    { id: 129, title: 'الاطفاء', genderCode: 'he', gender: 'male' },
    { id: 130, title: 'الشرطة', genderCode: 'he', gender: 'male' },
    { id: 131, title: 'الباب', genderCode: 'he', gender: 'male' },
    { id: 132, title: 'موقف', genderCode: 'he', gender: 'male' },
    { id: 133, title: 'الباص', genderCode: 'he', gender: 'male' },
    { id: 134, title: 'اشارة', genderCode: 'he', gender: 'male' },
    { id: 135, title: 'المرور', genderCode: 'he', gender: 'male' }
    ],

'02 verbs': [
                { id: 1, title: 'أكل' }, { id: 2, title: 'شرب' }, { id: 3, title: 'مشط' },
                { id: 4, title: 'غسل' }, { id: 5, title: 'حمم' }, { id: 6, title: 'نوم' },
                { id: 7, title: 'لبس' }, { id: 8, title: 'شوف' }, { id: 9, title: 'سمع' },
                { id: 10, title: 'لمس' }, { id: 11, title: 'شم' }, { id: 12, title: 'نطر' },
                { id: 13, title: 'وقف' }, { id: 14, title: 'قعد' }, { id: 15, title: 'بدُو' },
                { id: 16, title: 'مشى' }, { id: 17, title: 'ركض' }, { id: 18, title: 'زحف' },
                { id: 19, title: 'نزل' }, { id: 20, title: 'طلع' }, { id: 21, title: 'نط' },
                { id: 22, title: 'تسلق' }, { id: 23, title: 'خلط' }, { id: 24, title: 'قطع' },
                { id: 25, title: 'خبز' }, { id: 26, title: 'طبخ' }, { id: 27, title: 'أشر' },
                { id: 28, title: 'خار' }, { id: 29, title: 'حكى' }, { id: 30, title: 'لعب' },
                { id: 31, title: 'مسك' }, { id: 32, title: 'فرش' }, { id: 33, title: 'نفخ' },
                { id: 34, title: 'بكى' }, { id: 35, title: 'عيط' }, { id: 36, title: 'سلم' },
                { id: 37, title: 'غنى' }, { id: 38, title: 'صفر' }, { id: 39, title: 'ضحك' },
                { id: 40, title: 'حضن' }, { id: 41, title: 'يوس' }, { id: 42, title: 'سأل' },
                { id: 43, title: 'كسر' }, { id: 44, title: 'كنس' }, { id: 45, title: 'مسح' },
                { id: 46, title: 'شترى' }, { id: 47, title: 'حمل' }, { id: 48, title: 'عطى' },
                { id: 49, title: 'شول' }, { id: 50, title: 'فتح' }, { id: 51, title: 'سكر' },
                { id: 52, title: 'شوط' }, { id: 53, title: 'زين' }, { id: 54, title: 'لون' },
                { id: 55, title: 'رسم' }, { id: 56, title: 'وعَد' }, { id: 57, title: 'كتب' },
                { id: 58, title: 'قرأ' }, { id: 59, title: 'قصص' }, { id: 60, title: 'علم' },
                { id: 61, title: 'سوق' }, { id: 62, title: 'ركب' }, { id: 63, title: 'طعم' },
                { id: 64, title: 'وقع' }, { id: 65, title: 'رقص' }, { id: 66, title: 'عمل' },
                { id: 67, title: 'فكر' }, { id: 68, title: 'عمل هوس' }, { id: 69, title: 'وقف' },
                { id: 70, title: 'حفر' }, { id: 71, title: 'حسس' }, { id: 72, title: 'صلح' },
                { id: 73, title: 'فوش' }, { id: 74, title: 'زرع' }, { id: 75, title: 'سعد' },
                { id: 76, title: 'علم' }, { id: 77, title: 'درس' }, { id: 78, title: 'دور' },
                { id: 79, title: 'شرك' }, { id: 80, title: 'قيس' }, { id: 81, title: 'صب' },
                { id: 82, title: 'قشر' }, { id: 83, title: 'قطف' }, { id: 84, title: 'بنى' },
                { id: 85, title: 'جر' }, { id: 86, title: 'دفش' }, { id: 87, title: 'حط' },
                { id: 88, title: 'دحرج' }, { id: 89, title: 'جدف' }, { id: 90, title: 'سخر' },
                { id: 91, title: 'رش' }, { id: 92, title: 'عصر' }, { id: 93, title: 'سرق' },
                { id: 94, title: 'سبح' }, { id: 95, title: 'مرجح' }, { id: 96, title: 'رمى' },
                { id: 97, title: 'خدم' }, { id: 98, title: 'زور' }, { id: 99, title: 'سحب' },
                { id: 100, title: 'طير' }
            ],

'03 object': [
                { id: 1, title: 'سيارة اسعاف', gender: 'female' }, { id: 2, title: 'نملة', gender: 'female' },
                { id: 3, title: 'تفاحة', gender: 'female' }, { id: 4, title: 'طابة', gender: 'female' },
                { id: 5, title: 'موزة', gender: 'female' }, { id: 6, title: 'بانيو', gender: 'male' },
                { id: 7, title: 'طاقية صوف', gender: 'female' }, { id: 8, title: 'دب', gender: 'male' },
                { id: 9, title: 'تخت', gender: 'male' }, { id: 10, title: 'نحلة', gender: 'female' },
                { id: 11, title: 'بسكليت', gender: 'male' }, { id: 12, title: 'عش عصفور', gender: 'male' },
                { id: 13, title: 'عصفور', gender: 'male' }, { id: 14, title: 'كاتو', gender: 'male' },
                { id: 15, title: 'بطانية', gender: 'female' }, { id: 16, title: 'سفينة', gender: 'female' },
                { id: 17, title: 'كتاب', gender: 'male' }, { id: 18, title: 'صندوق', gender: 'male' },
                { id: 19, title: 'خبز', gender: 'male' }, { id: 20, title: 'مكنسة', gender: 'female' },
                { id: 21, title: 'فرشاية', gender: 'female' }, { id: 22, title: 'موقف باص', gender: 'male' },
                { id: 23, title: 'باص', gender: 'male' }, { id: 24, title: 'قبعة', gender: 'female' },
                { id: 25, title: 'سيارة', gender: 'female' }, { id: 26, title: 'سجادة', gender: 'female' },
                { id: 27, title: 'جزرة', gender: 'female' }, { id: 28, title: 'كرسي', gender: 'male' },
                { id: 29, title: 'شاحن', gender: 'male' }, { id: 30, title: 'جبنة', gender: 'female' },
                { id: 31, title: 'شوكولا', gender: 'female' }, { id: 32, title: 'ساعة', gender: 'female' },
                { id: 33, title: 'الوان', gender: 'male' }, { id: 34, title: 'فنجان', gender: 'male' },
                { id: 35, title: 'صحون', gender: 'female' }, { id: 36, title: 'باب', gender: 'male' },
                { id: 37, title: 'فستان', gender: 'male' }, { id: 38, title: 'كوكب الارض', gender: 'male' },
                { id: 39, title: 'بيضة', gender: 'female' }, { id: 40, title: 'وجه', gender: 'male' },
                { id: 41, title: 'سيارة اطفاء', gender: 'female' }, { id: 42, title: 'مساحة', gender: 'female' },
                { id: 43, title: 'وردة', gender: 'female' }, { id: 44, title: 'شوكة', gender: 'female' },
                { id: 45, title: 'براد', gender: 'male' }, { id: 46, title: 'بيض مقلي', gender: 'male' },
                { id: 47, title: 'فواكه', gender: 'female' }, { id: 48, title: 'حديقة', gender: 'female' },
                { id: 49, title: 'شعر', gender: 'male' }, { id: 50, title: 'هامبرغر', gender: 'male' },
                { id: 51, title: 'مطرقّة', gender: 'female' }, { id: 52, title: 'ايد', gender: 'female' },
                { id: 53, title: 'طاقية', gender: 'female' }, { id: 54, title: 'عسل', gender: 'male' },
                { id: 55, title: 'خرطوم', gender: 'male' }, { id: 56, title: 'ايس كريم', gender: 'female' },
                { id: 57, title: 'ايباد', gender: 'male' }, { id: 58, title: 'جاكيت', gender: 'male' },
                { id: 59, title: 'عصير', gender: 'male' }, { id: 60, title: 'مفاتيح', gender: 'female' },
                { id: 61, title: 'سكين', gender: 'female' }, { id: 62, title: 'سلم', gender: 'male' },
                { id: 63, title: 'لابتوب', gender: 'male' }, { id: 64, title: 'ليغو', gender: 'male' },
                { id: 65, title: 'مكبرة', gender: 'female' }, { id: 66, title: 'دواء', gender: 'male' },
                { id: 67, title: 'حليب', gender: 'male' }, { id: 68, title: 'قمر', gender: 'male' },
                { id: 69, title: 'فيلم', gender: 'male' }, { id: 70, title: 'غنية', gender: 'female' },
                { id: 71, title: 'مسمار', gender: 'male' }, { id: 72, title: 'ابرّة', gender: 'female' },
                { id: 73, title: 'عش', gender: 'male' }, { id: 74, title: 'دفتر', gender: 'male' },
                { id: 75, title: 'برتقال', gender: 'male' }, { id: 76, title: 'سوتش', gender: 'male' },
                { id: 77, title: 'صورة', gender: 'female' }, { id: 78, title: 'بنطال', gender: 'male' },
                { id: 79, title: 'رسمة', gender: 'female' }, { id: 80, title: 'قلم', gender: 'male' },
                { id: 81, title: 'خاتم', gender: 'male' }, { id: 82, title: 'موبايل', gender: 'male' },
                { id: 83, title: 'مخدة', gender: 'female' }, { id: 84, title: 'طيارة', gender: 'female' },
                { id: 85, title: 'صحن', gender: 'male' }, { id: 86, title: 'مقص', gender: 'male' },
                { id: 87, title: 'سيارة شرطة', gender: 'female' }, { id: 88, title: 'مطر', gender: 'male' },
                { id: 89, title: 'رز', gender: 'male' }, { id: 90, title: 'خاتم', gender: 'male' },
                { id: 91, title: 'رمل', gender: 'male' }, { id: 92, title: 'قلعة رمل', gender: 'female' },
                { id: 93, title: 'سندويشة', gender: 'female' }, { id: 94, title: 'بيت', gender: 'male' },
                { id: 95, title: 'مقص', gender: 'male' }, { id: 96, title: 'شامبو', gender: 'male' },
                { id: 97, title: 'رباط', gender: 'male' }, { id: 98, title: 'بوط', gender: 'male' },
                { id: 99, title: 'مجرفة', gender: 'female' }, { id: 100, title: 'مغلسة', gender: 'female' },
                { id: 101, title: 'زحليطة', gender: 'female' }, { id: 102, title: 'شحاط', gender: 'male' },
                { id: 103, title: 'صابونة', gender: 'female' }, { id: 104, title: 'صوفا', gender: 'female' },
                { id: 105, title: 'فضاء', gender: 'male' }, { id: 106, title: 'معكرونة', gender: 'female' },
                { id: 107, title: 'ملعقة', gender: 'female' }, { id: 108, title: 'سلم', gender: 'male' },
                { id: 109, title: 'درج', gender: 'male' }, { id: 110, title: 'عرباية', gender: 'female' },
                { id: 111, title: 'شمس', gender: 'female' }, { id: 112, title: 'مرجوحة', gender: 'female' },
                { id: 113, title: 'كنزة', gender: 'female' }, { id: 114, title: 'طاولة', gender: 'female' },
                { id: 115, title: 'ميزان الحرارة', gender: 'male' }, { id: 116, title: 'تواليت', gender: 'male' },
                { id: 117, title: 'سن', gender: 'male' }, { id: 118, title: 'فرشاية اسنان', gender: 'female' },
                { id: 119, title: 'معجون اسنان', gender: 'male' }, { id: 120, title: 'منشفة', gender: 'female' },
                { id: 121, title: 'لعبة', gender: 'female' }, { id: 122, title: 'العاب', gender: 'female' },
                { id: 123, title: 'تركتور', gender: 'male' }, { id: 124, title: 'شجرة', gender: 'female' },
                { id: 125, title: 'شاحنة', gender: 'female' }, { id: 126, title: 'تلفزيون', gender: 'male' },
                { id: 127, title: 'خضار', gender: 'female' }, { id: 128, title: 'حيط', gender: 'male' },
                { id: 129, title: 'مي', gender: 'female' }, { id: 130, title: 'مي', gender: 'female' },
                { id: 131, title: 'شباك', gender: 'male' }, { id: 132, title: 'محرمة', gender: 'female' },
                { id: 133, title: 'بيتزا', gender: 'female' }, { id: 134, title: 'وردات', gender: 'female' },
                { id: 135, title: 'صوت', gender: 'male' }, { id: 136, title: 'بناية', gender: 'female' },
                { id: 137, title: 'غسالة', gender: 'female' }, { id: 138, title: 'مصاري', gender: 'female' },
                { id: 139, title: 'قالب', gender: 'male' }, { id: 140, title: 'بسكوتة', gender: 'female' },
                { id: 141, title: 'خيار', gender: 'male' }, { id: 142, title: 'حقيبة', gender: 'female' },
                { id: 143, title: 'بالون', gender: 'male' }, { id: 144, title: 'بطيخ', gender: 'male' },
                { id: 145, title: 'ايدين', gender: 'female' }, { id: 146, title: 'الغيوم', gender: 'female' },
                { id: 147, title: 'الملابس', gender: 'female' }, { id: 148, title: 'قارب', gender: 'male' },
                { id: 149, title: 'الشجرة', gender: 'female' }, { id: 150, title: 'تفاح', gender: 'male' },
                { id: 151, title: 'حجرة', gender: 'female' }, { id: 152, title: 'اسنان', gender: 'male' },
                { id: 153, title: 'فراشة', gender: 'female' }, { id: 154, title: 'دجاجة', gender: 'female' },
                { id: 155, title: 'اقلام', gender: 'male' }, { id: 156, title: 'سيارات', gender: 'female' },
                { id: 157, title: 'موبايلات', gender: 'female' }, { id: 158, title: 'مفتاح', gender: 'male' },
                { id: 159, title: 'مفاتيح', gender: 'male' }, { id: 160, title: 'دوش', gender: 'male' },
                { id: 161, title: 'سماعة', gender: 'female' }, { id: 162, title: 'اكل', gender: 'male' }
            ],
'04 place': [
    { id: 1, title: 'المطار', genderCode: 'he', gender: 'male' },
    { id: 2, title: 'مدينة العاب', genderCode: 'he', gender: 'male' },
    { id: 3, title: 'محل تصليح سيارات', genderCode: 'he', gender: 'male' },
    { id: 4, title: 'الحديقة', genderCode: 'he', gender: 'male' },
    { id: 5, title: 'مخبز', genderCode: 'he', gender: 'male' },
    { id: 6, title: 'محل الحلاق', genderCode: 'he', gender: 'male' },
    { id: 7, title: 'الحمام', genderCode: 'he', gender: 'male' },
    { id: 8, title: 'الشاطئ', genderCode: 'he', gender: 'male' },
    { id: 9, title: 'غرفة نوم', genderCode: 'he', gender: 'male' },
    { id: 10, title: 'المكتبة', genderCode: 'he', gender: 'male' },
    { id: 11, title: 'الجسر', genderCode: 'he', gender: 'male' },
    { id: 12, title: 'محطة باصات', genderCode: 'he', gender: 'male' },
    { id: 13, title: 'الكافيه', genderCode: 'he', gender: 'male' },
    { id: 14, title: 'القلعة', genderCode: 'he', gender: 'male' },
    { id: 15, title: 'الكهف', genderCode: 'he', gender: 'male' },
    { id: 16, title: 'ساحة المدينة', genderCode: 'he', gender: 'male' },
    { id: 17, title: 'المدينة', genderCode: 'he', gender: 'male' },
    { id: 18, title: 'الصف', genderCode: 'he', gender: 'male' },
    { id: 19, title: 'محل ثياب', genderCode: 'he', gender: 'male' },
    { id: 20, title: 'الغيحة', genderCode: 'he', gender: 'male' },
    { id: 21, title: 'عيادة طبيب الاسنان', genderCode: 'he', gender: 'male' },
    { id: 22, title: 'العيادة', genderCode: 'he', gender: 'male' },
    { id: 23, title: 'المزرعة', genderCode: 'he', gender: 'male' },
    { id: 24, title: 'السما', genderCode: 'he', gender: 'male' },
    { id: 25, title: 'محطة الاطفاء', genderCode: 'he', gender: 'male' },
    { id: 26, title: 'محل سمك', genderCode: 'he', gender: 'male' },
    { id: 27, title: 'الوردة', genderCode: 'he', gender: 'male' },
    { id: 28, title: 'الحديقة', genderCode: 'he', gender: 'male' },
    { id: 29, title: 'الماركت', genderCode: 'he', gender: 'male' },
    { id: 30, title: 'النادي', genderCode: 'he', gender: 'male' },
    { id: 31, title: 'الطريق السريع', genderCode: 'he', gender: 'male' },
    { id: 32, title: 'المستشفى', genderCode: 'he', gender: 'male' },
    { id: 33, title: 'الجزيرة', genderCode: 'he', gender: 'male' },
    { id: 34, title: 'الغابة', genderCode: 'he', gender: 'male' },
    { id: 35, title: 'المطبخ', genderCode: 'he', gender: 'male' },
    { id: 36, title: 'البحيرة', genderCode: 'he', gender: 'male' },
    { id: 37, title: 'الجبل', genderCode: 'he', gender: 'male' },
    { id: 38, title: 'عيادة طبيب العيون', genderCode: 'he', gender: 'male' },
    { id: 39, title: 'البستان', genderCode: 'he', gender: 'male' },
    { id: 40, title: 'الرصيف', genderCode: 'he', gender: 'male' },
    { id: 41, title: 'حديقة الاللعاب', genderCode: 'he', gender: 'male' },
    { id: 42, title: 'مركز الشرطة', genderCode: 'he', gender: 'male' },
    { id: 43, title: 'السكة', genderCode: 'he', gender: 'male' },
    { id: 44, title: 'النهر', genderCode: 'he', gender: 'male' },
    { id: 45, title: 'الطريق', genderCode: 'he', gender: 'male' },
    { id: 46, title: 'الغرفة', genderCode: 'he', gender: 'male' },
    { id: 47, title: 'المدرسة', genderCode: 'he', gender: 'male' },
    { id: 48, title: 'الميناء', genderCode: 'he', gender: 'male' },
    { id: 49, title: 'البحر', genderCode: 'he', gender: 'male' },
    { id: 50, title: 'الشارع', genderCode: 'he', gender: 'male' },
    { id: 51, title: 'قوس قزح', genderCode: 'he', gender: 'male' },
    { id: 52, title: 'الملعب', genderCode: 'he', gender: 'male' },
    { id: 53, title: 'البرج', genderCode: 'he', gender: 'male' },
    { id: 54, title: 'القرية', genderCode: 'he', gender: 'male' },
    { id: 55, title: 'محطة القطار', genderCode: 'he', gender: 'male' },
    { id: 56, title: 'الاشجار', genderCode: 'he', gender: 'male' },
    { id: 57, title: 'النفق', genderCode: 'he', gender: 'male' },
    { id: 58, title: 'عيادة طبيب بيطري', genderCode: 'he', gender: 'male' },
    { id: 59, title: 'الورشة', genderCode: 'he', gender: 'male' },
    { id: 60, title: 'الصالون', genderCode: 'he', gender: 'male' },
    { id: 61, title: 'البركة', genderCode: 'he', gender: 'male' },
    { id: 62, title: 'الارض', genderCode: 'he', gender: 'male' },
    { id: 63, title: 'غرفة', genderCode: 'he', gender: 'male' },
    { id: 64, title: 'النوم', genderCode: 'he', gender: 'male' },
    { id: 65, title: 'ساحة', genderCode: 'he', gender: 'male' },
    { id: 66, title: 'ممر', genderCode: 'he', gender: 'male' },
    { id: 67, title: 'المشاة', genderCode: 'he', gender: 'male' },
],

'05 adjectives': [
    { id: 1, titleMale: 'مزعج', titleFemale: 'مزعجة' },
    { id: 2, titleMale: 'هادي', titleFemale: 'هادية' },
    { id: 3, titleMale: 'نايم', titleFemale: 'نايمة' },
    { id: 4, titleMale: 'فايق', titleFemale: 'فايقة' },
    { id: 5, titleMale: 'كبير', titleFemale: 'كبيرة' },
    { id: 6, titleMale: 'صغير', titleFemale: 'صغيرة' },
    { id: 7, titleMale: 'نظيف', titleFemale: 'نظيفة' },
    { id: 8, titleMale: 'وسخ', titleFemale: 'وسخة' },
    { id: 9, titleMale: 'مسكر', titleFemale: 'مسكرة' },
    { id: 10, titleMale: 'مفتوح', titleFemale: 'مفتوحة' },
    { id: 11, titleMale: 'بارد', titleFemale: 'باردة' },
    { id: 12, titleMale: 'ساخن', titleFemale: 'سخنة' },
    { id: 13, titleMale: 'نهار', titleFemale: 'صبح' },
    { id: 14, titleMale: 'مسا', titleFemale: 'ليلة' },
    { id: 15, titleMale: 'نازل', titleFemale: 'نازلة' },
    { id: 16, titleMale: 'طالع', titleFemale: 'طالعة' },
    { id: 17, titleMale: 'ناشف', titleFemale: 'ناشفة' },
    { id: 18, titleMale: 'مبلول', titleFemale: 'مبلولة' },
    { id: 19, titleMale: 'قاسي', titleFemale: 'قاسية' },
    { id: 20, titleMale: 'ناعم', titleFemale: 'ناعمة' },
    { id: 21, titleMale: 'ثقيل', titleFemale: 'ثقيلة' },
    { id: 22, titleMale: 'خفيف', titleFemale: 'خفيفة' },
    { id: 23, titleMale: 'جوا', titleFemale: 'جوانية' },
    { id: 24, titleMale: 'برا', titleFemale: 'برانية' },
    { id: 25, titleMale: 'داخل', titleFemale: 'داخلية' },
    { id: 26, titleMale: 'خارج', titleFemale: 'خارجية' },
    { id: 27, titleMale: 'ضيق', titleFemale: 'ضيقة' },
    { id: 28, titleMale: 'واسع', titleFemale: 'واسعة' },
    { id: 29, titleMale: 'جديد', titleFemale: 'جديدة' },
    { id: 30, titleMale: 'قديم', titleFemale: 'قديمة' },
    { id: 31, titleMale: 'قصير', titleFemale: 'قصيرة' },
    { id: 32, titleMale: 'طويل', titleFemale: 'طويلة' },
    { id: 33, titleMale: 'قاعد', titleFemale: 'قاعدة' },
    { id: 34, titleMale: 'واقف', titleFemale: 'واقفة' },
    { id: 35, titleMale: 'رفيع', titleFemale: 'رفيعة' },
    { id: 36, titleMale: 'سميك', titleFemale: 'سميكة' },
    { id: 37, titleMale: 'تحت', titleFemale: 'تحت' },
    { id: 38, titleMale: 'فوق', titleFemale: 'فوق' },
    { id: 39, titleMale: 'حلو', titleFemale: 'حلوة' },
    { id: 40, titleMale: 'ماحلو', titleFemale: 'ماحلوة' },
    { id: 41, titleMale: 'كتير', titleFemale: 'كتيرة' },
    { id: 42, titleMale: 'قليل', titleFemale: 'قليلة' },
    { id: 43, titleMale: 'حزين', titleFemale: 'حزينة' },
    { id: 44, titleMale: 'سعيد', titleFemale: 'سعيدة' },
    { id: 45, titleMale: 'معصب', titleFemale: 'معصبة' },
    { id: 46, titleMale: 'لذيذ', titleFemale: 'لذيذة' },
    { id: 47, titleMale: 'بطيء', titleFemale: 'بطيئة' },
    { id: 48, titleMale: 'سريع', titleFemale: 'سريعة' },
    { id: 49, titleMale: 'خربان', titleFemale: 'خربانة' },
    { id: 50, titleMale: 'شغال', titleFemale: 'شغالة' },
    { id: 51, titleMale: 'مليان', titleFemale: 'مليانة' },
    { id: 52, titleMale: 'فاضي', titleFemale: 'فاضية' },
    { id: 53, titleMale: 'شاطر', titleFemale: 'شاطرة' },
    { id: 54, titleMale: 'كسلان', titleFemale: 'كسلانة' },
    { id: 55, titleMale: 'مقلي', titleFemale: 'مقلية' }
],
'06 time': [
        { id: 1, title: 'الضهر' },
        { id: 2, title: 'عيد الميلاد' },
        { id: 3, title: 'الاستراحة' },
        { id: 4, title: 'الفطور' },
        { id: 5, title: 'الميلاد' },
        { id: 6, title: 'النهار' },
        { id: 7, title: 'العشاء' },
        { id: 8, title: 'الغروب' },
        { id: 9, title: 'الشروق' },
        { id: 10, title: 'عيد الفطر' },
        { id: 11, title: 'العيد' },
        { id: 12, title: 'الخريف' },
        { id: 13, title: 'الساعة 4' },
        { id: 14, title: 'الغداء' },
        { id: 15, title: 'الصبح' },
        { id: 16, title: 'رأس السنة' },
        { id: 17, title: 'بليل' },
        { id: 18, title: 'الساعة 9' },
        { id: 19, title: 'الان' },
        { id: 20, title: 'الساعة 6' },
        { id: 21, title: 'الربيع' },
        { id: 22, title: 'الصيف' },
        { id: 23, title: 'الساعة عشرة' },
        { id: 24, title: 'الساعة 3' },
        { id: 25, title: 'بكرا' },
        { id: 26, title: 'الساعة 12' },
        { id: 27, title: 'عيد الحب' },
        { id: 28, title: 'العطلة' },
        { id: 29, title: 'الشتاء' },
        { id: 30, title: 'مبارح' }
    ],            
'07 Pronoun': [
        { id: 1, title: 'انا', code: 'i' }, { id: 2, title: 'هاد', code: 'youmale' },
        { id: 3, title: 'هي', code: 'youfemale' }, { id: 4, title: 'هذا', code: 'he' },
        { id: 5, title: 'هذه', code: 'she' }, { id: 6, title: 'هم', code: 'we' },
        { id: 7, title: 'انتَ', code: 'they' }, { id: 8, title: 'انتِ', code: 'youplural' },
        { id: 9, title: 'انتما', code: 'your_m' }, { id: 10, title: 'نحن', code: 'your_f' }, { id: 11, title: ' هدول', code: 'they' }
    ],

'08 linking': [
    { id: 1, title: 'بعدين' },
    { id: 2, title: 'لسا' },
    { id: 3, title: 'و' },
    { id: 4, title: 'لانو' },
    { id: 5, title: 'بس' },
    { id: 6, title: 'كلهم' },
    { id: 7, title: 'من' },
    { id: 8, title: 'اول شي' },
    { id: 9, title: 'تاني شي' },
    { id: 10, title: 'اخر شي' },
    { id: 11, title: 'في' },
    { id: 12, title: 'او' },
    { id: 13, title: 'إلى' },
    { id: 14, title: 'مع' }
],

'09 Prepositions': [
    { id: 1, title: 'خلف' },
    { id: 2, title: 'بين' },
    { id: 3, title: 'أسفل' },
    { id: 4, title: 'بعيد' },
    { id: 5, title: 'أمام' },
    { id: 6, title: 'داخل' },
    { id: 7, title: 'قريب' },
    { id: 8, title: 'جنب' },
    { id: 9, title: 'على' },
    { id: 10, title: 'تحت' },
    { id: 11, title: 'أعلى' }
],

'10 colors': [
    { id: 1, titleMale: 'الوان', titleFemale: 'الوان' },
    { id: 2, titleMale: 'اسود', titleFemale: 'سودا' },
    { id: 3, titleMale: 'ازرق', titleFemale: 'زرقا' },
    { id: 4, titleMale: 'بني', titleFemale: 'بنية' },
    { id: 5, titleMale: 'رمادي', titleFemale: 'رمادية' },
    { id: 6, titleMale: 'اخضر', titleFemale: 'خضرا' },
    { id: 7, titleMale: 'برتقالي', titleFemale: 'برتقالية' },
    { id: 8, titleMale: 'وردي', titleFemale: 'وردية' },
    { id: 9, titleMale: 'بنفسجي', titleFemale: 'بنفسجية' },
    { id: 10, titleMale: 'احمر', titleFemale: 'حمرا' },
    { id: 11, titleMale: 'ابيض', titleFemale: 'بيضا' },
    { id: 12, titleMale: 'اصفر', titleFemale: 'صفرا' }
],

'11 numbers': [
    { id: 1, title: '1' },
    { id: 2, title: '2' },
    { id: 3, title: '3' },
    { id: 4, title: '4' },
    { id: 5, title: '5' },
    { id: 6, title: '6' },
    { id: 7, title: '7' },
    { id: 8, title: '8' },
    { id: 9, title: '9' },
    { id: 10, title: '10' },
    { id: 11, title: '11' },
    { id: 12, title: '12' },
    { id: 13, title: '13' },
    { id: 14, title: '14' },
    { id: 15, title: '15' },
    { id: 16, title: '16' },
    { id: 17, title: '17' },
    { id: 18, title: '18' },
    { id: 19, title: '19' },
    { id: 20, title: '20' },
    { id: 21, title: '21' },
    { id: 22, title: '22' },
    { id: 23, title: '23' },
    { id: 24, title: '24' },
    { id: 25, title: '25' },
    { id: 26, title: '26' },
    { id: 27, title: '27' },
    { id: 28, title: '28' },
    { id: 29, title: '29' },
    { id: 30, title: '30' }
],

'12 questions': [
    { id: 1, title: 'شو' },
    { id: 2, title: 'مين' },
    { id: 3, title: 'بشو' },
    { id: 4, title: 'وين' },
    { id: 5, title: 'ايمت' }
]
        };

        const VERB_CONJUGATIONS = {
            1: { 
                past: { i: 'أكلت', he: 'أكل', she: 'أكلت', we: 'أكلنا', they: 'أكلوا', youmale: 'أكلت', youfemale: 'أكلت', youplural: 'أكلتم' }, 
                present: { i: 'آكل', he: 'يأكل', she: 'تأكل', we: 'نأكل', they: 'يأكلون', youmale: 'تأكل', youfemale: 'تأكلين', youplural: 'تأكلون' }, 
                future: { i: 'بدي أكل', he: 'بدو ياكل', she: 'بدها تاكل', we: 'بدنا نأكل', they: 'بدهم ياكلوا', youmale: 'بدك تاكل', youfemale: 'بدك تاكلي', youplural: 'بدكم تاكلوا' } 
            },
            2: { 
                past: { i: 'شربت', he: 'شرب', she: 'شربت', we: 'شربنا', they: 'شربوا', youmale: 'شربت', youfemale: 'شربت', youplural: 'شربتم' }, 
                present: { i: 'أشرب', he: 'يشرب', she: 'تشرب', we: 'نشرب', they: 'يشربون', youmale: 'تشرب', youfemale: 'تشربين', youplural: 'تشربون' }, 
                future: { i: 'بدي أشرب', he: 'بدو يشرب', she: 'بدها تشرب', we: 'بدنا نشرب', they: 'بدهم يشربوا', youmale: 'بدك تشرب', youfemale: 'بدك تشربي', youplural: 'بدكم تشربوا' } 
            },
            3: { 
                past: { i: 'مشطت', he: 'مشط', she: 'مشطت', we: 'مشطنا', they: 'مشطوا', youmale: 'مشطت', youfemale: 'مشطت', youplural: 'مشطتم' }, 
                present: { i: 'أمشط', he: 'يمشط', she: 'تمشط', we: 'نمشط', they: 'يمشطون', youmale: 'تمشط', youfemale: 'تمشطين', youplural: 'تمشطون' }, 
                future: { i: 'بدي أمشط', he: 'بدو يمشط', she: 'بدها تمشط', we: 'بدنا نمشط', they: 'بدهم يمشطوا', youmale: 'بدك تمشط', youfemale: 'بدك تمشطي', youplural: 'بدكم تمشطوا' } 
            },
            4: { 
                past: { i: 'غسلت', he: 'غسل', she: 'غسلت', we: 'غسلنا', they: 'غسلوا', youmale: 'غسلت', youfemale: 'غسلت', youplural: 'غسلتم' }, 
                present: { i: 'أغسل', he: 'يغسل', she: 'تغسل', we: 'نغسل', they: 'يغسلون', youmale: 'تغسل', youfemale: 'تغسلين', youplural: 'تغسلون' }, 
                future: { i: 'بدي أغسل', he: 'بدو يغسل', she: 'بدها تغسل', we: 'بدنا نغسل', they: 'بدهم يغسلوا', youmale: 'بدك تغسل', youfemale: 'بدك تغسلي', youplural: 'بدكم تغسلوا' } 
            },
            5: { 
                past: { i: 'حممت', he: 'حمم', she: 'حممت', we: 'حممنا', they: 'حمموا', youmale: 'حممت', youfemale: 'حممت', youplural: 'حممتم' }, 
                present: { i: 'أتَحمم', he: 'يتحمم', she: 'تحمم', we: 'نتحمم', they: 'يتحمموا', youmale: 'تحمم', youfemale: 'تحتمي', youplural: 'تحتموا' }, 
                future: { i: 'بدي أتحمم', he: 'بدو يتحمم', she: 'بدها تتحمم', we: 'بدنا نتحمم', they: 'بدهم يتحمموا', youmale: 'بدك تتحمم', youfemale: 'بدك تحتمي', youplural: 'بدكم تحتموا' } 
            },
            6: { 
                past: { i: 'نمت', he: 'نام', she: 'نامت', we: 'نمنا', they: 'ناموا', youmale: 'نمت', youfemale: 'نمت', youplural: 'نمتم' }, 
                present: { i: 'أنام', he: 'ينام', she: 'تنام', we: 'ننام', they: 'يناموا', youmale: 'تنام', youfemale: 'تنامي', youplural: 'تناموا' }, 
                future: { i: 'بدي أنام', he: 'بدو ينام', she: 'بدها تنام', we: 'بدنا ننام', they: 'بدهم يناموا', youmale: 'بدك تنام', youfemale: 'بدك تنامي', youplural: 'بدكم تناموا' } 
            },
            7: { 
                past: { i: 'لبست', he: 'لبس', she: 'لبست', we: 'لبسنا', they: 'لبسوا', youmale: 'لبست', youfemale: 'لبست', youplural: 'لبستم' }, 
                present: { i: 'ألبس', he: 'يلبس', she: 'تلبس', we: 'نلبس', they: 'يلبسوا', youmale: 'تلبس', youfemale: 'تلبيسي', youplural: 'تلبسوا' }, 
                future: { i: 'بدي ألبس', he: 'بدو يلبس', she: 'بدها تلبس', we: 'بدنا نلبس', they: 'بدهم يلبسوا', youmale: 'بدك تلبس', youfemale: 'بدك تلبسي', youplural: 'بدكم تلبسوا' } 
            },
            8: { 
                past: { i: 'شوفْت', he: 'شاف', she: 'شافت', we: 'شوفنا', they: 'شافوا', youmale: 'شوفْت', youfemale: 'شوفْت', youplural: 'شوفْتُم' }, 
                present: { i: 'أشوف', he: 'يشوف', she: 'تشوف', we: 'نشوف', they: 'يشوفوا', youmale: 'تشوف', youfemale: 'تشوفي', youplural: 'تشوفوا' }, 
                future: { i: 'بدي أشوف', he: 'بدو يشوف', she: 'بدها تشوف', we: 'بدنا نشوف', they: 'بدهم يشوفوا', youmale: 'بدك تشوف', youfemale: 'بدك تشوفي', youplural: 'بدكم تشوفوا' } 
            },
            9: { 
                past: { i: 'سمعت', he: 'سمع', she: 'سمعت', we: 'سمعنا', they: 'سمعوا', youmale: 'سمعت', youfemale: 'سمعت', youplural: 'سمعتم' }, 
                present: { i: 'أسمع', he: 'يسمع', she: 'تسمع', we: 'نسمع', they: 'يسمعوا', youmale: 'تسمع', youfemale: 'تسلمي', youplural: 'تسمعوا' }, 
                future: { i: 'بدي أسمع', he: 'بدو يسمع', she: 'بدها تسمع', we: 'بدنا نسمع', they: 'بدهم يسمعوا', youmale: 'بدك تسمع', youfemale: 'بدك تسمعي', youplural: 'بدكم تسمعوا' } 
            },
            10: { 
                past: { i: 'لمست', he: 'لمس', she: 'لمست', we: 'لمسنا', they: 'لمسوا', youmale: 'لمست', youfemale: 'لمست', youplural: 'لمستُم' }, 
                present: { i: 'ألمس', he: 'يلمس', she: 'تلمس', we: 'نلمس', they: 'يلمسوا', youmale: 'تلمس', youfemale: 'تلمسي', youplural: 'تلمسوا' }, 
                future: { i: 'بدي ألمس', he: 'بدو يلمس', she: 'بدها تلمس', we: 'بدنا نلمس', they: 'بدهم يلمسوا', youmale: 'بدك تلمس', youfemale: 'بدك تلمسي', youplural: 'بدكم تلمسوا' } 
            },
            11: { 
                past: { i: 'شميت', he: 'شم', she: 'شمت', we: 'شممينا', they: 'شموا', youmale: 'شميت', youfemale: 'شميت', youplural: 'شميتُم' }, 
                present: { i: 'أشم', he: 'يشم', she: 'تشم', we: 'نشم', they: 'يشموا', youmale: 'تشم', youfemale: 'تشمي', youplural: 'تشموا' }, 
                future: { i: 'بدي أشم', he: 'بدو يشم', she: 'بدها تشم', we: 'بدنا نشم', they: 'بدهم يشموا', youmale: 'بدك تشم', youfemale: 'بدك تشمي', youplural: 'بدكم تشموا' } 
            },
            12: { 
                past: { i: 'نطرت', he: 'نطر', she: 'نطرت', we: 'نطرنا', they: 'نطروا', youmale: 'نطرت', youfemale: 'نطرت', youplural: 'نطرتم' }, 
                present: { i: 'أنطر', he: 'ينطر', she: 'تنطر', we: 'ننطر', they: 'ينطروا', youmale: 'تنطر', youfemale: 'تنطري', youplural: 'تنطروا' }, 
                future: { i: 'بدي أنطر', he: 'بدو ينطر', she: 'بدها تنطر', we: 'بدنا ننطر', they: 'بدهم ينطروا', youmale: 'بدك تنطر', youfemale: 'بدك تنطري', youplural: 'بدكم تنطروا' } 
            },
            13: { 
                past: { i: 'وقفت', he: 'وقف', she: 'وقفت', we: 'وقفنا', they: 'وقفوا', youmale: 'وقفت', youfemale: 'وقفت', youplural: 'وقفتم' }, 
                present: { i: 'أوقف', he: 'يوقف', she: 'توقف', we: 'نوقف', they: 'يوقفوا', youmale: 'توقف', youfemale: 'توقفي', youplural: 'توقفوا' }, 
                future: { i: 'بدي أوقف', he: 'بدو يوقف', she: 'بدها توقف', we: 'بدنا نوقف', they: 'بدهم يوقفوا', youmale: 'بدك توقف', youfemale: 'بدك توقفي', youplural: 'بدكم تووقفوا' } 
            },
            14: { 
                past: { i: 'قعدت', he: 'قعد', she: 'قعدت', we: 'قعدنا', they: 'قعدوا', youmale: 'قعدت', youfemale: 'قعدت', youplural: 'قعدتم' }, 
                present: { i: 'أقعد', he: 'يقعد', she: 'تقعد', we: 'نقعد', they: 'يقعدوا', youmale: 'تقعد', youfemale: 'تقعدي', youplural: 'تقعدوا' }, 
                future: { i: 'بدي أقعد', he: 'بدو يقعد', she: 'بدها تقعد', we: 'بدنا نقعد', they: 'بدهم يقعدوا', youmale: 'بدك تقعد', youfemale: 'بدك تقعدي', youplural: 'بدكم تقعدوا' } 
            },
            15: { 
                past: { i: 'بدي', he: 'بدها', she: 'بده', we: 'بكم', they: 'بدك', youmale: 'بدك', youfemale: 'بدنا', youplural: 'بدهم' }, 
                present: { i: 'بدي', he: 'بدها', she: 'بده', we: 'بكم', they: 'بدك', youmale: 'بدك', youfemale: 'بدنا', youplural: 'بدهم' }, 
                future: { i: 'بدي بدي', he: 'بدها بدها', she: 'بدو بدو', we: 'بدنا بدكم', they: 'بدك بدك', youmale: 'بدك بدك', youfemale: 'بدنا بدنا', youplural: 'بدهم بدهم' } 
            },
            16: { 
                past: { i: 'مشيت', he: 'مشى', she: 'مشت', we: 'مشينا', they: 'مشوا', youmale: 'مشيت', youfemale: 'مشيت', youplural: 'مشيتُم' }, 
                present: { i: 'أمشِي', he: 'يمشي', she: 'تمشي', we: 'نمشي', they: 'يمشوا', youmale: 'تمشي', youfemale: 'تمشي', youplural: 'تمشوا' }, 
                future: { i: 'بدي أمشي', he: 'بدو يمشي', she: 'بدها تمشي', we: 'بدنا نمشي', they: 'بدهم يمشوا', youmale: 'بدك تمشي', youfemale: 'بدك تمشي', youplural: 'بدكم تمشوا' } 
            },
            17: { 
                past: { i: 'ركضت', he: 'ركض', she: 'ركضت', we: 'ركضنا', they: 'ركضوا', youmale: 'ركضت', youfemale: 'ركضت', youplural: 'ركضتم' }, 
                present: { i: 'أركض', he: 'يركض', she: 'تركض', we: 'نركض', they: 'يركضوا', youmale: 'تركض', youfemale: 'تركضي', youplural: 'تركضوا' }, 
                future: { i: 'بدي أركض', he: 'بدو يركض', she: 'بدها تركض', we: 'بدنا نركض', they: 'بدهم يركضوا', youmale: 'بدك تركض', youfemale: 'بدك تركضي', youplural: 'بدكم تركضوا' } 
            },
            18: { 
                past: { i: 'زحفت', he: 'زحف', she: 'زحفت', we: 'زحفنا', they: 'زحفوا', youmale: 'زحفت', youfemale: 'زحفت', youplural: 'زحفتم' }, 
                present: { i: 'أزحف', he: 'يزحف', she: 'تزحف', we: 'نزحف', they: 'يزحفوا', youmale: 'تزحف', youfemale: 'تزحفي', youplural: 'تزحفوا' }, 
                future: { i: 'بدي أزحف', he: 'بدو يزحف', she: 'بدها تزحف', we: 'بدنا نزحف', they: 'بدهم يزحفوا', youmale: 'بدك تزحف', youfemale: 'بدك تزحفي', youplural: 'بدكم تزحفوا' } 
            },
            19: { 
                past: { i: 'نزلت', he: 'نزل', she: 'نزلت', we: 'نزلنا', they: 'نزلوا', youmale: 'نزلت', youfemale: 'نزلت', youplural: 'نزلتم' }, 
                present: { i: 'أنزل', he: 'ينزل', she: 'تنزل', we: 'ننزل', they: 'ينزلوا', youmale: 'تنزل', youfemale: 'تنقلي', youplural: 'تنزلوا' }, 
                future: { i: 'بدي أنزل', he: 'بدو ينزل', she: 'بدها تنزل', we: 'بدنا ننزل', they: 'بدهم ينزلوا', youmale: 'بدك تنزل', youfemale: 'بدك تنزلي', youplural: 'بدكم تنزلوا' } 
            },
            20: { 
                past: { i: 'طلعت', he: 'طلع', she: 'طلعت', we: 'طلعنا', they: 'طلعوا', youmale: 'طلعت', youfemale: 'طلعت', youplural: 'طلعتم' }, 
                present: { i: 'أطلع', he: 'يطلع', she: 'تطلع', we: 'نطلع', they: 'يطلعوا', youmale: 'تطلع', youfemale: 'تطلعي', youplural: 'تطلعوا' }, 
                future: { i: 'بدي أطلع', he: 'بدو يطلع', she: 'بدها تطلع', we: 'بدنا نطلع', they: 'بدهم يطلعوا', youmale: 'بدك تطلع', youfemale: 'بدك تطلعي', youplural: 'بدكم تطلعوا' } 
            },
            21: { 
                past: { i: 'نطيت', he: 'نط', she: 'نطت', we: 'نطينا', they: 'نطوا', youmale: 'نطيت', youfemale: 'نطيت', youplural: 'نطيتُم' }, 
                present: { i: 'أنط', he: 'ينط', she: 'تنط', we: 'ننط', they: 'ينطوا', youmale: 'تنط', youfemale: 'تنطي', youplural: 'تنطوا' }, 
                future: { i: 'بدي أنط', he: 'بدو ينط', she: 'بدها تنط', we: 'بدنا ننط', they: 'بدهم ينطوا', youmale: 'بدك تنط', youfemale: 'بدك تنطي', youplural: 'بدكم تنطوا' } 
            },
            22: { 
                past: { i: 'تسلوقت', he: 'تسلق', she: 'تسلوقت', we: 'تسلوقنا', they: 'تسلوقوا', youmale: 'تسلوقت', youfemale: 'تسلوقت', youplural: 'تسلوقتُم' }, // أو تسلقت
                present: { i: 'أتسلق', he: 'يتسلق', she: 'تسلق', we: 'نتسلق', they: 'يتسلقوا', youmale: 'تسلق', youfemale: 'تسلقي', youplural: 'تسلقوا' }, 
                future: { i: 'بدي أتسلق', he: 'بدو يتسلق', she: 'بدها تسلق', we: 'بدنا نتسلق', they: 'بدهم يتسلقوا', youmale: 'بدك تسلق', youfemale: 'بدك تسلقي', youplural: 'بدكم تسلقوا' } 
            },
            23: { 
                past: { i: 'خلطت', he: 'خلط', she: 'خلطت', we: 'خلطنا', they: 'خلطوا', youmale: 'خلطت', youfemale: 'خلطت', youplural: 'خلطتم' }, 
                present: { i: 'أخلط', he: 'يخلط', she: 'تخلط', we: 'نخلط', they: 'يخلطوا', youmale: 'تخلط', youfemale: 'تخلطي', youplural: 'تخلطوا' }, 
                future: { i: 'بدي أخلط', he: 'بدو يخلط', she: 'بدها تخلط', we: 'بدنا نخلط', they: 'بدهم يخلطوا', youmale: 'بدك تخلط', youfemale: 'بدك تخلطي', youplural: 'بدكم تخلطوا' } 
            },
            24: { 
                past: { i: 'قطعت', he: 'قطع', she: 'قطعت', we: 'قطعنا', they: 'قطعوا', youmale: 'قطعت', youfemale: 'قطعت', youplural: 'قطعتُم' }, 
                present: { i: 'أقطع', he: 'يقطع', she: 'تقطع', we: 'نقطع', they: 'يقطعوا', youmale: 'تقطع', youfemale: 'تقطعي', youplural: 'تقطعوا' }, 
                future: { i: 'بدي أقطع', he: 'بدو يقطع', she: 'بدها تقطع', we: 'بدنا نقطع', they: 'بدهم يقطعوا', youmale: 'بدك تقطع', youfemale: 'بدك تقطعي', youplural: 'بدكم تقطعوا' } 
            },
            25: { 
                past: { i: 'خبزت', he: 'خبز', she: 'خبزت', we: 'خبزنا', they: 'خبزوا', youmale: 'خبزت', youfemale: 'خبزت', youplural: 'خبزتم' }, 
                present: { i: 'أخبز', he: 'يخبز', she: 'تخبز', we: 'نخبز', they: 'يخبزوا', youmale: 'تخبز', youfemale: 'تخبزي', youplural: 'تخبزوا' }, 
                future: { i: 'بدي أخبز', he: 'بدو يخبز', she: 'بدها تخبز', we: 'بدنا نخبز', they: 'بدهم يخبزوا', youmale: 'بدك تخبز', youfemale: 'بدك تخبزي', youplural: 'بدكم تخبزوا' } 
            },
            26: { 
                past: { i: 'طبخت', he: 'طبخ', she: 'طبخت', we: 'طبخنا', they: 'طبخوا', youmale: 'طبخت', youfemale: 'طبخت', youplural: 'طبختم' }, 
                present: { i: 'أطبخ', he: 'يطبخ', she: 'تطبخ', we: 'نطبخ', they: 'يطبخوا', youmale: 'تطبخ', youfemale: 'تطبخي', youplural: 'تطبخوا' }, 
                future: { i: 'بدي أطبخ', he: 'بدو يطبخ', she: 'بدها تطبخ', we: 'بدنا نطبخ', they: 'بدهم يطبخوا', youmale: 'بدك تطبخ', youfemale: 'بدك تطبخي', youplural: 'بدكم تطبخوا' } 
            },
            27: { 
                past: { i: 'أشرت', he: 'أشر', she: 'أشرت', we: 'أشرنا', they: 'أشروا', youmale: 'أشرت', youfemale: 'أشرت', youplural: 'أشرتُم' }, 
                present: { i: 'أأشر', he: 'ياشر', she: 'تأشر', we: 'ناشر', they: 'ياشروا', youmale: 'تأشر', youfemale: 'تأشري', youplural: 'تأشروا' }, 
                future: { i: 'بدي أأشر', he: 'بدو ياشر', she: 'بدها تأشر', we: 'بدنا ناشر', they: 'بدهم ياشروا', youmale: 'بدك تأشر', youfemale: 'بدك تأشري', youplural: 'بدكم تأشروا' } 
            },
            28: { 
                past: { i: 'اخترت', he: 'اختار', she: 'اختارت', we: 'اخترنا', they: 'اختاروا', youmale: 'اخترت', youfemale: 'اخترت', youplural: 'اخترتم' }, 
                present: { i: 'أختار', he: 'يختار', she: 'تختار', we: 'نختار', they: 'يختاروا', youmale: 'تختار', youfemale: 'تختاري', youplural: 'تختاروا' }, 
                future: { i: 'بدي أختار', he: 'بدو يختار', she: 'بدها تختار', we: 'بدنا نختار', they: 'بدهم يختاروا', youmale: 'بدك تختار', youfemale: 'بدك تختاري', youplural: 'بدكم تختاروا' } 
            },
            29: { 
                past: { i: 'حكيت', he: 'حكى', she: 'حكت', we: 'حكينا', they: 'حكوا', youmale: 'حكيت', youfemale: 'حكيت', youplural: 'حكيتُم' }, 
                present: { i: 'أحكي', he: 'يحكي', she: 'تحكي', we: 'نحكي', they: 'يحكوا', youmale: 'تحكي', youfemale: 'تحكي', youplural: 'تحكوا' }, 
                future: { i: 'بدي أحكي', he: 'بدو يحكي', she: 'بدها تحكي', we: 'بدنا نحكي', they: 'بدهم يحكوا', youmale: 'بدك تحكي', youfemale: 'بدك تحكي', youplural: 'بدكم تحكوا' } 
            },
            30: { 
                past: { i: 'لعبت', he: 'لعب', she: 'لعبت', we: 'لعبنا', they: 'لعبوا', youmale: 'لعبت', youfemale: 'لعبت', youplural: 'لعبتم' }, 
                present: { i: 'ألعب', he: 'يلعب', she: 'تلعب', we: 'نلعب', they: 'يلعبوا', youmale: 'تلعب', youfemale: 'تلعبي', youplural: 'تلعبوا' }, 
                future: { i: 'بدي ألعب', he: 'بدو يلعب', she: 'بدها تلعب', we: 'بدنا نلعب', they: 'بدهم يلعبوا', youmale: 'بدك تلعب', youfemale: 'بدك تلعبي', youplural: 'بدكم تلعبوا' } 
            },
            31: { 
                past: { i: 'مسكت', he: 'مسك', she: 'مسكت', we: 'مسكنا', they: 'مسكوا', youmale: 'مسكت', youfemale: 'مسكت', youplural: 'مسكتم' }, 
                present: { i: 'أمسك', he: 'يمسك', she: 'تمسك', we: 'نمسك', they: 'يمسكوا', youmale: 'تمسك', youfemale: 'تمسكي', youplural: 'تمسكوا' }, 
                future: { i: 'بدي أمسك', he: 'بدو يمسك', she: 'بدها تمسك', we: 'بدنا نمسك', they: 'بدهم يمسكوا', youmale: 'بدك تمسك', youfemale: 'بدك تمسكي', youplural: 'بدكم تمسكوا' } 
            },
            32: { 
                past: { i: 'فرشيت', he: 'فرشى', she: 'فرشت', we: 'فرشينا', they: 'فرشوا', youmale: 'فرشيت', youfemale: 'فرشيت', youplural: 'فرشيتُم' }, 
                present: { i: 'أفرشي', he: 'يفرشي', she: 'تفرشي', we: 'نفرشي', they: 'يفرشوا', youmale: 'تفرشي', youfemale: 'تفرشي', youplural: 'تفرشوا' }, 
                future: { i: 'بدي أفرشي', he: 'بدو يفرشي', she: 'بدها تفرشي', we: 'بدنا نفرشي', they: 'بدهم يفرشوا', youmale: 'بدك تفرشي', youfemale: 'بدك تفرشي', youplural: 'بدكم تفرشوا' } 
            },
            33: { 
                past: { i: 'نفخت', he: 'نفخ', she: 'نفخت', we: 'نفخنا', they: 'نفخوا', youmale: 'نفخت', youfemale: 'نفخت', youplural: 'نفختم' }, 
                present: { i: 'أنفخ', he: 'ينفخ', she: 'تنفخ', we: 'ننفخ', they: 'ينفخوا', youmale: 'تنفخ', youfemale: 'تنفخي', youplural: 'تنفخوا' }, 
                future: { i: 'بدي أنفخ', he: 'بدو ينفخ', she: 'بدها تنفخ', we: 'بدنا ننفخ', they: 'بدهم ينفخوا', youmale: 'بدك تنفخ', youfemale: 'بدك تنفخي', youplural: 'بدكم تنفخوا' } 
            },
            34: { 
                past: { i: 'بكيت', he: 'بكى', she: 'بكت', we: 'بكينا', they: 'بكوا', youmale: 'بكيت', youfemale: 'بكيت', youplural: 'بكيتُم' }, 
                present: { i: 'أبكي', he: 'يبكي', she: 'تبكي', we: 'نبكي', they: 'يبكوا', youmale: 'تبكي', youfemale: 'تبكي', youplural: 'تبكوا' }, 
                future: { i: 'بدي أبكي', he: 'بدو يبكي', she: 'بدها تبكي', we: 'بدنا نبكي', they: 'بدهم يبكوا', youmale: 'بدك تبكي', youfemale: 'بدك تبكي', youplural: 'بدكم تبكوا' } 
            },
            35: { 
                past: { i: 'عيطت', he: 'عيط', she: 'عيطت', we: 'عيطينا', they: 'عيطوا', youmale: 'عيطت', youfemale: 'عيطت', youplural: 'عيطتم' }, 
                present: { i: 'أعيط', he: 'يعيط', she: 'تعيط', we: 'نعيط', they: 'يعيطوا', youmale: 'تعيط', youfemale: 'تعيطي', youplural: 'تعيطوا' }, 
                future: { i: 'بدي أعيط', he: 'بدو يعيط', she: 'بدها تعيط', we: 'بدنا نعيط', they: 'بدهم يعيطوا', youmale: 'بدك تعيط', youfemale: 'بدك تعيطي', youplural: 'بدكم تعيطوا' } 
            },
            36: { 
                past: { i: 'سلمت', he: 'سلم', she: 'سلمت', we: 'سلمنا', they: 'سلموا', youmale: 'سلمت', youfemale: 'سلمت', youplural: 'سلمتم' }, 
                present: { i: 'أأسلم', he: 'يسلم', she: 'تسلم', we: 'نسلم', they: 'يسلموا', youmale: 'تسلم', youfemale: 'تسلمي', youplural: 'تسلموا' }, 
                future: { i: 'بدي أسلم', he: 'بدو يسلم', she: 'بدها تسلم', we: 'بدنا نسلم', they: 'بدهم يسلموا', youmale: 'بدك تسلم', youfemale: 'بدك تسلمي', youplural: 'بدكم تسلموا' } 
            },
            37: { 
                past: { i: 'غنيت', he: 'غنى', she: 'غنت', we: 'غنينا', they: 'غنوا', youmale: 'غنيت', youfemale: 'غنيت', youplural: 'غنيتُم' }, 
                present: { i: 'أغني', he: 'يغني', she: 'تغني', we: 'نغني', they: 'يغنوا', youmale: 'تغني', youfemale: 'تغني', youplural: 'تغنوا' }, 
                future: { i: 'بدي أغني', he: 'بدو يغني', she: 'بدها تغني', we: 'بدنا نغني', they: 'بدهم يغنوا', youmale: 'بدك تغني', youfemale: 'بدك تغني', youplural: 'بدكم تغنوا' } 
            },
            38: { 
                past: { i: 'صفرت', he: 'صفر', she: 'صفرت', we: 'صفرنا', they: 'صفروا', youmale: 'صفرت', youfemale: 'صفرت', youplural: 'صفرتم' }, 
                present: { i: 'أصفر', he: 'يصفر', she: 'تصفر', we: 'نصفر', they: 'يصفروا', youmale: 'تصفر', youfemale: 'تصفري', youplural: 'تصفروا' }, 
                future: { i: 'بدي أصفر', he: 'بدو يصفر', she: 'بدها تصفر', we: 'بدنا نصفر', they: 'بدهم يصفروا', youmale: 'بدك تصفر', youfemale: 'بدك تصفري', youplural: 'بدكم تصفروا' } 
            },
            39: { 
                past: { i: 'ضحكت', he: 'ضحك', she: 'ضحكت', we: 'ضحكنا', they: 'ضحكوا', youmale: 'ضحكت', youfemale: 'ضحكت', youplural: 'ضحكتم' }, 
                present: { i: 'أضحك', he: 'يضحك', she: 'تضحك', we: 'نضحك', they: 'يضحكوا', youmale: 'تضحك', youfemale: 'تضحكي', youplural: 'تضحكوا' }, 
                future: { i: 'بدي أضحك', he: 'بدو يضحك', she: 'بدها تضحك', we: 'بدنا نضحك', they: 'بدهم يضحكوا', youmale: 'بدك تضحك', youfemale: 'بدك تضحكي', youplural: 'بدكم تضحكوا' } 
            },
            40: { 
                past: { i: 'حضنت', he: 'حضن', she: 'حضنت', we: 'حضنا', they: 'حضنوا', youmale: 'حضنت', youfemale: 'حضنت', youplural: 'حضنتم' }, 
                present: { i: 'أحضن', he: 'يحضن', she: 'تحضن', we: 'نحضن', they: 'يحضنوا', youmale: 'تحضن', youfemale: 'تحضني', youplural: 'تحضنوا' }, 
                future: { i: 'بدي أحضن', he: 'بدو يحضن', she: 'بدها تحضن', we: 'بدنا نحضن', they: 'بدهم يحضنوا', youmale: 'بدك تحضن', youfemale: 'بدك تحضني', youplural: 'بدكم تحضنوا' } 
            },
            41: { 
                past: { i: 'بست', he: 'باس', she: 'بست', we: 'بشنا', they: 'باسوا', youmale: 'بست', youfemale: 'بست', youplural: 'بستُم' }, 
                present: { i: 'أبوس', he: 'يبوس', she: 'تبوس', we: 'نبوس', they: 'يبوسوا', youmale: 'تبوس', youfemale: 'تبوسي', youplural: 'تبوسوا' }, 
                future: { i: 'بدي أبوس', he: 'بدو يبوس', she: 'بدها تبوس', we: 'بدنا نبوس', they: 'بدهم يبوسوا', youmale: 'بدك تبوس', youfemale: 'بدك تبوسي', youplural: 'بدكم تبوسوا' } 
            },
            42: { 
                past: { i: 'سألت', he: 'سأل', she: 'سألت', we: 'سألنا', they: 'سألوا', youmale: 'سألت', youfemale: 'سألت', youplural: 'سألتم' }, 
                present: { i: 'أسأل', he: 'يسأل', she: 'تسأل', we: 'نسأل', they: 'يسألوا', youmale: 'تسأل', youfemale: 'تسألي', youplural: 'تسألوا' }, 
                future: { i: 'بدي أسأل', he: 'بدو يسأل', she: 'بدها تسأل', we: 'بدنا نسأل', they: 'بدهم يسألوا', youmale: 'بدك تسأل', youfemale: 'بدك تسألي', youplural: 'بدكم تسألوا' } 
            },
            43: { 
                past: { i: 'كسرت', he: 'كسر', she: 'كسرت', we: 'كسرنا', they: 'كسروا', youmale: 'كسرت', youfemale: 'كسرت', youplural: 'كسرتم' }, 
                present: { i: 'أكسر', he: 'يكسر', she: 'تكسر', we: 'نكسر', they: 'يكسروا', youmale: 'تكسر', youfemale: 'تكسري', youplural: 'تكسروا' }, 
                future: { i: 'بدي أكسر', he: 'بدو يكسر', she: 'بدها تكسر', we: 'بدنا نكسر', they: 'بدهم يكسروا', youmale: 'بدك تكسر', youfemale: 'بدك تكسري', youplural: 'بدكم تكسروا' } 
            },
            44: { 
                past: { i: 'كنست', he: 'كنس', she: 'كنست', we: 'كنسنا', they: 'كنسوا', youmale: 'كنست', youfemale: 'كنست', youplural: 'كنستم' }, 
                present: { i: 'أكنس', he: 'يكنس', she: 'تكنس', we: 'نكنس', they: 'يكنسوا', youmale: 'تكنس', youfemale: 'تكنسي', youplural: 'تكنسوا' }, 
                future: { i: 'بدي أكنس', he: 'بدو يكنس', she: 'بدها تكنس', we: 'بدنا نكنس', they: 'بدهم يكنسوا', youmale: 'بدك تكنس', youfemale: 'بدك تكنسي', youplural: 'بدكم تكنسوا' } 
            },
            45: { 
                past: { i: 'مسحت', he: 'مسح', she: 'مسحت', we: 'مسحنا', they: 'مسحوا', youmale: 'مسحت', youfemale: 'مسحت', youplural: 'مسحتم' }, 
                present: { i: 'أمسح', he: 'يمسح', she: 'تمسح', we: 'نمسح', they: 'يمسحوا', youmale: 'تمسح', youfemale: 'تمسحي', youplural: 'تمسحوا' }, 
                future: { i: 'بدي أمسح', he: 'بدو يمسح', she: 'بدها تمسح', we: 'بدنا نمسح', they: 'بدهم يمسحوا', youmale: 'بدك تمسح', youfemale: 'بدك تمسحي', youplural: 'بدكم تمسحوا' } 
            },
            46: { 
                past: { i: 'اشتريت', he: 'اشتري', she: 'اشترت', we: 'اشترينا', they: 'اشتروا', youmale: 'اشتريت', youfemale: 'اشتريت', youplural: 'اشتريتم' }, 
                present: { i: 'أشتري', he: 'يشتري', she: 'تشتري', we: 'نشتري', they: 'يستروا', youmale: 'تشتري', youfemale: 'تشتري', youplural: 'تستروا' }, 
                future: { i: 'بدي أشتري', he: 'بدو يشتري', she: 'بدها تشتري', we: 'بدنا نشتري', they: 'بدهم يشتروا', youmale: 'بدك تشتري', youfemale: 'بدك تشتري', youplural: 'بدكم تشتروا' } 
            },
            47: { 
                past: { i: 'حملت', he: 'حمل', she: 'حملت', we: 'حملنا', they: 'حملوا', youmale: 'حملت', youfemale: 'حملت', youplural: 'حملتم' }, 
                present: { i: 'أحمل', he: 'يحمل', she: 'تحمل', we: 'نحمل', they: 'يحملوا', youmale: 'تحمل', youfemale: 'تحملي', youplural: 'تحملوا' }, 
                future: { i: 'بدي أحمل', he: 'بدو يحمل', she: 'بدها تحمل', we: 'بدنا نحمل', they: 'بدهم يحملوا', youmale: 'بدك تحمل', youfemale: 'بدك تحملي', youplural: 'بدكم تحملوا' } 
            },
            48: { 
                past: { i: 'عطيت', he: 'عطا', she: 'عطت', we: 'عطينا', they: 'عطوا', youmale: 'عطيت', youfemale: 'عطيت', youplural: 'عطيتُم' }, 
                present: { i: 'أعطي', he: 'يعطي', she: 'تعطي', we: 'نعطي', they: 'يعطوا', youmale: 'تعطي', youfemale: 'تعطي', youplural: 'تعطوا' }, 
                future: { i: 'بدي أعطي', he: 'بدو يعطي', she: 'بدها تعطي', we: 'بدنا نعطي', they: 'بدهم يعطوا', youmale: 'بدك تعطي', youfemale: 'بدك تعطي', youplural: 'بدكم تعطوا' } 
            },
            49: { 
                past: { i: 'شلت', he: 'شال', she: 'شالت', we: 'شلنا', they: 'شالوا', youmale: 'شلت', youfemale: 'شلت', youplural: 'شلتم' }, 
                present: { i: 'أشيل', he: 'يشيل', she: 'تشيل', we: 'نشيل', they: 'يشيلوا', youmale: 'تشيل', youfemale: 'تشيلي', youplural: 'تشيلوا' }, 
                future: { i: 'بدي أشيل', he: 'بدو يشيل', she: 'بدها تشيل', we: 'بدنا نشيل', they: 'بدهم يشيلوا', youmale: 'بدك تشيل', youfemale: 'بدك تشيلي', youplural: 'بدكم تشيلوا' } 
            },
            50: { 
                past: { i: 'فتحت', he: 'فتح', she: 'فتحت', we: 'فتحنا', they: 'فتحوا', youmale: 'فتحت', youfemale: 'فتحت', youplural: 'فتحتم' }, 
                present: { i: 'أفتح', he: 'يفتح', she: 'تفتح', we: 'نفتح', they: 'يفتحوا', youmale: 'تفتح', youfemale: 'تفتحي', youplural: 'تفتحوا' }, 
                future: { i: 'بدي أفتح', he: 'بدو يفتح', she: 'بدها تفتح', we: 'بدنا نفتح', they: 'بدهم يفتحوا', youmale: 'بدك تفتح', youfemale: 'بدك تفتحي', youplural: 'بدكم تفتحوا' } 
            },
            51: { 
                past: { i: 'سكرت', he: 'سكر', she: 'سكرت', we: 'سكرنا', they: 'سكروا', youmale: 'سكرت', youfemale: 'سكرت', youplural: 'سكرتم' }, 
                present: { i: 'أسكر', he: 'يسكر', she: 'تسكر', we: 'نسكر', they: 'يسكروا', youmale: 'تسكر', youfemale: 'تسكري', youplural: 'تسكروا' }, 
                future: { i: 'بدي أسكر', he: 'بدو يسكر', she: 'بدها تسكر', we: 'بدنا نسكر', they: 'بدهم يسكروا', youmale: 'بدك تسكر', youfemale: 'بدك تسكري', youplural: 'بدكم تسكروا' } 
            },
            52: { 
                past: { i: 'شوطت', he: 'شوط', she: 'شوطت', we: 'شوطنا', they: 'شوطوا', youmale: 'شوطت', youfemale: 'شوطت', youplural: 'شوطتم' }, 
                present: { i: 'أشوط', he: 'يشوط', she: 'تشوط', we: 'نشوط', they: 'يشوطوا', youmale: 'تشوط', youfemale: 'تشوطي', youplural: 'تشوطوا' }, 
                future: { i: 'بدي أشوط', he: 'بدو يشوط', she: 'بدها تشوط', we: 'بدنا نشوط', they: 'بدهم يشوطوا', youmale: 'بدك تشوط', youfemale: 'بدك تشوطي', youplural: 'بدكم تشوطوا' } 
            },
            53: { 
                past: { i: 'زينت', he: 'زين', she: 'زينت', we: 'زينا', they: 'زينوا', youmale: 'زينت', youfemale: 'زينت', youplural: 'زينتم' }, 
                present: { i: 'أزين', he: 'يزين', she: 'تزين', we: 'نزين', they: 'يزينوا', youmale: 'تزين', youfemale: 'تزيني', youplural: 'تزينوا' }, 
                future: { i: 'بدي أزين', he: 'بدو يزين', she: 'بدها تزين', we: 'بدنا نزين', they: 'بدهم يزينوا', youmale: 'بدك تزين', youfemale: 'بدك تزيني', youplural: 'بدكم تزينوا' } 
            },
            54: { 
                past: { i: 'لونت', he: 'لون', she: 'لونت', we: 'لونا', they: 'لونوا', youmale: 'لونت', youfemale: 'لونت', youplural: 'لونتم' }, 
                present: { i: 'ألون', he: 'يلون', she: 'تلون', we: 'نلون', they: 'يلونوا', youmale: 'تلون', youfemale: 'تلوني', youplural: 'تلونوا' }, 
                future: { i: 'بدي ألون', he: 'بدو يلون', she: 'بدها تلون', we: 'بدنا نلون', they: 'بدهم يلونوا', youmale: 'بدك تلون', youfemale: 'بدك تلوني', youplural: 'بدكم تلونوا' } 
            },
            55: { 
                past: { i: 'رسمت', he: 'رسم', she: 'رسمت', we: 'رسمنا', they: 'رسموا', youmale: 'رسمت', youfemale: 'رسمت', youplural: 'رسمتم' }, 
                present: { i: 'أرسم', he: 'يرسم', she: 'ترسم', we: 'نرسم', they: 'يرسموا', youmale: 'ترسم', youfemale: 'ترسمي', youplural: 'ترسموا' }, 
                future: { i: 'بدي أرسم', he: 'بدو يرسم', she: 'بدها ترسم', we: 'بدنا نرسم', they: 'بدهم يرسموا', youmale: 'بدك ترسم', youfemale: 'بدك ترسمي', youplural: 'بدكم ترسموا' } 
            },
            56: { 
                past: { i: 'عديت', he: 'عد', she: 'عدت', we: 'عدنا', they: 'عدوا', youmale: 'عديت', youfemale: 'عديت', youplural: 'عديتم' }, 
                present: { i: 'أعد', he: 'يعد', she: 'تعد', we: 'نعد', they: 'يعدوا', youmale: 'تعد', youfemale: 'تعدي', youplural: 'تعدوا' }, 
                future: { i: 'بدي أعد', he: 'بدو يعد', she: 'بدها تعد', we: 'بدنا نعد', they: 'بدهم يعدوا', youmale: 'بدك تعد', youfemale: 'بدك تعدي', youplural: 'بدكم تعدوا' } 
            },
            57: { 
                past: { i: 'كتبت', he: 'كتب', she: 'كتبت', we: 'كتبنا', they: 'كتبوا', youmale: 'كتبت', youfemale: 'كتبت', youplural: 'كتبتم' }, 
                present: { i: 'أكتب', he: 'يكتب', she: 'تكتب', we: 'نكتب', they: 'يكتبوا', youmale: 'تكتب', youfemale: 'تكتبي', youplural: 'تكتبوا' }, 
                future: { i: 'بدي أكتب', he: 'بدو يكتب', she: 'بدها تكتب', we: 'بدنا نكتب', they: 'بدهم يكتبوا', youmale: 'بدك تكتب', youfemale: 'بدك تكتبي', youplural: 'بدكم تكتبوا' } 
            },
            58: { 
                past: { i: 'قريت', he: 'قرا', she: 'قرت', we: 'قرينا', they: 'قروا', youmale: 'قريت', youfemale: 'قريت', youplural: 'قريتم' }, 
                present: { i: 'أقرا', he: 'يقرأ', she: 'تقرأ', we: 'نقرا', they: 'يقرأوا', youmale: 'تقرأ', youfemale: 'تقراي', youplural: 'تقرأوا' }, 
                future: { i: 'بدي أقرا', he: 'بدو يقرأ', she: 'بدها تقرأ', we: 'بدنا نقرا', they: 'بدهم يقرأوا', youmale: 'بدك تقرأ', youfemale: 'بدك تقراي', youplural: 'بدكم تقرأوا' } 
            },
            59: { 
                past: { i: 'قصيت', he: 'قص', she: 'قصت', we: 'قصينا', they: 'قصوا', youmale: 'قصيت', youfemale: 'قصيت', youplural: 'قصيتم' }, 
                present: { i: 'أقص', he: 'يقص', she: 'تقص', we: 'نقص', they: 'يقصوا', youmale: 'تقص', youfemale: 'تقصي', youplural: 'تقصوا' }, 
                future: { i: 'بدي أقص', he: 'بدو يقص', she: 'بدها تقص', we: 'بدنا نقص', they: 'بدهم يقصوا', youmale: 'بدك تقص', youfemale: 'بدك تقصي', youplural: 'بدكم تقصوا' } 
            },
            60: { 
                past: { i: 'علمت', he: 'علم', she: 'علمت', we: 'علمنا', they: 'علموا', youmale: 'علمت', youfemale: 'علمت', youplural: 'علمتم' }, 
                present: { i: 'أعلم', he: 'يعلم', she: 'تعلم', we: 'نعلم', they: 'يعلموا', youmale: 'تعلم', youfemale: 'تعلمي', youplural: 'تعلموا' }, 
                future: { i: 'بدي أعلم', he: 'بدو يعلم', she: 'بدها تعلم', we: 'بدنا نعلم', they: 'بدهم يعلموا', youmale: 'بدك تعلم', youfemale: 'بدك تعلمي', youplural: 'بدكم تعلموا' } 
            },
            61: { 
                past: { i: 'سقت', he: 'ساق', she: 'ساقت', we: 'سقنا', they: 'ساقوا', youmale: 'سقت', youfemale: 'سقت', youplural: 'سقتم' }, 
                present: { i: 'أسوق', he: 'يسوق', she: 'تسوق', we: 'نسوق', they: 'يسوقوا', youmale: 'تسوق', youfemale: 'تسوقي', youplural: 'تسوقوا' }, 
                future: { i: 'بدي أسوق', he: 'بدو يسوق', she: 'بدها تسوق', we: 'بدنا نسوق', they: 'بدهم يسوقوا', youmale: 'بدك تسوق', youfemale: 'بدك تسوقي', youplural: 'بدكم تسوقوا' } 
            },
            62: { 
                past: { i: 'ركبت', he: 'ركب', she: 'ركبت', we: 'ركبنا', they: 'ركبوا', youmale: 'ركبت', youfemale: 'ركبت', youplural: 'ركبتم' }, 
                present: { i: 'أركب', he: 'يركب', she: 'تركب', we: 'نركب', they: 'يركبوا', youmale: 'تركب', youfemale: 'تركبي', youplural: 'تركبوا' }, 
                future: { i: 'بدي أركب', he: 'بدو يركب', she: 'بدها تركب', we: 'بدنا نركب', they: 'بدهم يركبوا', youmale: 'بدك تركب', youfemale: 'بدك تركبي', youplural: 'بدكم تركبوا' } 
            },
            63: { 
                past: { i: 'طعميت', he: 'طعمى', she: 'طعمت', we: 'طعمينا', they: 'طعموا', youmale: 'طعميت', youfemale: 'طعميت', youplural: 'طعميتم' }, 
                present: { i: 'أطعمي', he: 'يطعمي', she: 'تطعمي', we: 'نطعمي', they: 'يطعموا', youmale: 'تطعمي', youfemale: 'تطعمي', youplural: 'تطعموا' }, 
                future: { i: 'بدي أطعمي', he: 'بدو يطعمي', she: 'بدها تطعمي', we: 'بدنا نطعمي', they: 'بدهم يطعموا', youmale: 'بدك تطعمي', youfemale: 'بدك تطعمي', youplural: 'بدكم تطعموا' } 
            },
            64: { 
                past: { i: 'وقعت', he: 'وقع', she: 'وقعت', we: 'وقعنا', they: 'وقعوا', youmale: 'وقعت', youfemale: 'وقعت', youplural: 'وقستم' }, 
                present: { i: 'أوقع', he: 'يوقع', she: 'توقع', we: 'نوقع', they: 'يوقعوا', youmale: 'توقع', youfemale: 'توقعي', youplural: 'توقعوا' }, 
                future: { i: 'بدي أوقع', he: 'بدو يوقع', she: 'بدها توقع', we: 'بدنا نوقع', they: 'بدهم يوقعوا', youmale: 'بدك توقع', youfemale: 'بدك توقعي', youplural: 'بدكم توقعوا' } 
            },
            65: { 
                past: { i: 'رقصت', he: 'رقص', she: 'رقصت', we: 'رقصنا', they: 'رقصوا', youmale: 'رقصت', youfemale: 'رقصت', youplural: 'رقصتم' }, 
                present: { i: 'أرقص', he: 'يرقص', she: 'ترقص', we: 'نرقص', they: 'يرقصوا', youmale: 'ترقص', youfemale: 'ترقصي', youplural: 'ترقصوا' }, 
                future: { i: 'بدي أرقص', he: 'بدو يرقص', she: 'بدها ترقص', we: 'بدنا نرقص', they: 'بدهم يرقصوا', youmale: 'بدك ترقص', youfemale: 'بدك ترقصي', youplural: 'بدكم ترقصوا' } 
            },
            66: { 
                past: { i: 'عملت', he: 'عمل', she: 'عملت', we: 'عملنا', they: 'عملوا', youmale: 'عملت', youfemale: 'عملت', youplural: 'عملتم' }, 
                present: { i: 'أعمل', he: 'يعمل', she: 'تعمل', we: 'نعمل', they: 'يعملوا', youmale: 'تعمل', youfemale: 'تعملي', youplural: 'تعملوا' }, 
                future: { i: 'بدي أعمل', he: 'بدو يعمل', she: 'بدها تعمل', we: 'بدنا نعمل', they: 'بدهم يعملوا', youmale: 'بدك تعمل', youfemale: 'بدك تعملي', youplural: 'بدكم تعملوا' } 
            },
            67: { 
                past: { i: 'فكرت', he: 'فكر', she: 'فكرت', we: 'فكرنا', they: 'فكروا', youmale: 'فكرت', youfemale: 'فكرت', youplural: 'فكرتم' }, 
                present: { i: 'أفكر', he: 'يفكر', she: 'تفكر', we: 'نفكر', they: 'يفكروا', youmale: 'تفكر', youfemale: 'تفكري', youplural: 'تفكروا' }, 
                future: { i: 'بدي أفكر', he: 'بدو يفكر', she: 'بدها تفكر', we: 'بدنا نفكر', they: 'بدهم يفكروا', youmale: 'بدك تفكر', youfemale: 'بدك تفكري', youplural: 'بدكم تفكروا' } 
            },
            68: { 
                past: { i: 'عملت هوس', he: 'عمل هوس', she: 'عملت هوس', we: 'عملنا هوس', they: 'عملوا هوس', youmale: 'عملت هوس', youfemale: 'عملت هوس', youplural: 'عملتم هوس' }, 
                present: { i: 'أعمل هوس', he: 'يعمل هوس', she: 'تعمل هوس', we: 'نعمل هوس', they: 'يعملوا هوس', youmale: 'تعمل هوس', youfemale: 'تعملي هوس', youplural: 'تعملوا هوس' }, 
                future: { i: 'بدي أعمل هوس', he: 'بدو يعمل هوس', she: 'بدها تعمل هوس', we: 'بدنا نعمل هوس', they: 'بدهم يعملوا هوس', youmale: 'بدك تعمل هوس', youfemale: 'بدك تعملي هوس', youplural: 'بدكم تعملوا هوس' } 
            },
            69: { 
                past: { i: 'وقفت', he: 'وقف', she: 'وقفت', we: 'وقفنا', they: 'وقفوا', youmale: 'وقفت', youfemale: 'وقفت', youplural: 'وقفتم' }, 
                present: { i: 'أوقف', he: 'يوقف', she: 'توقف', we: 'نوقف', they: 'يوقفوا', youmale: 'توقف', youfemale: 'توقفي', youplural: 'توقفوا' }, 
                future: { i: 'بدي أوقف', he: 'بدو يوقف', she: 'بدها توقف', we: 'بدنا نوقف', they: 'بدهم يوقفوا', youmale: 'بدك توقف', youfemale: 'بدك توقفي', youplural: 'بدكم توقفوا' } 
            },
            70: { 
                past: { i: 'حفرت', he: 'حفر', she: 'حفرت', we: 'حفرنا', they: 'حفروا', youmale: 'حفرت', youfemale: 'حفرت', youplural: 'حفرتم' }, 
                present: { i: 'أحفر', he: 'يحفر', she: 'تحفر', we: 'نحفر', they: 'يحفروا', youmale: 'تحفر', youfemale: 'تحفري', youplural: 'تحفروا' }, 
                future: { i: 'بدي أحفر', he: 'بدو يحفر', she: 'بدها تحفر', we: 'بدنا نحفر', they: 'بدهم يحفروا', youmale: 'بدك تحفر', youfemale: 'بدك تحفري', youplural: 'بدكم تحفروا' } 
            },
            71: { 
                past: { i: 'حسيت', he: 'حس', she: 'حست', we: 'حسينا', they: 'حسوا', youmale: 'حسيت', youfemale: 'حسيت', youplural: 'حسيتم' }, 
                present: { i: 'أحس', he: 'يحس', she: 'تحس', we: 'نحس', they: 'يحسوا', youmale: 'تحس', youfemale: 'تحسي', youplural: 'تحسوا' }, 
                future: { i: 'بدي أحس', he: 'بدو يحس', she: 'بدها تحس', we: 'بدنا نحس', they: 'بدهم يحسوا', youmale: 'بدك تحس', youfemale: 'بدك تحسي', youplural: 'بدكم تحسوا' } 
            },
            72: { 
                past: { i: 'صلحت', he: 'صلح', she: 'صلحت', we: 'صلحنا', they: 'صلحوا', youmale: 'صلحت', youfemale: 'صلحت', youplural: 'صلحتم' }, 
                present: { i: 'أصلح', he: 'يصلح', she: 'تصلح', we: 'نصلح', they: 'يصلحوا', youmale: 'تصلح', youfemale: 'تصلحي', youplural: 'تصلحوا' }, 
                future: { i: 'بدي أصلح', he: 'بدو يصلح', she: 'بدها تصلح', we: 'بدنا نصلح', they: 'بدهم يصلحوا', youmale: 'بدك تصلح', youfemale: 'بدك تصلحي', youplural: 'بدكم تصلحوا' } 
            },
            73: { 
                past: { i: 'فوشت', he: 'فوش', she: 'فوشت', we: 'فوشنا', they: 'فوشوا', youmale: 'فوشت', youfemale: 'فوشت', youplural: 'فوشتم' }, 
                present: { i: 'أفوش', he: 'يفوش', she: 'تفوش', we: 'نفوش', they: 'يفوشوا', youmale: 'تفوش', youfemale: 'تفوشي', youplural: 'تفوشوا' }, 
                future: { i: 'بدي أفوش', he: 'بدو يفوش', she: 'بدها تفوش', we: 'بدنا نفوش', they: 'بدهم يفوشوا', youmale: 'بدك تفوش', youfemale: 'بدك تفوشي', youplural: 'بدكم تفوشوا' } 
            },
            74: { 
                past: { i: 'زرعت', he: 'زرع', she: 'زرعت', we: 'زرعنا', they: 'زرعوا', youmale: 'زرعت', youfemale: 'زرعت', youplural: 'زرعتم' }, 
                present: { i: 'أزرع', he: 'يزرع', she: 'تزرع', we: 'نزرع', they: 'يزرعوا', youmale: 'تزرع', youfemale: 'تزرعي', youplural: 'تزرعوا' }, 
                future: { i: 'بدي أزرع', he: 'بدو يزرع', she: 'بدها تزرع', we: 'بدنا نزرع', they: 'بدهم يزرعوا', youmale: 'بدك تزرع', youfemale: 'بدك تزرعي', youplural: 'بدكم تزرعوا' } 
            },
            75: { 
                past: { i: 'ساعدت', he: 'ساعد', she: 'ساعدت', we: 'ساعدنا', they: 'ساعدوا', youmale: 'ساعدت', youfemale: 'ساعدت', youplural: 'ساعدتم' }, 
                present: { i: 'أساعد', he: 'يساعد', she: 'تساعد', we: 'نساعد', they: 'يساعدوا', youmale: 'تساعد', youfemale: 'تساعدي', youplural: 'تساعدوا' }, 
                future: { i: 'بدي أساعد', he: 'بدو يساعد', she: 'بدها تساعد', we: 'بدنا نساعد', they: 'بدهم يساعدوا', youmale: 'بدك تساعد', youfemale: 'بدك تساعدي', youplural: 'بدكم تساعدوا' } 
            },
            76: { 
                past: { i: 'تعلمت', he: 'تعلم', she: 'تعلمت', we: 'تعلمنا', they: 'تعلموا', youmale: 'تعلمت', youfemale: 'تعلمت', youplural: 'تعلمتم' }, 
                present: { i: 'أتعلم', he: 'يتعلم', she: 'تتعلم', we: 'نتعلم', they: 'يتعلموا', youmale: 'تتعلم', youfemale: 'تتعلمي', youplural: 'تتعلموا' }, 
                future: { i: 'بدي أتعلم', he: 'بدو يتعلم', she: 'بدها تتعلم', we: 'بدنا نتععلم', they: 'بدهم يتعلموا', youmale: 'بدك تتعلم', youfemale: 'بدك تتعلمي', youplural: 'بدكم تتعلموا' } 
            },
            77: { 
                past: { i: 'درست', he: 'درس', she: 'درست', we: 'درسنا', they: 'درسوا', youmale: 'درست', youfemale: 'درست', youplural: 'درستم' }, 
                present: { i: 'أدرس', he: 'يدرس', she: 'تدرس', we: 'ندرس', they: 'يدرسوا', youmale: 'تدرس', youfemale: 'تدرسي', youplural: 'تدرسوا' }, 
                future: { i: 'بدي أدرس', he: 'بدو يدرس', she: 'بدها تدرس', we: 'بدنا ندرس', they: 'بدهم يدرسوا', youmale: 'بدك تدرس', youfemale: 'بدك تدرسي', youplural: 'بدكم تدرسوا' } 
            },
            78: { 
                past: { i: 'دورت', he: 'دار', she: 'دارت', we: 'دورينا', they: 'داروا', youmale: 'دورت', youfemale: 'دورت', youplural: 'دورتتم' }, 
                present: { i: 'أدور', he: 'يدور', she: 'تدور', we: 'ندور', they: 'يدوروا', youmale: 'تدور', youfemale: 'تدوري', youplural: 'تدوروا' }, 
                future: { i: 'بدي أدور', he: 'بدو يدور', she: 'بدها تدور', we: 'بدنا ندور', they: 'بدهم يدوروا', youmale: 'بدك تدور', youfemale: 'بدك تدوري', youplural: 'بدكم تدوروا' } 
            },
            79: { 
                past: { i: 'شاركت', he: 'شارك', she: 'شاركت', we: 'شاركنا', they: 'شاركوا', youmale: 'شاركت', youfemale: 'شاركت', youplural: 'شاركتم' }, 
                present: { i: 'أشارك', he: 'يشارك', she: 'تشارك', we: 'نشارك', they: 'يشاركوا', youmale: 'تشارك', youfemale: 'تشاري', youplural: 'تشاركوا' }, 
                future: { i: 'بدي أشارك', he: 'بدو يشارك', she: 'بدها تشارك', we: 'بدنا نشارك', they: 'بدهم يشاركوا', youmale: 'بدك تشارك', youfemale: 'بدك تشاركي', youplural: 'بدكم تشاركوا' } 
            },
            80: { 
                past: { i: 'قاست', he: 'قاس', she: 'قاست', we: 'قسينا', they: 'قاسوا', youmale: 'قست', youfemale: 'قست', youplural: 'قستم' }, 
                present: { i: 'أقيس', he: 'يقيس', she: 'تقيس', we: 'نقيس', they: 'يقيسوا', youmale: 'تقيس', youfemale: 'تقيسي', youplural: 'تقيسوا' }, 
                future: { i: 'بدي أقيس', he: 'بدو يقيس', she: 'بدها تقيس', we: 'بدنا نقيس', they: 'بدهم يقيسوا', youmale: 'بدك تقيس', youfemale: 'بدك تقيسي', youplural: 'بدكم تقيسوا' } 
            },
            81: { 
                past: { i: 'ضبيت', he: 'ضب', she: 'ضبت', we: 'ضببينا', they: 'ضبوا', youmale: 'ضبيت', youfemale: 'ضبيت', youplural: 'ضبيتم' }, 
                present: { i: 'أضب', he: 'يضب', she: 'تضب', we: 'نضب', they: 'يضبوا', youmale: 'تضب', youfemale: 'تضبي', youplural: 'تضبوا' }, 
                future: { i: 'بدي أضب', he: 'بدو يضب', she: 'بدها تضب', we: 'بدنا نضب', they: 'بدهم يضبوا', youmale: 'بدك تضب', youfemale: 'بدك تضبي', youplural: 'بدكم تضبوا' } 
            },
            82: { 
                past: { i: 'قشرت', he: 'قشر', she: 'قشرت', we: 'قشرنا', they: 'قشروا', youmale: 'قشرت', youfemale: 'قشرت', youplural: 'قشرتم' }, 
                present: { i: 'أقشر', he: 'يقشر', she: 'تقشر', we: 'نقشر', they: 'يقشروا', youmale: 'تقشر', youfemale: 'تقشري', youplural: 'تقشروا' }, 
                future: { i: 'بدي أقشر', he: 'بدو يقشر', she: 'بدها تقشر', we: 'بدنا نقشر', they: 'بدهم يقشروا', youmale: 'بدك تقشر', youfemale: 'بدك تقشري', youplural: 'بدكم تقشروا' } 
            },
            83: { 
                past: { i: 'قطفت', he: 'قطف', she: 'قطفت', we: 'قطفنا', they: 'قطفوا', youmale: 'قطفت', youfemale: 'قطفت', youplural: 'قطفتم' }, 
                present: { i: 'أقطف', he: 'يقطف', she: 'تقطف', we: 'نقطف', they: 'يقطفوا', youmale: 'تقطف', youfemale: 'تقطفي', youplural: 'تقطفوا' }, 
                future: { i: 'بدي أقطف', he: 'بدو يقطف', she: 'بدها تقطف', we: 'بدنا نقطف', they: 'بدهم يقطفوا', youmale: 'بدك تقطف', youfemale: 'بدك تقطفي', youplural: 'بدكم تقطفوا' } 
            },
            84: { 
                past: { i: 'بنيت', he: 'بنا', she: 'بنت', we: 'بنينا', they: 'بنوا', youmale: 'بنيت', youfemale: 'بنيت', youplural: 'بنيتم' }, 
                present: { i: 'أبني', he: 'يبني', she: 'تبني', we: 'نبني', they: 'يبنوا', youmale: 'تبني', youfemale: 'تبني', youplural: 'تبنوا' }, 
                future: { i: 'بدي أبني', he: 'بدو يبني', she: 'بدها تبني', we: 'بدنا نبني', they: 'بدهم يبنوا', youmale: 'بدك تبني', youfemale: 'بدك تبني', youplural: 'بدكم تبنوا' } 
            },
            85: { 
                past: { i: 'جرت', he: 'جر', she: 'جرت', we: 'جرنا', they: 'جروا', youmale: 'جرت', youfemale: 'جرت', youplural: 'جرتم' }, 
                present: { i: 'أجر', he: 'يجَر', she: 'تجَر', we: 'نجر', they: 'يجَروا', youmale: 'تجَر', youfemale: 'تجَري', youplural: 'تجَروا' }, 
                future: { i: 'بدي أجر', he: 'بدو يجَر', she: 'بدها تجَر', we: 'بدنا نجر', they: 'بدهم يجَروا', youmale: 'بدك تجَر', youfemale: 'بدك تجَري', youplural: 'بدكم تجَروا' } 
            },
            86: { 
                past: { i: 'دفشت', he: 'دفش', she: 'دفشت', we: 'دفشنا', they: 'دفشوا', youmale: 'دفشت', youfemale: 'دفشت', youplural: 'دفشتم' }, 
                present: { i: 'أدفش', he: 'يدفش', she: 'تدفش', we: 'ندفش', they: 'يدفشوا', youmale: 'تدفش', youfemale: 'تدفشي', youplural: 'تدفشوا' }, 
                future: { i: 'بدي أدفش', he: 'بدو يدفش', she: 'بدها تدفش', we: 'بدنا ندفش', they: 'بدهم يدفشوا', youmale: 'بدك تدفش', youfemale: 'بدك تدفشي', youplural: 'بدكم تدفشوا' } 
            },
            87: { 
                past: { i: 'حطيت', he: 'حط', she: 'حطت', we: 'حطينا', they: 'حطوا', youmale: 'حطيت', youfemale: 'حطيت', youplural: 'حطيتم' }, 
                present: { i: 'أحط', he: 'يحط', she: 'تحط', we: 'نحط', they: 'يحطوا', youmale: 'تحط', youfemale: 'تحطي', youplural: 'تحطوا' }, 
                future: { i: 'بدي أحط', he: 'بدو يحط', she: 'بدها تحط', we: 'بدنا نحط', they: 'بدهم يحطوا', youmale: 'بدك تحط', youfemale: 'بدك تحطي', youplural: 'بدكم تحطوا' } 
            },
            88: { 
                past: { i: 'دحرجت', he: 'دحرج', she: 'دحرجت', we: 'دحرجنا', they: 'دحرجوا', youmale: 'دحرجت', youfemale: 'دحرجت', youplural: 'دحرجتم' }, 
                present: { i: 'أدحرج', he: 'يدحرج', she: 'تدحرج', we: 'ندحرج', they: 'يدحرجوا', youmale: 'تدحرج', youfemale: 'تدحرجي', youplural: 'تدحرجوا' }, 
                future: { i: 'بدي أدحرج', he: 'بدو يدحرج', she: 'بدها تدحرج', we: 'بدنا ندحرج', they: 'بدهم يدحرجوا', youmale: 'بدك تدحرج', youfemale: 'بدك تدحرجي', youplural: 'بدكم تدحرجوا' } 
            },
            89: { 
                past: { i: 'جدفت', he: 'جدف', she: 'جدفت', we: 'جدفنا', they: 'جدفوا', youmale: 'جدفت', youfemale: 'جدفت', youplural: 'جدفتم' }, 
                present: { i: 'أجدف', he: 'يجدف', she: 'تجدف', we: 'نجدف', they: 'يجدفوا', youmale: 'تجدف', youfemale: 'تجدفي', youplural: 'تجدفوا' }, 
                future: { i: 'بدي أجدف', he: 'بدو يجدف', she: 'بدها تجدف', we: 'بدنا نجدف', they: 'بدهم يجدفوا', youmale: 'بدك تجدف', youfemale: 'بدك تجدفي', youplural: 'بدكم تجدفوا' } 
            },
            90: { 
                past: { i: 'سخرت', he: 'شخر', she: 'سخرت', we: 'شخرنا', they: 'شخروا', youmale: 'سخرت', youfemale: 'سخرت', youplural: 'سخرتم' }, 
                present: { i: 'أشخر', he: 'يشخر', she: 'تشخر', we: 'نشخر', they: 'يشخروا', youmale: 'تشخر', youfemale: 'تشخري', youplural: 'تشخروا' }, 
                future: { i: 'بدي أشخر', he: 'بدو يشخر', she: 'بدها تشخر', we: 'بدنا نشخر', they: 'بدهم يشخروا', youmale: 'بدك تشخر', youfemale: 'بدك تشخري', youplural: 'بدكم تشخروا' } 
            },
            91: { 
                past: { i: 'رشت', he: 'رش', she: 'رشت', we: 'رشينا', they: 'رشوا', youmale: 'رشت', youfemale: 'رشت', youplural: 'رشيتم' }, 
                present: { i: 'أرش', he: 'يرش', she: 'ترش', we: 'نرش', they: 'يرشوا', youmale: 'ترش', youfemale: 'ترشي', youplural: 'ترشوا' }, 
                future: { i: 'بدي أرش', he: 'بدو يرش', she: 'بدها ترش', we: 'بدنا نرش', they: 'بدهم يرشوا', youmale: 'بدك تررش', youfemale: 'بدك ترشي', youplural: 'بدكم ترشوا' } 
            },
            92: { 
                past: { i: 'عصرت', he: 'عصر', she: 'عصرت', we: 'عصرنا', they: 'عصروا', youmale: 'عصرت', youfemale: 'عصرت', youplural: 'عصرتم' }, 
                present: { i: 'أعصر', he: 'يعصر', she: 'تعصر', we: 'نعصر', they: 'يعصروا', youmale: 'تعصر', youfemale: 'تعصري', youplural: 'تعصروا' }, 
                future: { i: 'بدي أعصر', he: 'بدو يعصر', she: 'بدها تعصر', we: 'بدنا نعصر', they: 'بدهم يعصروا', youmale: 'بدك تعصر', youfemale: 'بدك تعصري', youplural: 'بدكم تعصروا' } 
            },
            93: { 
                past: { i: 'سرقت', he: 'سرق', she: 'سرقت', we: 'سرقنا', they: 'سرقوا', youmale: 'سرقت', youfemale: 'سرقت', youplural: 'سرقتم' }, 
                present: { i: 'أسرق', he: 'يسرق', she: 'تسرق', we: 'نسرق', they: 'يسرقوا', youmale: 'تسرق', youfemale: 'تسرقي', youplural: 'تسرقوا' }, 
                future: { i: 'بدي أسرق', he: 'بدو يسرق', she: 'بدها تسرق', we: 'بدنا نسرق', they: 'بدهم يسرقوا', youmale: 'بدك تسرق', youfemale: 'بدك تسرقي', youplural: 'بدكم تسرقوا' } 
            },
            94: { 
                past: { i: 'سبحت', he: 'سبح', she: 'سبحت', we: 'سبحنا', they: 'سبحوا', youmale: 'سبحت', youfemale: 'سبحت', youplural: 'سبحتم' }, 
                present: { i: 'أسبح', he: 'يسبح', she: 'تسبح', we: 'نسبح', they: 'يسبحوا', youmale: 'تسبح', youfemale: 'تسبحي', youplural: 'تسبحوا' }, 
                future: { i: 'بدي أسبح', he: 'بدو يسبح', she: 'بدها تسبح', we: 'بدنا نسبح', they: 'بدهم يسبحوا', youmale: 'بدك تسبح', youfemale: 'بدك تسبحي', youplural: 'بدكم تسبحوا' } 
            },
            95: { 
                past: { i: 'تمرجحت', he: 'تمرجح', she: 'تمرجحت', we: 'تمرجحنا', they: 'تمرجحوا', youmale: 'تمرجحت', youfemale: 'تمرجحت', youplural: 'تمرجحتم' }, 
                present: { i: 'أتمرجح', he: 'يتمرجح', she: 'تمرجح', we: 'نتمرجح', they: 'يتمرجحوا', youmale: 'تمرجح', youfemale: 'تمرجحي', youplural: 'تمرجحوا' }, 
                future: { i: 'بدي أتمرجح', he: 'بدو يتمرجح', she: 'بدها تمرجح', we: 'بدنا نتمرجح', they: 'بدهم يتمرجحوا', youmale: 'بدك تمرجح', youfemale: 'بدك تمرجحي', youplural: 'بدكم تمرجحوا' } 
            },
            96: { 
                past: { i: 'رميت', he: 'رمى', she: 'رمت', we: 'رمينا', they: 'رموا', youmale: 'رميت', youfemale: 'رميت', youplural: 'رميتم' }, 
                present: { i: 'أرمي', he: 'يرمي', she: 'ترمي', we: 'نرمي', they: 'يرموا', youmale: 'ترمي', youfemale: 'ترمي', youplural: 'ترموا' }, 
                future: { i: 'بدي أرمي', he: 'بدو يرمي', she: 'بدها ترمي', we: 'بدنا نرمي', they: 'بدهم يرموا', youmale: 'بدك ترمي', youfemale: 'بدك ترمي', youplural: 'بدكم ترموا' } 
            },
            97: { 
                past: { i: 'استخدمت', he: 'استخدم', she: 'استخدمت', we: 'استخدمنا', they: 'استخدموا', youmale: 'استخدمت', youfemale: 'استخدمت', youplural: 'استخدمتم' }, 
                present: { i: 'أستخدم', he: 'يستخدم', she: 'تستخدم', we: 'نستخدم', they: 'يستخدموا', youmale: 'تستخدم', youfemale: 'تستخدمي', youplural: 'تستخدموا' }, 
                future: { i: 'بدي أستخدم', he: 'بدو يستخدم', she: 'بدها تستخدم', we: 'بدنا نستخدم', they: 'بدهم يستخدموا', youmale: 'بدك تستخدم', youfemale: 'بدك تستخدمي', youplural: 'بدكم تستخدموا' } 
            },
            98: { 
                past: { i: 'زرت', he: 'زار', she: 'زارت', we: 'زرنا', they: 'زاروا', youmale: 'زرت', youfemale: 'زرت', youplural: 'زرتم' }, 
                present: { i: 'أزور', he: 'يزور', she: 'تزور', we: 'نزور', they: 'يزوروا', youmale: 'تزور', youfemale: 'تزوري', youplural: 'تزوروا' }, 
                future: { i: 'بدي أزور', he: 'بدو يزور', she: 'بدها تزور', we: 'بدنا نزور', they: 'بدهم يزوروا', youmale: 'بدك تزور', youfemale: 'بدك تزوري', youplural: 'بدكم تزوروا' } 
            },
            99: { 
                past: { i: 'سحبت', he: 'سحب', she: 'سحبت', we: 'سحبنا', they: 'سحبوا', youmale: 'سحبت', youfemale: 'سحبت', youplural: 'سحبتتم' }, 
                present: { i: 'أَسحب', he: 'يسحب', she: 'تسحب', we: 'نسحب', they: 'يسحبوا', youmale: 'تسحب', youfemale: 'تسحبي', youplural: 'تسحبوا' }, 
                future: { i: 'بدي أسحب', he: 'بدو يسحب', she: 'بدها تسحب', we: 'بدنا نسحب', they: 'بدهم يسحبوا', youmale: 'بدك تسحب', youfemale: 'بدك تسحبي', youplural: 'بدكم تسحبوا' } 
            },
            100: { 
                past: { i: 'طرت', he: 'طار', she: 'طارت', we: 'طرنا', they: 'طاروا', youmale: 'طرت', youfemale: 'طرت', youplural: 'طرتم' }, 
                present: { i: 'أطير', he: 'يُطير', she: 'تطير', we: 'نطير', they: 'يُطيروا', youmale: 'تطير', youfemale: 'تطيري', youplural: 'تطيروا' }, 
                future: { i: 'بدي أطير', he: 'بدو يطير', she: 'بدها تطير', we: 'بدنا نطير', they: 'بدهم يطيروا', youmale: 'بدك تطير', youfemale: 'بدك تطيري', youplural: 'بدكم تطيروا' } 
            }
        };

        const ADVANCED_CATEGORIES = [
            {
                folder: '2',
                name: 'جملة من 2 كلمة',
                subcategories: [
                    { id: 1, name: 'فاعل + فعل حاضر' }, { id: 2, name: 'فاعل + فعل حاضر' },
                    { id: 3, name: 'مضاف + مضاف اليه' }, { id: 4, name: 'فعل مستقبل' },
                    { id: 5, name: 'فاعل + فعل ماضي' }, { id: 6, name: 'اسم + صفة' },
                    { id: 7, name: 'اسم اشارة/مكان + اسم' }, { id: 8, name: 'ظرف مكان + اسم' }
                ]
            },
            {
                folder: '3',
                name: 'جملة من 3 كلمة',
                subcategories: [
                    { id: 1, name: 'فاعل + فعل + مفعول به' }, { id: 2, name: 'فاعل + فعل حاضر + اسم' },
                    { id: 3, name: 'اسم + حرف عطف + اسم' }, { id: 4, name: 'فاعل + فعل مستقبل + مفعول به' },
                    { id: 5, name: 'فاعل + فعل ماضي + مفعول به' }, { id: 6, name: 'اسم + صفة + صفة' },
                    { id: 7, name: 'فاعل/ضمير + ملكية + اسم' }, { id: 8, name: 'فاعل + ظرف مكان + اسم' }
                ]
            },
            {
                folder: '4',
                name: 'جملة من 4 كلمة',
                subcategories: [
                    { id: 1, name: 'فاعل + فعل + مفعول به + صفة' }, { id: 2, name: 'فاعل + فعل + حرف عطف + فعل' },
                    { id: 3, name: 'فاعل + حرف عطف + فاعل + فعل' }, { id: 4, name: 'فاعل + فعل مستقبل + مفعول به' },
                    { id: 5, name: 'فاعل + فعل ماضي + مفعول به + اسم زمان' }, { id: 6, name: 'فاعل + فعل حاضر + مفعول به + اسم زمان' },
                    { id: 7, name: 'فاعل + فعل + حرف جر + اسم مكان' }, { id: 8, name: 'فاعل + ظرف مكان + اسم + صفة' }
                ]
            },
            {
                folder: '5',
                name: 'جملة من 5 كلمة',
                subcategories: [
                    { id: 1, name: 'فاعل + فعل + مفعول به + حرف جر + مكان' }, { id: 2, name: 'فاعل + فعل + حرف عطف + فاعل + فعل' },
                    { id: 3, name: 'فاعل + حرف عطف + فاعل + فعل + اسم زمان' }, { id: 4, name: 'فاعل + فعل مستقبل + مفعول به + صفة' },
                    { id: 5, name: 'فاعل + فعل ماضي + مفعول به + صفة + اسم زمان' }, { id: 6, name: 'فاعل + فعل حاضر + مفعول به + صفة + اسم زمان' },
                    { id: 7, name: 'فاعل + فعل + حرف عطف + فعل + اسم زمان' }, { id: 8, name: 'فاعل + صفة + فعل + حرف جر + اسم مكان' }
                ]
            },
            {
                folder: '6',
                name: 'جملة من 6 كلمة',
                subcategories: [
                    { id: 1, name: 'فاعل + فعل + مفعول به + حرف جر + مكان + زمان' }, { id: 2, name: 'فاعل + فعل + حرف عطف + فاعل + فعل + زمان' },
                    { id: 3, name: 'فاعل + حرف عطف + فاعل + فعل + حرف جر + مكان' }, { id: 4, name: 'فاعل + فعل مستقبل + مفعول به + صفة + زمان' },
                    { id: 5, name: 'فاعل + فعل ماضي + مفعول به / فاعل + فعل حاضر + مفعول به' }, { id: 6, name: 'فاعل + فعل حاضر + مفعول به / فاعل + فعل مستقبل + مفعول به' },
                    { id: 7, name: 'فاعل + فعل + حرف عطف + فعل + حرف جر + اسم مكان' }, { id: 8, name: 'فاعل + صفة + صفة + فعل + حرف جر + اسم مكان' }
                ]
            }
        ];


// Helper function to fetch item from database
const getDbItem = (catId, id, overrideTitle = null, extraProps = {}) => {
    const baseItem = ITEMS_DATABASE[catId]?.find(x => x.id === id) || { id, title: overrideTitle || '' };
    const item = { ...baseItem, categoryId: catId, ...extraProps };
    if (overrideTitle) {
        item.title = overrideTitle; 
        item.isAdvancedOverride = true; 
    }
    return item;
};

// --- SCALABLE REFERENCE DATABASE (Folder -> Subgroup -> Item 1 to 24) ---
const ADVANCED_REFERENCE_DB = {
    // ==========================================
    // FOLDER 2 (2-Word Sentences)
    // ==========================================
    "2": {
        1: { // Subgroup 1
             1: {
            title: "ولد ياكل",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        2: {
            title: "بنت تاكل",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 1, 'تاكل', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        3: {
            title: "بابا يسوق",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 61, 'يسوق', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        4: {
            title: "ماما تطبخ",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 26, 'تطبخ', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        5: {
            title: "عمو يسوق",
            slots: [
                getDbItem('01 subject', 15, 'عمو'),
                getDbItem('02 verbs', 61, 'يسوق', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        6: {
            title: "خالتو تلبس",
            slots: [
                getDbItem('01 subject', 14, 'خالتو'),
                getDbItem('02 verbs', 7, 'تلبس', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        7: {
            title: "ولدين يلعبوا",
            slots: [
                getDbItem('01 subject', 3, 'ولدين'),
                getDbItem('02 verbs', 30, 'يلعبوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        8: {
            title: "بنتين ياكلوا",
            slots: [
                getDbItem('01 subject', 11, 'بنتين'),
                getDbItem('02 verbs', 1, 'ياكلوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        9: {
            title: "اولاد يرسموا",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 55, 'يرسموا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        10: {
            title: "بنات يشموا",
            slots: [
                getDbItem('01 subject', 9, 'بنات'),
                getDbItem('02 verbs', 11, 'يشموا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        11: {
            title: "فيل يشرب",
            slots: [
                getDbItem('01 subject', 90, 'فيل'),
                getDbItem('02 verbs', 2, 'يشرب', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        12: {
            title: "دكتور يعطي",
            slots: [
                getDbItem('01 subject', 21, 'دكتور'),
                getDbItem('02 verbs', 48, 'يعطي', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        13: {
            title: "قطة تسمع",
            slots: [
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('02 verbs', 9, 'تسمع', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        14: {
            title: "كلب يشوف",
            slots: [
                getDbItem('01 subject', 74, 'كلب'),
                getDbItem('02 verbs', 8, 'يشوف', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        15: {
            title: "عمو يبني",
            slots: [
                getDbItem('01 subject', 15, 'عمو'),
                getDbItem('02 verbs', 84, 'يبني', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        16: {
            title: "شرطي يمسك",
            slots: [
                getDbItem('01 subject', 24, 'شرطي'),
                getDbItem('02 verbs', 31, 'يمسك', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        17: {
            title: "شرطي يمسك",
            slots: [
                getDbItem('01 subject', 24, 'شرطي'),
                getDbItem('02 verbs', 31, 'يمسك', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        18: {
            title: "عصفور ياكل",
            slots: [
                getDbItem('03 object', 13, 'عصفور'),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        19: {
            title: "استاذ يعطي",
            slots: [
                getDbItem('01 subject', 16, 'استاذ'),
                getDbItem('02 verbs', 48, 'يعطي', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        20: {
            title: "مصلح يصلح",
            slots: [
                getDbItem('01 subject', 67, 'مصلح'),
                getDbItem('02 verbs', 72, 'يصلح', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        21: {
            title: "ملك يشوف",
            slots: [
                getDbItem('01 subject', 48, 'ملك'),
                getDbItem('02 verbs', 8, 'يشوف', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        22: {
            title: "تاتا تقرا",
            slots: [
                getDbItem('01 subject', 12, 'تاتا'),
                getDbItem('02 verbs', 58, 'تقرا', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        23: {
            title: "جدو ينزل",
            slots: [
                getDbItem('01 subject', 13, 'جدو'),
                getDbItem('02 verbs', 19, 'ينزل', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        24: {
            title: "ديناصور يوقف",
            slots: [
                getDbItem('01 subject', 84, 'ديناصور'),
                getDbItem('02 verbs', 13, 'يوقف', { verbTense: 'present', conjugation: 'he' })
            ]
        }
        },
        2: { // Subgroup 2
        1: {
            title: "ولدين ياكلوا",
            slots: [
                getDbItem('01 subject', 3, 'ولدين'),
                getDbItem('02 verbs', 1, 'ياكلوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        2: {
            title: "ولدين يمشطوا",
            slots: [
                getDbItem('01 subject', 3, 'ولدين'),
                getDbItem('02 verbs', 3, 'يمشطوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        3: {
            title: "بنتين يشربوا",
            slots: [
                getDbItem('01 subject', 11, 'بنتين'),
                getDbItem('02 verbs', 2, 'يشربوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        4: {
            title: "بنتين يسمعوا",
            slots: [
                getDbItem('01 subject', 11, 'بنتين'),
                getDbItem('02 verbs', 9, 'يسمعوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        5: {
            title: "اولاد يفرشوا",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 32, 'يفرشوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        6: {
            title: "اولاد يشوفوا",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 8, 'يشوفوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        7: {
            title: "اولاد يلعبوا",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 30, 'يلعبوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        8: {
            title: "اولاد يلعبوا",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 30, 'يلعبوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        9: {
            title: "بنات يرسموا",
            slots: [
                getDbItem('01 subject', 9, 'بنات'),
                getDbItem('02 verbs', 55, 'يرسموا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        10: {
            title: "كلاب يمسكوا",
            slots: [
                getDbItem('01 subject', 76, 'كلاب'),
                getDbItem('02 verbs', 31, 'يمسكوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        11: {
            title: "قطط يمسكوا",
            slots: [
                getDbItem('01 subject', 73, 'قطط'),
                getDbItem('02 verbs', 31, 'يمسكوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        12: {
            title: "نحلات يشموا",
            slots: [
                getDbItem('01 subject', 70, 'نحلات'),
                getDbItem('02 verbs', 11, 'يشموا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        13: {
            title: "زرافات ياكلوا",
            slots: [
                getDbItem('01 subject', 116, 'زرافتين'),
                getDbItem('02 verbs', 1, 'ياكلوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        14: {
            title: "ذئاب يطلعوا",
            slots: [
                getDbItem('01 subject', 115, 'ذئاب'),
                getDbItem('02 verbs', 20, 'يطلعوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        15: {
            title: "فيران يسرقوا",
            slots: [
                getDbItem('01 subject', 79, 'فيران'),
                getDbItem('02 verbs', 93, 'يسرقوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        16: {
            title: "نملات يحملوا",
            slots: [
                getDbItem('01 subject', 83, 'نملات'),
                getDbItem('02 verbs', 47, 'يحملوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        17: {
            title: "رسامين يرسموا",
            slots: [
                getDbItem('01 subject', 55, 'رسامين'),
                getDbItem('02 verbs', 55, 'يرسموا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        18: {
            title: "دودات يتسلقوا",
            slots: [
                getDbItem('01 subject', 88, 'دودات'),
                getDbItem('02 verbs', 22, 'يتسلقوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        19: {
            title: "طلاب يرسموا",
            slots: [
                getDbItem('01 subject', 20, 'طلاب'),
                getDbItem('02 verbs', 55, 'يرسموا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        20: {
            title: "شرطة يسمعوا",
            slots: [
                getDbItem('01 subject', 26, 'شرطة'),
                getDbItem('02 verbs', 9, 'يسمعوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        21: {
            title: "اولاد يشوفوا",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 8, 'يشوفوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        22: {
            title: "بنات يلمسوا",
            slots: [
                getDbItem('01 subject', 9, 'بنات'),
                getDbItem('02 verbs', 10, 'يلمسوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        23: {
            title: "دكاترة يحكوا",
            slots: [
                getDbItem('01 subject', 23, 'دكاترة'),
                getDbItem('02 verbs', 29, 'يحكوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        24: {
            title: "اشباح يعيطوا",
            slots: [
                getDbItem('01 subject', 110, 'اشباح'),
                getDbItem('02 verbs', 35, 'يعيطوا', { verbTense: 'present', conjugation: 'they' })
            ]
        }
        },
        3: { // Subgroup 3
        1: {
            title: "غرفة النوم",
            slots: [
                getDbItem('04 place', 63, 'غرفة'),
                getDbItem('04 place', 64, 'النوم')
            ]
        },
        2: {
            title: "ساحة المدرسة",
            slots: [
                getDbItem('04 place', 65, 'ساحة'),
                getDbItem('04 place', 47, 'المدرسة')
            ]
        },
        3: {
            title: "غرفة الصف",
            slots: [
                getDbItem('04 place', 63, 'غرفة'),
                getDbItem('04 place', 18, 'الصف')
            ]
        },
        4: {
            title: "مفتاح الباب",
            slots: [
                getDbItem('03 object', 158, 'مفتاح'),
                getDbItem('01 subject', 131, 'الباب')
            ]
        },
        5: {
            title: "ممر المشاة",
            slots: [
                getDbItem('04 place', 66, 'ممر'),
                getDbItem('04 place', 67, 'المشاة')
            ]
        },
        6: {
            title: "موقف الباص",
            slots: [
                getDbItem('01 subject', 132, 'موقف'),
                getDbItem('01 subject', 133, 'الباص')
            ]
        },
        7: {
            title: "اشارة المرور",
            slots: [
                getDbItem('01 subject', 134, 'اشارة'),
                getDbItem('01 subject', 135, 'المرور')
            ]
        },
        8: {
            title: "ساعة الحائط",
            slots: [
                getDbItem('03 object', 32, 'ساعة'),
                getDbItem('01 subject', 118, 'الحائط')
            ]
        },
        9: {
            title: "سيارة الاسعاف",
            slots: [
                getDbItem('03 object', 25, 'سيارة'),
                getDbItem('01 subject', 119, 'الاسعاف')
            ]
        },
        10: {
            title: "شاحن الموبايل",
            slots: [
                getDbItem('03 object', 29, 'شاحن'),
                getDbItem('01 subject', 120, 'الموبايل')
            ]
        },
        11: {
            title: "بيت الشجرة",
            slots: [
                getDbItem('03 object', 94, 'بيت'),
                getDbItem('03 object', 149, 'الشجرة')
            ]
        },
        12: {
            title: "عسل النحل",
            slots: [
                getDbItem('03 object', 54, 'عسل'),
                getDbItem('01 subject', 121, 'النحل')
            ]
        },
        13: {
            title: "باب البيت",
            slots: [
                getDbItem('03 object', 36, 'باب'),
                getDbItem('01 subject', 122, 'البيت')
            ]
        },
        14: {
            title: "سجادة الصالون",
            slots: [
                getDbItem('03 object', 26, 'سجادة'),
                getDbItem('04 place', 60, 'الصالون')
            ]
        },
        15: {
            title: "سكين الفواكه",
            slots: [
                getDbItem('03 object', 61, 'سكين'),
                getDbItem('01 subject', 123, 'الفواكه')
            ]
        },
        16: {
            title: "قمر الليل",
            slots: [
                getDbItem('03 object', 68, 'قمر'),
                getDbItem('01 subject', 124, 'الليل')
            ]
        },
        17: {
            title: "شمس الصبح",
            slots: [
                getDbItem('03 object', 111, 'شمس'),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        18: {
            title: "عش العصفور",
            slots: [
                getDbItem('03 object', 73, 'عش'),
                getDbItem('01 subject', 125, 'العصفور')
            ]
        },
        19: {
            title: "سماعة دكتور",
            slots: [
                getDbItem('03 object', 161, 'سماعة'),
                getDbItem('01 subject', 21, 'دكتور')
            ]
        },
        20: {
            title: "فرشاة الاسنان",
            slots: [
                getDbItem('01 subject', 126, 'فرشاة'),
                getDbItem('01 subject', 127, 'الاسنان')
            ]
        },
        21: {
            title: "معجون الاسنان",
            slots: [
                getDbItem('01 subject', 128, 'معجون'),
                getDbItem('01 subject', 127, 'الاسنان')
            ]
        },
        22: {
            title: "حيط المدرسة",
            slots: [
                getDbItem('03 object', 128, 'حيط'),
                getDbItem('04 place', 47, 'المدرسة')
            ]
        },
        23: {
            title: "سيارة الاطفاء",
            slots: [
                getDbItem('03 object', 25, 'سيارة'),
                getDbItem('01 subject', 129, 'الاطفاء')
            ]
        },
        24: {
            title: "سيارة الشرطة",
            slots: [
                getDbItem('03 object', 25, 'سيارة'),
                getDbItem('01 subject', 130, 'الشرطة')

                ]
            }
        },
        4: { // Subgroup 4
        1: {
            title: "بدو ياكل",
            slots: [
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        2: {
            title: "بدها تشرب",
            slots: [
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 2, 'تشرب', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        3: {
            title: "بدو يصلح",
            slots: [
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 72, 'يصلح', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        4: {
            title: "بدها تطبخ",
            slots: [
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 26, 'تطبخ', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        5: {
            title: "بدهم ياكلوا",
            slots: [
                getDbItem('02 verbs', 15, 'بدهم', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('02 verbs', 1, 'ياكلوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        6: {
            title: "بدو يرسم",
            slots: [
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 55, 'يرسم', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        7: {
            title: "بدها تطلع",
            slots: [
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 20, 'تطلع', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        8: {
            title: "بدو يسكر",
            slots: [
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 51, 'يسكر', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        9: {
            title: "بدها تمشط",
            slots: [
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 3, 'تمشط', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        10: {
            title: "بدو ياكل",
            slots: [
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        11: {
            title: "بدهم يلبسوا",
            slots: [
                getDbItem('02 verbs', 15, 'بدهم', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('02 verbs', 7, 'يلبسوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        12: {
            title: "بدهم يناموا",
            slots: [
                getDbItem('02 verbs', 15, 'بدهم', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('02 verbs', 6, 'يناموا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        13: {
            title: "بدو ياكل",
            slots: [
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        14: {
            title: "بدها تشرب",
            slots: [
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 2, 'تشرب', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        15: {
            title: "بدها تاكل",
            slots: [
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 1, 'تاكل', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        16: {
            title: "بدو يمسك",
            slots: [
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 31, 'يمسك', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        17: {
            title: "بدها تطلع",
            slots: [
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 20, 'تطلع', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        18: {
            title: "بدو ينزل",
            slots: [
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 19, 'ينزل', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        19: {
            title: "بدو يخبز",
            slots: [
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 25, 'يخبز', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        20: {
            title: "بدو يعطي",
            slots: [
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 48, 'يعطي', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        21: {
            title: "بدها تحمل",
            slots: [
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 47, 'تحمل', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        22: {
            title: "بدو ياكل",
            slots: [
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        23: {
            title: "بدو يطلع",
            slots: [
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 20, 'يطلع', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        24: {
            title: "بدو يشتري",
            slots: [
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 46, 'يشتري', { verbTense: 'present', conjugation: 'he' })
                ]
            }
        },
        5: { // Subgroup 5
        1: {
            title: "ولد أكل",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 1, 'أكل', { verbTense: 'past', conjugation: 'he' })
            ]
        },
        2: {
            title: "بنت أكلت",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 1, 'أكلت', { verbTense: 'past', conjugation: 'she' })
            ]
        },
        3: {
            title: "ولد شرب",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 2, 'شرب', { verbTense: 'past', conjugation: 'he' })
            ]
        },
        4: {
            title: "بنت شربت",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 2, 'شربت', { verbTense: 'past', conjugation: 'she' })
            ]
        },
        5: {
            title: "بابا غسل",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 4, 'غسل', { verbTense: 'past', conjugation: 'he' })
            ]
        },
        6: {
            title: "ماما غسلت",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 4, 'غسلت', { verbTense: 'past', conjugation: 'she' })
            ]
        },
        7: {
            title: "بابا تحمم",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 5, 'تحمم', { verbTense: 'past', conjugation: 'he' })
            ]
        },
        8: {
            title: "ماما تحممت",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 5, 'تحممت', { verbTense: 'past', conjugation: 'she' })
            ]
        },
        9: {
            title: "قطة نامت",
            slots: [
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('02 verbs', 6, 'نامت', { verbTense: 'past', conjugation: 'she' })
            ]
        },
        10: {
            title: "كلب نام",
            slots: [
                getDbItem('01 subject', 74, 'كلب'),
                getDbItem('02 verbs', 6, 'نام', { verbTense: 'past', conjugation: 'he' })
            ]
        },
        11: {
            title: "اولاد لعبوا",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 30, 'لعبوا', { verbTense: 'past', conjugation: 'they' })
            ]
        },
        12: {
            title: "بنات لعبوا",
            slots: [
                getDbItem('01 subject', 9, 'بنات'),
                getDbItem('02 verbs', 30, 'لعبوا', { verbTense: 'past', conjugation: 'they' })
            ]
        },
        13: {
            title: "فارة طلعت",
            slots: [
                getDbItem('01 subject', 77, 'فارة'),
                getDbItem('02 verbs', 20, 'طلعت', { verbTense: 'past', conjugation: 'I' })
            ]
        },
        14: {
            title: "مصلح صلح",
            slots: [
                getDbItem('01 subject', 67, 'مصلح'),
                getDbItem('02 verbs', 72, 'صلح', { verbTense: 'past', conjugation: 'he' })
            ]
        },
        15: {
            title: "ولد فتح",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 50, 'فتح', { verbTense: 'past', conjugation: 'he' })
            ]
        },
        16: {
            title: "بنت ساعدت",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 75, 'ساعدت', { verbTense: 'past', conjugation: 'she' })
            ]
        },
        17: {
            title: "بابا قطف",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 83, 'قطف', { verbTense: 'past', conjugation: 'he' })
            ]
        },
        18: {
            title: "ماما ضبت",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 81, 'ضبت', { verbTense: 'past', conjugation: 'she' })
            ]
        },
        19: {
            title: "عمو شاف",
            slots: [
                getDbItem('01 subject', 15, 'عمو'),
                getDbItem('02 verbs', 8, 'شاف', { verbTense: 'past', conjugation: 'he' })
            ]
        },
        20: {
            title: "ولد كتب",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 57, 'كتب', { verbTense: 'past', conjugation: 'he' })
            ]
        },
        21: {
            title: "بنت رسمت",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 55, 'رسمت', { verbTense: 'past', conjugation: 'she' })
            ]
        },
        22: {
            title: "تاتا لمست",
            slots: [
                getDbItem('01 subject', 12, 'تاتا'),
                getDbItem('02 verbs', 10, 'لمست', { verbTense: 'past', conjugation: 'she' })
            ]
        },
        23: {
            title: "بابا شخر",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 90, 'شخر', { verbTense: 'past', conjugation: 'he' })
            ]
        },
        24: {
            title: "ولد نفخ",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 33, 'نفخ', { verbTense: 'past', conjugation: 'he' })
                ]
            }
        },
        6: { // Subgroup 6
        1: {
            title: "تفاحة حمرا",
            slots: [
                getDbItem('03 object', 3, 'تفاحة'),
                getDbItem('10 colors', 10, 'حمرا')
            ]
        },
        2: {
            title: "موزة صفرا",
            slots: [
                getDbItem('03 object', 5, 'موزة'),
                getDbItem('10 colors', 12, 'صفرا')
            ]
        },
        3: {
            title: "طابة خضرا",
            slots: [
                getDbItem('03 object', 4, 'طابة'),
                getDbItem('10 colors', 6, 'خضرا')
            ]
        },
        4: {
            title: "طيارة بيضا",
            slots: [
                getDbItem('03 object', 84, 'طيارة'),
                getDbItem('10 colors', 11, 'بيضا')
            ]
        },
        5: {
            title: "كلب سعيد",
            slots: [
                getDbItem('01 subject', 74, 'كلب'),
                getDbItem('05 adjectives', 44, 'سعيد')
            ]
        },
        6: {
            title: "قطة حزينة",
            slots: [
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('05 adjectives', 43, 'حزينة')
            ]
        },
        7: {
            title: "عصفور معصب",
            slots: [
                getDbItem('03 object', 13, 'عصفور'),
                getDbItem('05 adjectives', 45, 'معصب')
            ]
        },
        8: {
            title: "ولد حزين",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('05 adjectives', 43, 'حزين')
            ]
        },
        9: {
            title: "بنت سعيدة",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('05 adjectives', 44, 'سعيدة')
            ]
        },
        10: {
            title: "ماما قصيرة",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('05 adjectives', 31, 'قصيرة')
            ]
        },
        11: {
            title: "بابا طويل",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('05 adjectives', 32, 'طويل')
            ]
        },
        12: {
            title: "بوط وسخ",
            slots: [
                getDbItem('03 object', 98, 'بوط'),
                getDbItem('05 adjectives', 8, 'وسخ')
            ]
        },
        13: {
            title: "سمكة طويلة",
            slots: [
                getDbItem('01 subject', 93, 'سمكة'),
                getDbItem('05 adjectives', 32, 'طويلة')
            ]
        },
        14: {
            title: "دودة صفرا",
            slots: [
                getDbItem('01 subject', 86, 'دودة'),
                getDbItem('10 colors', 12, 'صفرا')
            ]
        },
        15: {
            title: "فيل كبير",
            slots: [
                getDbItem('01 subject', 90, 'فيل'),
                getDbItem('05 adjectives', 5, 'كبير')
            ]
        },
        16: {
            title: "فارة صغيرة",
            slots: [
                getDbItem('01 subject', 77, 'فارة'),
                getDbItem('05 adjectives', 6, 'صغيرة')
            ]
        },
        17: {
            title: "وردة زرقا",
            slots: [
                getDbItem('03 object', 43, 'وردة'),
                getDbItem('10 colors', 3, 'زرقا')
            ]
        },
        18: {
            title: "ايس كريم باردة",
            slots: [
                getDbItem('03 object', 56, 'بوظة'),
                getDbItem('05 adjectives', 11, 'باردة')
            ]
        },
        19: {
            title: "حليب ساخن",
            slots: [
                getDbItem('03 object', 67, 'حليب'),
                getDbItem('05 adjectives', 12, 'ساخن')
            ]
        },
        20: {
            title: "بيضة لذيذة",
            slots: [
                getDbItem('03 object', 39, 'بيضة'),
                getDbItem('05 adjectives', 46, 'لذيذة')
            ]
        },
        21: {
            title: "ولد وسخ",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('05 adjectives', 8, 'وسخ')
            ]
        },
        22: {
            title: "بنت وسخة",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('05 adjectives', 8, 'وسخة')
            ]
        },
        23: {
            title: "زرافة طويلة",
            slots: [
                getDbItem('01 subject', 111, 'زرافة'),
                getDbItem('05 adjectives', 32, 'طويلة')
            ]
        },
        24: {
            title: "دب بني",
            slots: [
                getDbItem('03 object', 8, 'دب'),
                getDbItem('10 colors', 4, 'بني')
                ]
            }
            // ... Add items 2 up to 24 here for Subgroup 2
        },
        7: { // Subgroup 7
        1: {
            title: "هذا ولد",
            slots: [
                getDbItem('07 Pronoun', 4, 'هذا'),
                getDbItem('01 subject', 1, 'ولد')
            ]
        },
        2: {
            title: "هدول اولاد",
            slots: [
                getDbItem('07 pronoun', 11, 'هدول'),
                getDbItem('01 subject', 4, 'اولاد')
            ]
        },
        3: {
            title: "هذه بنت",
            slots: [
                getDbItem('07 pronoun', 5, 'هذه'),
                getDbItem('01 subject', 2, 'بنت')
            ]
        },
        4: {
            title: "هذا بابا",
            slots: [
                getDbItem('07 pronoun', 4, 'هذا'),
                getDbItem('01 subject', 5, 'بابا')
            ]
        },
        5: {
            title: "هدول بنات",
            slots: [
                getDbItem('07 pronoun', 11, 'هدول'),
                getDbItem('01 subject', 9, 'بنات')
            ]
        },
        6: {
            title: "هذه ماما",
            slots: [
                getDbItem('07 pronoun', 5, 'هذه'),
                getDbItem('01 subject', 6, 'ماما')
            ]
        },
        7: {
            title: "هذه قبعة",
            slots: [
                getDbItem('07 pronoun', 5, 'هذه'),
                getDbItem('03 object', 24, 'قبعة')
            ]
        },
        8: {
            title: "هذا كتاب",
            slots: [
                getDbItem('07 pronoun', 4, 'هذا'),
                getDbItem('03 object', 17, 'كتاب')
            ]
        },
        9: {
            title: "هذا قلم",
            slots: [
                getDbItem('07 pronoun', 4, 'هذا'),
                getDbItem('03 object', 80, 'قلم')
            ]
        },
        10: {
            title: "هذه تفاحة",
            slots: [
                getDbItem('07 pronoun', 5, 'هذه'),
                getDbItem('03 object', 3, 'تفاحة')
            ]
        },
        11: {
            title: "هذه سيارة",
            slots: [
                getDbItem('07 pronoun', 5, 'هذه'),
                getDbItem('03 object', 25, 'سيارة')
            ]
        },
        12: {
            title: "هذه طيارة",
            slots: [
                getDbItem('07 pronoun', 5, 'هذه'),
                getDbItem('03 object', 84, 'طيارة')
            ]
        },
        13: {
            title: "هي نملة",
            slots: [
                getDbItem('07 pronoun', 5, 'هي'),
                getDbItem('03 object', 2, 'نملة')
            ]
        },
        14: {
            title: "هدول نملات",
            slots: [
                getDbItem('07 pronoun', 11, 'هدول'),
                getDbItem('01 subject', 83, 'نملات')
            ]
        },
        15: {
            title: "هي سيارة",
            slots: [
                getDbItem('07 pronoun', 5, 'هي'),
                getDbItem('03 object', 25, 'سيارة')
            ]
        },
        16: {
            title: "هدول سيارات",
            slots: [
                getDbItem('07 pronoun', 11, 'هدول'),
                getDbItem('03 object', 156, 'سيارات')
            ]
        },
        17: {
            title: "هي قطة",
            slots: [
                getDbItem('07 pronoun', 5, 'هي'),
                getDbItem('01 subject', 71, 'قطة')
            ]
        },
        18: {
            title: "هدول قطط",
            slots: [
                getDbItem('07 pronoun', 11, 'هدول'),
                getDbItem('01 subject', 73, 'قطط')
            ]
        },
        19: {
            title: "هذا كتاب",
            slots: [
                getDbItem('07 pronoun', 4, 'هذا'),
                getDbItem('03 object', 17, 'كتاب')
            ]
        },
        20: {
            title: "هدول كتب",
            slots: [
                getDbItem('07 pronoun', 11, 'هدول'),
                getDbItem('03 object', 57, 'كتب')
            ]
        },
        21: {
            title: "هذا موبايل",
            slots: [
                getDbItem('07 pronoun', 4, 'هذا'),
                getDbItem('03 object', 82, 'موبايل')
            ]
        },
        22: {
            title: "هدول موبايلات",
            slots: [
                getDbItem('07 pronoun', 11, 'هدول'),
                getDbItem('03 object', 157, 'موبايلات')
            ]
        },
        23: {
            title: "هذه مفتاح",
            slots: [
                getDbItem('07 pronoun', 5, 'هذه'),
                getDbItem('03 object', 158, 'مفتاح')
            ]
        },
        24: {
            title: "هدول مفاتيح",
            slots: [
                getDbItem('07 pronoun', 11, 'هدول'),
                getDbItem('03 object', 60, 'مفاتيح')
                ]
            }
        },
        8: { // Subgroup 8
        1: {
            title: "فوق الشجرة",
            slots: [
                getDbItem('05 adjectives', 38, 'فوق'),
                getDbItem('03 object', 149, 'الشجرة')
            ]
        },
        2: {
            title: "تحت الشجرة",
            slots: [
                getDbItem('09 Prepositions', 10, 'تحت'),
                getDbItem('03 object', 149, 'الشجرة')
            ]
        },
        3: {
            title: "امام البيت",
            slots: [
                getDbItem('09 Prepositions', 5, 'امام') ,
                getDbItem('01 subject', 122, 'البيت')
            ]
        },
        4: {
            title: "جنب سيارة",
            slots: [
                getDbItem('09 Prepositions', 8, 'جنب'),
                getDbItem('03 object', 25, 'سيارة')
            ]
        },
        5: {
            title: "بين وردات",
            slots: [
                getDbItem('09 Prepositions', 2, 'بين'),
                getDbItem('03 object', 134, 'وردات')
            ]
        },
        6: {
            title: "خلف حجرة",
            slots: [
                getDbItem('09 Prepositions', 1, 'خلف'),
                getDbItem('03 object', 151, 'حجرة')
            ]
        },
        7: {
            title: "جوا صندوق",
            slots: [
                getDbItem('05 adjectives', 23, 'جوا'),
                getDbItem('03 object', 18, 'صندوق')
            ]
        },
        8: {
            title: "برا صندوق",
            slots: [
                getDbItem('05 adjectives', 24, 'برا'),
                getDbItem('03 object', 18, 'صندوق')
            ]
        },
        9: {
            title: "على طابة",
            slots: [
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 4, 'طابة')
            ]
        },
        10: {
            title: "على طابة",
            slots: [
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 4, 'طابة')
            ]
        },
        11: {
            title: "فوق نملة",
            slots: [
                getDbItem('05 adjectives', 38, 'فوق'),
                getDbItem('03 object', 2, 'نملة')
            ]
        },
        12: {
            title: "تحت فيل",
            slots: [
                getDbItem('09 Prepositions', 10, 'تحت'),
                getDbItem('01 subject', 90, 'فيل')
            ]
        },
        13: {
            title: "جنب براد",
            slots: [
                getDbItem('09 Prepositions', 8, 'جنب'),
                getDbItem('03 object', 45, 'براد')
            ]
        },
        14: {
            title: "جنب سيارة",
            slots: [
                getDbItem('09 Prepositions', 8, 'جنب'),
                getDbItem('03 object', 25, 'سيارة')
            ]
        },
        15: {
            title: "تحت طاولة",
            slots: [
                getDbItem('09 Prepositions', 10, 'تحت'),
                getDbItem('03 object', 114, 'طاولة')
            ]
        },
        16: {
            title: "على كرسي",
            slots: [
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 28, 'كرسي')
            ]
        },
        17: {
            title: "جنب فارة",
            slots: [
                getDbItem('09 Prepositions', 8, 'جنب'),
                getDbItem('01 subject', 77, 'فارة')
            ]
        },
        18: {
            title: "تحت بطانية",
            slots: [
                getDbItem('09 Prepositions', 10, 'تحت'),
                getDbItem('03 object', 15, 'بطانية')
            ]
        },
        19: {
            title: "على بطانية",
            slots: [
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 15, 'بطانية')
            ]
        },
        20: {
            title: "في عرباية",
            slots: [
                getDbItem('08 conjunctions', 11, 'في'),
                getDbItem('03 object', 110, 'عرباية')
            ]
        },
        21: {
            title: "في تخت",
            slots: [
                getDbItem('08 conjunctions', 11, 'في'),
                getDbItem('03 object', 9, 'تخت')
            ]
        },
        22: {
            title: "على صوفا",
            slots: [
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 104, 'صوفا')
            ]
        },
        23: {
            title: "في بيت",
            slots: [
                getDbItem('08 conjunctions', 11, 'في'),
                getDbItem('03 object', 94, 'بيت')
            ]
        },
        24: {
            title: "في سيارة",
            slots: [
                getDbItem('08 conjunctions', 11, 'في'),
                getDbItem('03 object', 25, 'سيارة')
                ]
            }
        }
    },
    // ==========================================
    // FOLDER 3 (3-Word Sentences)
    // ==========================================
    "3": {
        1: { // Subgroup 1
        1: {
            title: "ولد ياكل تفاحة",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 3, 'تفاحة')
            ]
        },
        2: {
            title: "بنت تاكل بيتزا",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 1, 'تاكل', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 133, 'بيتزا')
            ]
        },
        3: {
            title: "بابا يسوق سيارة",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 61, 'يسوق', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 25, 'سيارة')
            ]
        },
        4: {
            title: "ماما تطبخ معكرونة",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 26, 'تطبخ', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 106, 'معكرونة')
            ]
        },
        5: {
            title: "عمو يسوق باص",
            slots: [
                getDbItem('01 subject', 15, 'عمو'),
                getDbItem('02 verbs', 61, 'يسوق', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 23, 'باص')
            ]
        },
        6: {
            title: "خالتو تلبس جاكيت",
            slots: [
                getDbItem('01 subject', 14, 'خالتو'),
                getDbItem('02 verbs', 7, 'تلبس', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 58, 'جاكيت')
            ]
        },
        7: {
            title: "ولدين يلعبوا طابة",
            slots: [
                getDbItem('01 subject', 3, 'ولدين'),
                getDbItem('02 verbs', 30, 'يلعبوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 4, 'طابة')
            ]
        },
        8: {
            title: "بنتين ياكلوا فواكه",
            slots: [
                getDbItem('01 subject', 11, 'بنتين'),
                getDbItem('02 verbs', 1, 'ياكلوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 47, 'فواكه')
            ]
        },
        9: {
            title: "اولاد يرسموا سمكة",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 55, 'يرسموا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('01 subject', 93, 'سمكة')
            ]
        },
        10: {
            title: "بنات يشموا وردات",
            slots: [
                getDbItem('01 subject', 9, 'بنات'),
                getDbItem('02 verbs', 11, 'يشموا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 134, 'وردات')
            ]
        },
        11: {
            title: "فيل يشرب مي",
            slots: [
                getDbItem('01 subject', 90, 'فيل'),
                getDbItem('02 verbs', 2, 'يشرب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 129, 'مي')
            ]
        },
        12: {
            title: "دكتور يعطي ابرة",
            slots: [
                getDbItem('01 subject', 21, 'دكتور'),
                getDbItem('02 verbs', 48, 'يعطي', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 72, 'ابرة')
            ]
        },
        13: {
            title: "قطة تسمع صوت",
            slots: [
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('02 verbs', 9, 'تسمع', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 135, 'صوت')
            ]
        },
        14: {
            title: "كلب يشوف شاحنة",
            slots: [
                getDbItem('01 subject', 74, 'كلب'),
                getDbItem('02 verbs', 8, 'يشوف', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 125, 'شاحنة')
            ]
        },
        15: {
            title: "عمو يبني بناية",
            slots: [
                getDbItem('01 subject', 15, 'عمو'),
                getDbItem('02 verbs', 84, 'يبني', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 136, 'بناية')
            ]
        },
        16: {
            title: "شرطي يمسك قطة",
            slots: [
                getDbItem('01 subject', 24, 'شرطي'),
                getDbItem('02 verbs', 31, 'يمسك', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('01 subject', 71, 'قطة')
            ]
        },
        17: {
            title: "شرطي يمسك حرامي",
            slots: [
                getDbItem('01 subject', 24, 'شرطي'),
                getDbItem('02 verbs', 31, 'يمسك', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('01 subject', 59, 'حرامي')
            ]
        },
        18: {
            title: "عصفور ياكل دودة",
            slots: [
                getDbItem('03 object', 13, 'عصفور'),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('01 subject', 86, 'دودة')
            ]
        },
        19: {
            title: "استاذ يعطي طلاب",
            slots: [
                getDbItem('01 subject', 16, 'استاذ'),
                getDbItem('02 verbs', 48, 'يعطي', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('01 subject', 20, 'طلاب')
            ]
        },
        20: {
            title: "مصلح يصلح غسالة",
            slots: [
                getDbItem('01 subject', 67, 'مصلح'),
                getDbItem('02 verbs', 72, 'يصلح', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 137, 'غسالة')
            ]
        },
        21: {
            title: "ملك يشوف ملكة",
            slots: [
                getDbItem('01 subject', 48, 'ملك'),
                getDbItem('02 verbs', 8, 'يشوف', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('01 subject', 49, 'ملكة')
            ]
        },
        22: {
            title: "تاتا تقرا كتاب",
            slots: [
                getDbItem('01 subject', 12, 'تاتا'),
                getDbItem('02 verbs', 58, 'تقرا', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 17, 'كتاب')
            ]
        },
        23: {
            title: "جدو ينزل درج",
            slots: [
                getDbItem('01 subject', 13, 'جدو'),
                getDbItem('02 verbs', 19, 'ينزل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 109, 'درج')
            ]
        },
        24: {
            title: "ديناصور يلبس طاقية",
            slots: [
                getDbItem('01 subject', 84, 'ديناصور'),
                getDbItem('02 verbs', 7, 'يلبس', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 53, 'طاقية')
            ]
        }
        },
        2: { // Subgroup 2
        1: {
            title: "ولدين ياكلوا تفاح",
            slots: [
                getDbItem('01 subject', 3, 'ولدين'),
                getDbItem('02 verbs', 1, 'ياكلوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 150, 'تفاح')
            ]
        },
        2: {
            title: "ولدين يمشطوا شعر",
            slots: [
                getDbItem('01 subject', 3, 'ولدين'),
                getDbItem('02 verbs', 3, 'يمشطوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 49, 'شعر')
            ]
        },
        3: {
            title: "بنتين يشربوا عصير",
            slots: [
                getDbItem('01 subject', 11, 'بنتين'),
                getDbItem('02 verbs', 2, 'يشربوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 59, 'عصير')
            ]
        },
        4: {
            title: "بنتين يسمعوا صوت",
            slots: [
                getDbItem('01 subject', 11, 'بنتين'),
                getDbItem('02 verbs', 9, 'يسمعوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 135, 'صوت')
            ]
        },
        5: {
            title: "اولاد يفرشوا اسنان",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 32, 'يفرشوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 152, 'اسنان')
            ]
        },
        6: {
            title: "اولاد يشوفوا تلفزيون",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 8, 'يشوفوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 126, 'تلفزيون')
            ]
        },
        7: {
            title: "اولاد يلعبوا طابة",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 30, 'يلعبوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 4, 'طابة')
            ]
        },
        8: {
            title: "اولاد يلعبوا طابة",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 30, 'يلعبوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 4, 'طابة')
            ]
        },
        9: {
            title: "بنات يرسموا فراشة",
            slots: [
                getDbItem('01 subject', 9, 'بنات'),
                getDbItem('02 verbs', 55, 'يرسموا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 153, 'فراشة')
            ]
        },
        10: {
            title: "كلاب يمسكوا قطة",
            slots: [
                getDbItem('01 subject', 76, 'كلاب'),
                getDbItem('02 verbs', 31, 'يمسكوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('01 subject', 71, 'قطة')
            ]
        },
        11: {
            title: "قطط يمسكوا عصفور",
            slots: [
                getDbItem('01 subject', 73, 'قطط'),
                getDbItem('02 verbs', 31, 'يمسكوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 13, 'عصفور')
            ]
        },
        12: {
            title: "نحلات يشموا وردة",
            slots: [
                getDbItem('01 subject', 70, 'نحلات'),
                getDbItem('02 verbs', 11, 'يشموا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 43, 'وردة')
            ]
        },
        13: {
            title: "زرافات ياكلوا الشجرة",
            slots: [
                getDbItem('01 subject', 117, 'زرافات'),
                getDbItem('02 verbs', 1, 'ياكلوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 149, 'الشجرة')
            ]
        },
        14: {
            title: "كلاب يطلعوا الجبل",
            slots: [
                getDbItem('01 subject', 76, 'كلاب'),
                getDbItem('02 verbs', 20, 'يطلعوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('04 place', 37, 'الجبل')
            ]
        },
        15: {
            title: "فيران يسرقوا جبنة",
            slots: [
                getDbItem('01 subject', 79, 'فيران'),
                getDbItem('02 verbs', 93, 'يسرقوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 30, 'جبنة')
            ]
        },
        16: {
            title: "نملات يحملوا اكل",
            slots: [
                getDbItem('01 subject', 83, 'نملات'),
                getDbItem('02 verbs', 47, 'يحملوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 162, 'اكل')
            ]
        },
        17: {
            title: "رسامين يرسموا موزة",
            slots: [
                getDbItem('01 subject', 55, 'رسامين'),
                getDbItem('02 verbs', 55, 'يرسموا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 5, 'موزة')
            ]
        },
        18: {
            title: "دودات يتسلقوا الشجرة",
            slots: [
                getDbItem('01 subject', 88, 'دودات'),
                getDbItem('02 verbs', 22, 'يتسلقوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 149, 'الشجرة')
            ]
        },
        19: {
            title: "طلاب يرسموا تفاحة",
            slots: [
                getDbItem('01 subject', 20, 'طلاب'),
                getDbItem('02 verbs', 55, 'يرسموا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 3, 'تفاحة')
            ]
        },
        20: {
            title: "شرطة يسمعوا صوت",
            slots: [
                getDbItem('01 subject', 26, 'شرطة'),
                getDbItem('02 verbs', 9, 'يسمعوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 135, 'صوت')
            ]
        },
        21: {
            title: "اولاد يشوفوا قطة",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 8, 'يشوفوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('01 subject', 71, 'قطة')
            ]
        },
        22: {
            title: "بنات يلمسوا قطة",
            slots: [
                getDbItem('01 subject', 9, 'بنات'),
                getDbItem('02 verbs', 10, 'يلمسوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('01 subject', 71, 'قطة')
            ]
        },
        23: {
            title: "دكاترة يحكوا بابا",
            slots: [
                getDbItem('01 subject', 23, 'دكاترة'),
                getDbItem('02 verbs', 29, 'يحكوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('01 subject', 5, 'بابا')
            ]
        },
        24: {
            title: "اشباح يشوفوا ولد",
            slots: [
                getDbItem('01 subject', 110, 'اشباح'),
                getDbItem('02 verbs', 8, 'يشوفوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('01 subject', 1, 'ولد')
            ]
            }
        },
        3: { // Subgroup 3
        1: {
            title: "ولد و بنت",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('07 pronouns', 2, 'و'),
                getDbItem('01 subject', 2, 'بنت')
            ]
        },
        2: {
            title: "اولاد و بنات",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('07 pronouns', 2, 'و'),
                getDbItem('01 subject', 9, 'بنات')
            ]
        },
        3: {
            title: "بابا و ماما",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('07 pronouns', 2, 'و'),
                getDbItem('01 subject', 6, 'ماما')
            ]
        },
        4: {
            title: "كلب و قطة",
            slots: [
                getDbItem('01 subject', 74, 'كلب'),
                getDbItem('07 pronouns', 2, 'و'),
                getDbItem('01 subject', 71, 'قطة')
            ]
        },
        5: {
            title: "شوكة و سكين",
            slots: [
                getDbItem('03 object', 44, 'شوكة'),
                getDbItem('07 pronouns', 2, 'و'),
                getDbItem('03 object', 61, 'سكين')
            ]
        },
        6: {
            title: "قطة و عصفور",
            slots: [
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('07 pronouns', 2, 'و'),
                getDbItem('03 object', 13, 'عصفور')
            ]
        },
        7: {
            title: "انسة و طالب",
            slots: [
                getDbItem('01 subject', 17, 'انسة'),
                getDbItem('07 pronouns', 2, 'و'),
                getDbItem('01 subject', 18, 'طالب')
            ]
        },
        8: {
            title: "ساحر و ساحرة",
            slots: [
                getDbItem('01 subject', 68, 'ساحر'),
                getDbItem('07 pronouns', 2, 'و'),
                getDbItem('01 subject', 62, 'ساحرة')
            ]
        },
        9: {
            title: "نحلة و نملة",
            slots: [
                getDbItem('03 object', 10, 'نحلة'),
                getDbItem('07 pronouns', 2, 'و'),
                getDbItem('03 object', 2, 'نملة')
            ]
        },
        10: {
            title: "فيل و اسد",
            slots: [
                getDbItem('01 subject', 90, 'فيل'),
                getDbItem('07 pronouns', 2, 'و'),
                getDbItem('01 subject', 96, 'اسد')
            ]
        },
        11: {
            title: "فرشاية و معجون",
            slots: [
                getDbItem('03 object', 21, 'فرشاية'),
                getDbItem('07 pronouns', 2, 'و'),
                getDbItem('01 subject', 128, 'معجون')
            ]
        },
        12: {
            title: "شمس و قمر",
            slots: [
                getDbItem('03 object', 111, 'شمس'),
                getDbItem('07 pronouns', 2, 'و'),
                getDbItem('03 object', 68, 'قمر')
            ]
        },
        13: {
            title: "دكتور و دكتورة",
            slots: [
                getDbItem('01 subject', 21, 'دكتور'),
                getDbItem('07 pronouns', 2, 'و'),
                getDbItem('01 subject', 22, 'دكتورة')
            ]
        },
        14: {
            title: "شبح و ولد",
            slots: [
                getDbItem('01 subject', 109, 'شبح'),
                getDbItem('07 pronouns', 2, 'و'),
                getDbItem('01 subject', 1, 'ولد')
            ]
        },
        15: {
            title: "فارة و قطة",
            slots: [
                getDbItem('01 subject', 77, 'فارة'),
                getDbItem('07 pronouns', 2, 'و'),
                getDbItem('01 subject', 71, 'قطة')
            ]
        },
        16: {
            title: "عصفور و دودة",
            slots: [
                getDbItem('03 object', 13, 'عصفور'),
                getDbItem('07 pronouns', 2, 'و'),
                getDbItem('01 subject', 86, 'دودة')
            ]
        },
        17: {
            title: "سمكة و حورية",
            slots: [
                getDbItem('01 subject', 93, 'سمكة'),
                getDbItem('07 pronouns', 2, 'و'),
                getDbItem('01 subject', 103, 'حورية')
            ]
        },
        18: {
            title: "ديناصور و الجبل",
            slots: [
                getDbItem('01 subject', 84, 'ديناصور'),
                getDbItem('07 pronouns', 2, 'و'),
                getDbItem('04 place', 37, 'الجبل')
            ]
        },
        19: {
            title: "ذئب و بنت",
            slots: [
                getDbItem('01 subject', 114, 'ذئب'),
                getDbItem('07 pronouns', 2, 'و'),
                getDbItem('01 subject', 2, 'بنت')
            ]
        },
        20: {
            title: "رسام و الوان",
            slots: [
                getDbItem('01 subject', 53, 'رسام'),
                getDbItem('07 pronouns', 2, 'و'),
                getDbItem('10 colors', 1, 'الوان')
            ]
        },
        21: {
            title: "الحمام و المطبخ",
            slots: [
                getDbItem('04 place', 7, 'الحمام'),
                getDbItem('07 pronouns', 2, 'و'),
                getDbItem('04 place', 35, 'المطبخ')
            ]
        },
        22: {
            title: "الشارع و الرصيف",
            slots: [
                getDbItem('04 place', 50, 'الشارع'),
                getDbItem('07 pronouns', 2, 'و'),
                getDbItem('04 place', 40, 'الرصيف')
            ]
        },
        23: {
            title: "شرطي و اطفائي",
            slots: [
                getDbItem('01 subject', 24, 'شرطي'),
                getDbItem('07 pronouns', 2, 'و'),
                getDbItem('01 subject', 33, 'اطفائي')
            ]
        },
        24: {
            title: "المستشفى و شرطة",
            slots: [
                getDbItem('04 place', 32, 'المستشفى'),
                getDbItem('07 pronouns', 2, 'و'),
                getDbItem('01 subject', 26, 'شرطة')
                ]
            }
        },
        4: { // Subgroup 4
        1: {
            title: "ولد بدو ياكل",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        2: {
            title: "بنت بدها تشرب",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 2, 'تشرب', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        3: {
            title: "بابا بدو يصلح",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 72, 'يصلح', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        4: {
            title: "ماما بدها تطبخ",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 26, 'تطبخ', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        5: {
            title: "دودات بدهم ياكلوا",
            slots: [
                getDbItem('01 subject', 88, 'دودات'),
                getDbItem('02 verbs', 15, 'بدهم', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('02 verbs', 1, 'ياكلوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        6: {
            title: "رسام بدو يرسم",
            slots: [
                getDbItem('01 subject', 53, 'رسام'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 55, 'يرسم', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        7: {
            title: "ساحرة بدها تطلع",
            slots: [
                getDbItem('01 subject', 62, 'ساحرة'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 20, 'تطلع', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        8: {
            title: "دكتور بدو يسكر",
            slots: [
                getDbItem('01 subject', 21, 'دكتور'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 51, 'يسكر', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        9: {
            title: "ملكة بدها تمشط",
            slots: [
                getDbItem('01 subject', 49, 'ملكة'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 3, 'تمشط', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        10: {
            title: "ارنب بدو ياكل",
            slots: [
                getDbItem('01 subject', 100, 'ارنب'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        11: {
            title: "اولاد بدهم يلبسوا",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 15, 'بدهم', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('02 verbs', 7, 'يلبسوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        12: {
            title: "بنات بدهم يناموا",
            slots: [
                getDbItem('01 subject', 9, 'بنات'),
                getDbItem('02 verbs', 15, 'بدهم', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('02 verbs', 6, 'يناموا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        13: {
            title: "دب بدو ياكل",
            slots: [
                getDbItem('03 object', 8, 'دب'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        14: {
            title: "زرافة بدها تشرب",
            slots: [
                getDbItem('01 subject', 111, 'زرافة'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 2, 'تشرب', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        15: {
            title: "فارة بدها تاكل",
            slots: [
                getDbItem('01 subject', 77, 'فارة'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 1, 'تاكل', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        16: {
            title: "شرطي بدو يمسك",
            slots: [
                getDbItem('01 subject', 24, 'شرطي'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 31, 'يمسك', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        17: {
            title: "قطة بدها تطلع",
            slots: [
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 20, 'تطلع', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        18: {
            title: "كلب بدو ينزل",
            slots: [
                getDbItem('01 subject', 74, 'كلب'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 19, 'ينزل', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        19: {
            title: "طباخ بدو يخبز",
            slots: [
                getDbItem('01 subject', 56, 'طباخ'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 25, 'يخبز', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        20: {
            title: "دكتور بدو يعطي",
            slots: [
                getDbItem('01 subject', 21, 'دكتور'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 48, 'يعطي', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        21: {
            title: "نملة بدها تحمل",
            slots: [
                getDbItem('03 object', 2, 'نملة'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 47, 'تحمل', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        22: {
            title: "شبح بدو ياكل",
            slots: [
                getDbItem('01 subject', 109, 'شبح'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        23: {
            title: "ديناصور بدو يطلع",
            slots: [
                getDbItem('01 subject', 84, 'ديناصور'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 20, 'يطلع', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        24: {
            title: "ولد بدو يشتري",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 46, 'يشتري', { verbTense: 'present', conjugation: 'he' })
                ]
            }
        },
        5: { // Subgroup 5
        1: {
            title: "ولد أكل تفاحة",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 1, 'أكل', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 3, 'تفاحة')
            ]
        },
        2: {
            title: "بنت أكلت تفاحة",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 1, 'أكلت', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('03 object', 3, 'تفاحة')
            ]
        },
        3: {
            title: "ولد شرب عصير",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 2, 'شرب', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 59, 'عصير')
            ]
        },
        4: {
            title: "بنت شربت حليب",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 2, 'شربت', { verbTense: 'past', conjugation: 'I' }),
                getDbItem('03 object', 67, 'حليب')
            ]
        },
        5: {
            title: "بابا غسل سيارة",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 4, 'غسل',{ verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 25, 'سيارة')
            ]
        },
        6: {
            title: "ماما غسلت خيار",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 4, 'غسلت', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('03 object', 141, 'خيار')
            ]
        },
        7: {
            title: "بابا تحمم شامبو",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 5, 'تحمم', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 96, 'شامبو')
            ]
        },
        8: {
            title: "ماما تحممت شامبو",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 5, 'تحممت', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('03 object', 96, 'شامبو')
            ]
        },
        9: {
            title: "قطة نامت تخت",
            slots: [
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('02 verbs', 6, 'نامت', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('03 object', 9, 'تخت')
            ]
        },
        10: {
            title: "كلب نام الارض",
            slots: [
                getDbItem('01 subject', 74, 'كلب'),
                getDbItem('02 verbs', 6, 'نام', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('04 place', 62, 'الارض')
            ]
        },
        11: {
            title: "اولاد لعبوا طابة",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 30, 'لعبوا', { verbTense: 'past', conjugation: 'they' }),
                getDbItem('03 object', 4, 'طابة')
            ]
        },
        12: {
            title: "بنات لعبوا سيارة",
            slots: [
                getDbItem('01 subject', 9, 'بنات'),
                getDbItem('02 verbs', 30, 'لعبوا', { verbTense: 'past', conjugation: 'they' }),
                getDbItem('03 object', 25, 'سيارة')
            ]
        },
        13: {
            title: "فارة طلعت درج",
            slots: [
                getDbItem('01 subject', 77, 'فارة'),
                getDbItem('02 verbs', 20, 'طلعت', { verbTense: 'past', conjugation: 'I' }),
                getDbItem('03 object', 109, 'درج')
            ]
        },
        14: {
            title: "مصلح صلح موبايل",
            slots: [
                getDbItem('01 subject', 67, 'مصلح'),
                getDbItem('02 verbs', 72, 'صلح',{ verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 82, 'موبايل')
            ]
        },
        15: {
            title: "ولد فتح براد",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 50, 'فتح',{ verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 45, 'براد')
            ]
        },
        16: {
            title: "بنت ساعدت تاتا",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 75, 'ساعدت', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('01 subject', 12, 'تاتا')
            ]
        },
        17: {
            title: "بابا قطف تفاح",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 83, 'قطف',{ verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 150, 'تفاح')
            ]
        },
        18: {
            title: "ماما ضبت حقيبة",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 81, 'ضبت', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('03 object', 142, 'حقيبة')
            ]
        },
        19: {
            title: "عمو شاف فيلم",
            slots: [
                getDbItem('01 subject', 15, 'عمو'),
                getDbItem('02 verbs', 8, 'شاف', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 69, 'فيلم')
            ]
        },
        20: {
            title: "ولد كتب قلم",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 57, 'كتب', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 80, 'قلم')
            ]
        },
        21: {
            title: "بنت رسمت قطة",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 55, 'رسمت', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('01 subject', 71, 'قطة')
            ]
        },
        22: {
            title: "تاتا لمست قطة",
            slots: [
                getDbItem('01 subject', 12, 'تاتا'),
                getDbItem('02 verbs', 10, 'لمست', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('01 subject', 71, 'قطة')
            ]
        },
        23: {
            title: "بابا شخر كتير",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 90, 'شخر', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('05 adjectives', 41, 'كتير')
            ]
        },
        24: {
            title: "ولد نفخ بالون",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 33, 'نفخ',{ verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 143, 'بالون')
                ]
            }
            // ... Add items 2 up to 24 here for Subgroup 2
        },
        6: { // Subgroup 6
        1: {
            title: "تفاحة حمرا كبيرة",
            slots: [
                getDbItem('03 object', 3, 'تفاحة'),
                getDbItem('10 colors', 10, 'حمرا'),
                getDbItem('05 adjectives', 5, 'كبيرة')
            ]
        },
        2: {
            title: "موزة صفرا صغيرة",
            slots: [
                getDbItem('03 object', 5, 'موزة'),
                getDbItem('10 colors', 12, 'صفرا'),
                getDbItem('05 adjectives', 6, 'صغيرة')
            ]
        },
        3: {
            title: "طابة خضرا كبيرة",
            slots: [
                getDbItem('03 object', 4, 'طابة'),
                getDbItem('10 colors', 6, 'خضرا'),
                getDbItem('05 adjectives', 5, 'كبيرة')
            ]
        },
        4: {
            title: "طيارة بيضا كبيرة",
            slots: [
                getDbItem('03 object', 84, 'طيارة'),
                getDbItem('10 colors', 11, 'بيضا'),
                getDbItem('05 adjectives', 5, 'كبيرة')
            ]
        },
        5: {
            title: "كلب ابيض سعيد",
            slots: [
                getDbItem('01 subject', 74, 'كلب'),
                getDbItem('10 colors', 11, 'ابيض'),
                getDbItem('05 adjectives', 44, 'سعيد')
            ]
        },
        6: {
            title: "قطة برتقالي حزينة",
            slots: [
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('10 colors', 7, 'برتقالي'),
                getDbItem('05 adjectives', 43, 'حزينة')
            ]
        },
        7: {
            title: "عصفور ازرق معصب",
            slots: [
                getDbItem('03 object', 13, 'عصفور'),
                getDbItem('10 colors', 3, 'ازرق'),
                getDbItem('05 adjectives', 45, 'معصب')
            ]
        },
        8: {
            title: "ولد وسخ حزين",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('05 adjectives', 8, 'وسخ'),
                getDbItem('05 adjectives', 43, 'حزين')
            ]
        },
        9: {
            title: "بنت نظيفة سعيدة",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('05 adjectives', 7, 'نظيفة'),
                getDbItem('05 adjectives', 44, 'سعيدة')
            ]
        },
        10: {
            title: "ماما حلوة قصيرة",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('05 adjectives', 39, 'حلوة'),
                getDbItem('05 adjectives', 31, 'قصيرة')
            ]
        },
        11: {
            title: "بابا حلو طويل",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('05 adjectives', 39, 'حلو'),
                getDbItem('05 adjectives', 32, 'طويل')
            ]
        },
        12: {
            title: "بوط قديم وسخ",
            slots: [
                getDbItem('03 object', 98, 'بوط'),
                getDbItem('05 adjectives', 30, 'قديم'),
                getDbItem('05 adjectives', 8, 'وسخ')
            ]
        },
        13: {
            title: "سمكة طويلة زرقا",
            slots: [
                getDbItem('01 subject', 93, 'سمكة'),
                getDbItem('05 adjectives', 32, 'طويلة'),
                getDbItem('10 colors', 3, 'زرقا')
            ]
        },
        14: {
            title: "دودة رفيعة صفرا",
            slots: [
                getDbItem('01 subject', 86, 'دودة'),
                getDbItem('05 adjectives', 35, 'رفيعة'),
                getDbItem('10 colors', 12, 'صفرا')
            ]
        },
        15: {
            title: "فيل كبير رمادي",
            slots: [
                getDbItem('01 subject', 90, 'فيل'),
                getDbItem('05 adjectives', 5, 'كبير'),
                getDbItem('10 colors', 5, 'رمادي')
            ]
        },
        16: {
            title: "فارة صغيرة سودا",
            slots: [
                getDbItem('01 subject', 77, 'فارة'),
                getDbItem('05 adjectives', 6, 'صغيرة'),
                getDbItem('10 colors', 2, 'سودا')
            ]
        },
        17: {
            title: "وردة زرقا حلوة",
            slots: [
                getDbItem('03 object', 43, 'وردة'),
                getDbItem('10 colors', 3, 'زرقا'),
                getDbItem('05 adjectives', 39, 'حلوة')
            ]
        },
        18: {
            title: "ايس بني بارد",
            slots: [
                getDbItem('03 object', 56, 'ايس كريم') ,
                getDbItem('03 object', 31, 'شوكولا'),
                getDbItem('05 adjectives', 11, 'بارد')
            ]
        },
        19: {
            title: "حليب ابيض ساخن",
            slots: [
                getDbItem('03 object', 67, 'حليب'),
                getDbItem('10 colors', 11, 'ابيض'),
                getDbItem('05 adjectives', 12, 'ساخن')
            ]
        },
        20: {
            title: "بيض مقلي ساخن",
            slots: [
                getDbItem('03 object', 39, 'بيض') ,
                getDbItem('05 adjectives', 55, 'مقلي'),
                getDbItem('05 adjectives', 12, 'ساخن')
            ]
        },
        21: {
            title: "ولد وسخ سعيد",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('05 adjectives', 8, 'وسخ'),
                getDbItem('05 adjectives', 44, 'سعيد')
            ]
        },
        22: {
            title: "بنت وسخة حلوة",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('05 adjectives', 8, 'وسخة'),
                getDbItem('05 adjectives', 39, 'حلوة')
            ]
        },
        23: {
            title: "زرافة طويلة صفرا",
            slots: [
                getDbItem('01 subject', 111, 'زرافة'),
                getDbItem('05 adjectives', 32, 'طويلة'),
                getDbItem('10 colors', 12, 'صفرا')
            ]
        },
        24: {
            title: "دب بني كبير",
            slots: [
                getDbItem('03 object', 8, 'دب'),
                getDbItem('10 colors', 4, 'بني'),
                getDbItem('05 adjectives', 5, 'كبير')
                ]
            }
        },
        7: { // Subgroup 7
        1: {
            title: "ولد مع قطة",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('08 linking', 14, 'مع'),
                getDbItem('01 subject', 71, 'قطة')
            ]
        },
        2: {
            title: "بنت مع كلب",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('08 linking', 14, 'مع'),
                getDbItem('01 subject', 74, 'كلب')
            ]
        },
        3: {
            title: "اولاد مع تفاح",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('08 linking', 14, 'مع'),
                getDbItem('03 object', 150, 'تفاح')
            ]
        },
        4: {
            title: "بنات مع بالون",
            slots: [
                getDbItem('01 subject', 9, 'بنات'),
                getDbItem('08 linking', 14, 'مع'),
                getDbItem('03 object', 143, 'بالون')
            ]
        },
        5: {
            title: "بابا مع مفاتيح",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('08 linking', 14, 'مع'),
                getDbItem('03 object', 60, 'مفاتيح')
            ]
        },
        6: {
            title: "ماما مع عسل",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('08 linking', 14, 'مع'),
                getDbItem('03 object', 54, 'عسل')
            ]
        },
        7: {
            title: "انا مع طاقية",
            slots: [
                getDbItem('07 pronoun', 1, 'انا'),
                getDbItem('08 linking', 14, 'مع'),
                getDbItem('03 object', 53, 'طاقية')
            ]
        },
        8: {
            title: "انت مع كتاب",
            slots: [
                getDbItem('07 pronoun', 7, 'انت') ,
                getDbItem('08 linking', 14, 'مع'),
                getDbItem('03 object', 17, 'كتاب')
            ]
        },
        9: {
            title: "انتِ مع قلم",
            slots: [
                getDbItem('07 pronoun', 8, 'انتِ'),
                getDbItem('08 linking', 14, 'مع'),
                getDbItem('03 object', 80, 'قلم')
            ]
        },
        10: {
            title: "نحن مع تفاحة",
            slots: [
                getDbItem('07 pronoun', 10, 'نحن'),
                getDbItem('08 linking', 14, 'مع'),
                getDbItem('03 object', 3, 'تفاحة')
            ]
        },
        11: {
            title: "هم مع سيارة",
            slots: [
                getDbItem('07 pronoun', 6, 'هم'),
                getDbItem('08 linking', 14, 'مع'),
                getDbItem('03 object', 25, 'سيارة')
            ]
        },
        12: {
            title: "هم مع طيارة",
            slots: [
                getDbItem('07 pronoun', 6, 'هم'),
                getDbItem('08 linking', 14, 'مع'),
                getDbItem('03 object', 84, 'طيارة')
            ]
        },
        13: {
            title: "زرافة مع تفاحة",
            slots: [
                getDbItem('01 subject', 111, 'زرافة'),
                getDbItem('08 linking', 14, 'مع'),
                getDbItem('03 object', 3, 'تفاحة')
            ]
        },
        14: {
            title: "ذئب مع دجاجة",
            slots: [
                getDbItem('01 subject', 114, 'ذئب'),
                getDbItem('08 linking', 14, 'مع'),
                getDbItem('03 object', 154, 'دجاجة')
            ]
        },
        15: {
            title: "فارة مع جبنة",
            slots: [
                getDbItem('01 subject', 77, 'فارة'),
                getDbItem('08 linking', 14, 'مع'),
                getDbItem('03 object', 30, 'جبنة')
            ]
        },
        16: {
            title: "جدو مع كتاب",
            slots: [
                getDbItem('01 subject', 13, 'جدو'),
                getDbItem('08 linking', 14, 'مع'),
                getDbItem('03 object', 17, 'كتاب')
            ]
        },
        17: {
            title: "رسام مع الوان",
            slots: [
                getDbItem('01 subject', 53, 'رسام'),
                getDbItem('08 linking', 14, 'مع'),
                getDbItem('10 colors', 1, 'الوان')
            ]
        },
        18: {
            title: "ولد مع دفتر",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('08 linking', 14, 'مع'),
                getDbItem('03 object', 74, 'دفتر')
            ]
        },
        19: {
            title: "اولاد مع بالون",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('08 linking', 14, 'مع'),
                getDbItem('03 object', 143, 'بالون')
            ]
        },
        20: {
            title: "دودة مع قلم",
            slots: [
                getDbItem('01 subject', 86, 'دودة'),
                getDbItem('08 linking', 14, 'مع'),
                getDbItem('03 object', 80, 'قلم')
            ]
        },
        21: {
            title: "اولاد مع موبايل",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('08 linking', 14, 'مع'),
                getDbItem('03 object', 82, 'موبايل')
            ]
        },
        22: {
            title: "طلاب مع اقلام",
            slots: [
                getDbItem('01 subject', 20, 'طلاب'),
                getDbItem('08 linking', 14, 'مع'),
                getDbItem('03 object', 155, 'اقلام')
            ]
        },
        23: {
            title: "بيبي مع ملعقة",
            slots: [
                getDbItem('01 subject', 7, 'بيبي'),
                getDbItem('08 linking', 14, 'مع'),
                getDbItem('03 object', 107, 'ملعقة')
            ]
        },
        24: {
            title: "بيبي مع وردة",
            slots: [
                getDbItem('01 subject', 7, 'بيبي'),
                getDbItem('08 linking', 14, 'مع'),
                getDbItem('03 object', 43, 'وردة')
                ]
            }
        },
        8: { // Subgroup 8
        1: {
            title: "ولد فوق الشجرة",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('05 adjectives', 38, 'فوق'),
                getDbItem('03 object', 149, 'الشجرة')
            ]
        },
        2: {
            title: "ولد تحت الشجرة",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('09 Prepositions', 10, 'تحت'),
                getDbItem('03 object', 149, 'الشجرة')
            ]
        },
        3: {
            title: "بنت أمام بيت",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('09 Prepositions', 5, 'أمام'),
                getDbItem('03 object', 94, 'بيت')
            ]
        },
        4: {
            title: "بنت جنب سيارة",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('09 Prepositions', 8, 'جنب'),
                getDbItem('03 object', 25, 'سيارة')
            ]
        },
        5: {
            title: "نحلة بين وردات",
            slots: [
                getDbItem('03 object', 10, 'نحلة'),
                getDbItem('09 Prepositions', 2, 'بين'),
                getDbItem('03 object', 134, 'وردات')
            ]
        },
        6: {
            title: "ارنب خلف حجرة",
            slots: [
                getDbItem('01 subject', 100, 'ارنب'),
                getDbItem('09 Prepositions', 1, 'خلف'),
                getDbItem('03 object', 151, 'حجرة')
            ]
        },
        7: {
            title: "فيل جوا صندوق",
            slots: [
                getDbItem('01 subject', 90, 'فيل'),
                getDbItem('05 adjectives', 23, 'جوا'),
                getDbItem('03 object', 18, 'صندوق')
            ]
        },
        8: {
            title: "زرافة برا صندوق",
            slots: [
                getDbItem('01 subject', 111, 'زرافة'),
                getDbItem('05 adjectives', 24, 'برا'),
                getDbItem('03 object', 18, 'صندوق')
            ]
        },
        9: {
            title: "بقرة على طابة",
            slots: [
                getDbItem('01 subject', 97, 'بقرة'),
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 4, 'طابة')
            ]
        },
        10: {
            title: "اسد على طابة",
            slots: [
                getDbItem('01 subject', 96, 'اسد'),
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 4, 'طابة')
            ]
        },
        11: {
            title: "نحلة فوق نملة",
            slots: [
                getDbItem('03 object', 10, 'نحلة'),
                getDbItem('05 adjectives', 38, 'فوق'),
                getDbItem('03 object', 2, 'نملة')
            ]
        },
        12: {
            title: "ارنب تحت فيل",
            slots: [
                getDbItem('01 subject', 100, 'ارنب'),
                getDbItem('09 Prepositions', 10, 'تحت'),
                getDbItem('01 subject', 90, 'فيل')
            ]
        },
        13: {
            title: "ماما جنب براد",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('09 Prepositions', 8, 'جنب'),
                getDbItem('03 object', 45, 'براد')
            ]
        },
        14: {
            title: "بابا جنب سيارة",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('09 Prepositions', 8, 'جنب'),
                getDbItem('03 object', 25, 'سيارة')
            ]
        },
        15: {
            title: "ماما تحت طاولة",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('09 Prepositions', 10, 'تحت'),
                getDbItem('03 object', 114, 'طاولة')
            ]
        },
        16: {
            title: "بابا على كرسي",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 28, 'كرسي')
            ]
        },
        17: {
            title: "فيل جنب فارة",
            slots: [
                getDbItem('01 subject', 90, 'فيل'),
                getDbItem('09 Prepositions', 8, 'جنب'),
                getDbItem('01 subject', 77, 'فارة')
            ]
        },
        18: {
            title: "قطة تحت بطانية",
            slots: [
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('09 Prepositions', 10, 'تحت'),
                getDbItem('03 object', 15, 'بطانية')
            ]
        },
        19: {
            title: "كلب على بطانية",
            slots: [
                getDbItem('01 subject', 74, 'كلب'),
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 15, 'بطانية')
            ]
        },
        20: {
            title: "بيبي في عرباية",
            slots: [
                getDbItem('01 subject', 7, 'بيبي'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('03 object', 110, 'عرباية')
            ]
        },
        21: {
            title: "بيبي في تخت",
            slots: [
                getDbItem('01 subject', 7, 'بيبي'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('03 object', 9, 'تخت')
            ]
        },
        22: {
            title: "بيبي على صوفا",
            slots: [
                getDbItem('01 subject', 7, 'بيبي'),
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 104, 'صوفا')
            ]
        },
        23: {
            title: "اولاد في بيت",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('03 object', 94, 'بيت')
            ]
        },
        24: {
            title: "بنات في سيارة",
            slots: [
                getDbItem('01 subject', 9, 'بنات'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('03 object', 25, 'سيارة')
                ]
            }
        }
    },
    // ==========================================
    // FOLDER 4 (4-Word Sentences)
    // ==========================================
    "4": {
        1: { // Subgroup 1
        1: {
            title: "ولد ياكل تفاحة حمرا",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 3, 'تفاحة'),
                getDbItem('10 colors', 10, 'حمرا')
            ]
        },
        2: {
            title: "بنت تاكل 2 بيتزا",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 1, 'تاكل', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('11 numbers', 2, '2'),
                getDbItem('03 object', 133, 'بيتزا')
            ]
        },
        3: {
            title: "بابا يسوق سيارة زرقا",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 61, 'يسوق', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 25, 'سيارة'),
                getDbItem('10 colors', 3, 'زرقا')
            ]
        },
        4: {
            title: "ماما تطبخ معكرونة صفرا",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 26, 'تطبخ', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 106, 'معكرونة'),
                getDbItem('10 colors', 12, 'صفرا')
            ]
        },
        5: {
            title: "عمو يسوق باص اصفر",
            slots: [
                getDbItem('01 subject', 15, 'عمو'),
                getDbItem('02 verbs', 61, 'يسوق', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 23, 'باص'),
                getDbItem('10 colors', 12, 'اصفر')
            ]
        },
        6: {
            title: "خالتو تلبس جاكيت حمرا",
            slots: [
                getDbItem('01 subject', 14, 'خالتو'),
                getDbItem('02 verbs', 7, 'تلبس', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 58, 'جاكيت'),
                getDbItem('10 colors', 10, 'حمرا')
            ]
        },
        7: {
            title: "ولدين يلعبوا طابة صغيرة",
            slots: [
                getDbItem('01 subject', 3, 'ولدين'),
                getDbItem('02 verbs', 30, 'يلعبوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 4, 'طابة'),
                getDbItem('05 adjectives', 6, 'صغيرة')
            ]
        },
        8: {
            title: "بنتين ياكلوا فواكه نظيفة",
            slots: [
                getDbItem('01 subject', 11, 'بنتين'),
                getDbItem('02 verbs', 1, 'ياكلوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 47, 'فواكه'),
                getDbItem('05 adjectives', 7, 'نظيفة')
            ]
        },
        9: {
            title: "اولاد يرسموا سمكة كبيرة",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 55, 'يرسموا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('01 subject', 93, 'سمكة'),
                getDbItem('05 adjectives', 5, 'كبيرة')
            ]
        },
        10: {
            title: "بنات يشموا وردات حلوة",
            slots: [
                getDbItem('01 subject', 9, 'بنات'),
                getDbItem('02 verbs', 11, 'يشموا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 134, 'وردات'),
                getDbItem('05 adjectives', 39, 'حلوة')
            ]
        },
        11: {
            title: "فيل يشرب مي نظيفة",
            slots: [
                getDbItem('01 subject', 90, 'فيل'),
                getDbItem('02 verbs', 2, 'يشرب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 129, 'مي'),
                getDbItem('05 adjectives', 7, 'نظيفة')
            ]
        },
        12: {
            title: "دكتور يعطي ابرة صغيرة",
            slots: [
                getDbItem('01 subject', 21, 'دكتور'),
                getDbItem('02 verbs', 48, 'يعطي', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 72, 'ابرة'),
                getDbItem('05 adjectives', 6, 'صغيرة')
            ]
        },
        13: {
            title: "قطة تسمع صوت حلو",
            slots: [
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('02 verbs', 9, 'تسمع', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 135, 'صوت'),
                getDbItem('05 adjectives', 39, 'حلو')
            ]
        },
        14: {
            title: "كلب يشوف شاحنة زرقا",
            slots: [
                getDbItem('01 subject', 74, 'كلب'),
                getDbItem('02 verbs', 8, 'يشوف', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 125, 'شاحنة'),
                getDbItem('10 colors', 3, 'زرقا')
            ]
        },
        15: {
            title: "عمو يبني بناية طويلة",
            slots: [
                getDbItem('01 subject', 15, 'عمو'),
                getDbItem('02 verbs', 84, 'يبني', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 136, 'بناية'),
                getDbItem('05 adjectives', 32, 'طويلة')
            ]
        },
        16: {
            title: "شرطي يمسك قطة سودا",
            slots: [
                getDbItem('01 subject', 24, 'شرطي'),
                getDbItem('02 verbs', 31, 'يمسك', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('10 colors', 2, 'سودا')
            ]
        },
        17: {
            title: "شرطي يمسك حرامي الملابس",
            slots: [
                getDbItem('01 subject', 24, 'شرطي'),
                getDbItem('02 verbs', 31, 'يمسك', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('01 subject', 59, 'حرامي'),
                getDbItem('03 object', 147, 'الملابس')
            ]
        },
        18: {
            title: "عصفور ياكل دودة صفرا",
            slots: [
                getDbItem('03 object', 13, 'عصفور'),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('01 subject', 86, 'دودة'),
                getDbItem('10 colors', 12, 'صفرا')
            ]
        },
        19: {
            title: "استاذ يعلم طالب شاطر",
            slots: [
                getDbItem('01 subject', 16, 'استاذ'),
                getDbItem('02 verbs', 60, 'يعلم', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('01 subject', 18, 'طالب'),
                getDbItem('05 adjectives', 53, 'شاطر')
            ]
        },
        20: {
            title: "مصلح يصلح غسالة خربانة",
            slots: [
                getDbItem('01 subject', 67, 'مصلح'),
                getDbItem('02 verbs', 72, 'يصلح', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 137, 'غسالة'),
                getDbItem('05 adjectives', 49, 'خربانة')
            ]
        },
        21: {
            title: "ملك يشوف ملكة حلوة",
            slots: [
                getDbItem('01 subject', 48, 'ملك'),
                getDbItem('02 verbs', 8, 'يشوف', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('01 subject', 49, 'ملكة'),
                getDbItem('05 adjectives', 39, 'حلوة')
            ]
        },
        22: {
            title: "تاتا تقرا كتاب حلو",
            slots: [
                getDbItem('01 subject', 12, 'تاتا'),
                getDbItem('02 verbs', 58, 'تقرا', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 17, 'كتاب'),
                getDbItem('05 adjectives', 39, 'حلو')
            ]
        },
        23: {
            title: "جدو ينزل درج بطيء",
            slots: [
                getDbItem('01 subject', 13, 'جدو'),
                getDbItem('02 verbs', 19, 'ينزل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 109, 'درج'),
                getDbItem('05 adjectives', 47, 'بطيء')
            ]
        },
        24: {
            title: "ديناصور يلبس طاقية حمرا",
            slots: [
                getDbItem('01 subject', 84, 'ديناصور'),
                getDbItem('02 verbs', 7, 'يلبس', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 53, 'طاقية'),
                getDbItem('10 colors', 10, 'حمرا')
            ]
        }
        },
        2: { // Subgroup 2
        1: {
            title: "ولدين ياكلوا و يشربوا",
            slots: [
                getDbItem('01 subject', 3, 'ولدين'),
                getDbItem('02 verbs', 1, 'ياكلوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 2, 'يشربوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        2: {
            title: "ولدين يمشطوا و يغسلوا",
            slots: [
                getDbItem('01 subject', 3, 'ولدين'),
                getDbItem('02 verbs', 3, 'يمشطوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 4, 'يغسلوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        3: {
            title: "بنتين يشربوا و ياكلوا",
            slots: [
                getDbItem('01 subject', 11, 'بنتين'),
                getDbItem('02 verbs', 2, 'يشربوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 1, 'ياكلوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        4: {
            title: "بنتين يسمعوا و يرقصوا",
            slots: [
                getDbItem('01 subject', 11, 'بنتين'),
                getDbItem('02 verbs', 9, 'يسمعوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 65, 'يرقصوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        5: {
            title: "اولاد يقصوا و يكتبوا",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 59, 'يقصوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 57, 'يكتبوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        6: {
            title: "اولاد يمشوا و يركضوا",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 16, 'يمشوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 17, 'يركضوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        7: {
            title: "أهل يطبخوا و يكنسوا",
            slots: [
                getDbItem('01 subject', 116, 'أهل'),
                getDbItem('02 verbs', 26, 'يطبخوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 44, 'يكنسوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        8: {
            title: "أهل يصلحوا و يكنسوا",
            slots: [
                getDbItem('01 subject', 116, 'أهل'),
                getDbItem('02 verbs', 72, 'يصلحوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 44, 'يكنسوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        9: {
            title: "أهل يخلطوا و يحملوا",
            slots: [
                getDbItem('01 subject', 116, 'أهل'),
                getDbItem('02 verbs', 23, 'يخلطوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 47, 'يحملوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        10: {
            title: "طلاب يسمعوا و يكتبوا",
            slots: [
                getDbItem('01 subject', 20, 'طلاب'),
                getDbItem('02 verbs', 9, 'يسمعوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 57, 'يكتبوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        11: {
            title: "عصافير تطير و تغني",
            slots: [
                getDbItem('01 subject', 92, 'عصافير'),
                getDbItem('02 verbs', 100, 'تطير', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 37, 'تغني', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        12: {
            title: "نملات تمشي و تحمل",
            slots: [
                getDbItem('01 subject', 83, 'نملات'),
                getDbItem('02 verbs', 16, 'تمشي', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 47, 'تحمل', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        13: {
            title: "زرافة قعدت و تبكي",
            slots: [
                getDbItem('01 subject', 111, 'زرافة'),
                getDbItem('02 verbs', 14, 'قعدت', { verbTense: 'past', conjugation: 'I' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 34, 'تبكي', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        14: {
            title: "ذئب يعيط و يبكي",
            slots: [
                getDbItem('01 subject', 114, 'ذئب'),
                getDbItem('02 verbs', 35, 'يعيط', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 34, 'يبكي', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        15: {
            title: "فارة وقفت و تضحك",
            slots: [
                getDbItem('01 subject', 77, 'فارة'),
                getDbItem('02 verbs', 13, 'وقفت', { verbTense: 'past', conjugation: 'I' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 39, 'تضحك', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        16: {
            title: "جدو يضحك و يقرا",
            slots: [
                getDbItem('01 subject', 13, 'جدو'),
                getDbItem('02 verbs', 39, 'يضحك', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 58, 'يقرا', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        17: {
            title: "رسام يرسم و يسمع",
            slots: [
                getDbItem('01 subject', 53, 'رسام'),
                getDbItem('02 verbs', 55, 'يرسم', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 9, 'يسمع', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        18: {
            title: "دودة ترقص و تغني",
            slots: [
                getDbItem('01 subject', 86, 'دودة'),
                getDbItem('02 verbs', 65, 'ترقص', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 37, 'تغني', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        19: {
            title: "طالب وقف و يحكي",
            slots: [
                getDbItem('01 subject', 18, 'طالب'),
                getDbItem('02 verbs', 13, 'وقف', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 29, 'يحكي', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        20: {
            title: "شرطي يركض و يصفر",
            slots: [
                getDbItem('01 subject', 24, 'شرطي'),
                getDbItem('02 verbs', 17, 'يركض', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 38, 'يصفر', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        21: {
            title: "ولد يشوف و يسمع",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 8, 'يشوف', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 9, 'يسمع', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        22: {
            title: "بنت تسمع و تشوف",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 9, 'تسمع', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 8, 'تشوف', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        23: {
            title: "بيبي يزحف و يضحك",
            slots: [
                getDbItem('01 subject', 7, 'بيبي'),
                getDbItem('02 verbs', 18, 'يزحف', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 39, 'يضحك', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        24: {
            title: "بيبي يعيط و يبكي",
            slots: [
                getDbItem('01 subject', 7, 'بيبي'),
                getDbItem('02 verbs', 35, 'يعيط', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 34, 'يبكي', { verbTense: 'present', conjugation: 'he' })
                ]
            }
        },
        3: { // Subgroup 3
        1: {
            title: "ولد و بنت يلعبوا",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 30, 'يلعبوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        2: {
            title: "بنت و ولد ياكلوا",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 1, 'ياكلوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        3: {
            title: "بابا و ماما يحكوا",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 29, 'يحكوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        4: {
            title: "كلب و قطة ينطوا",
            slots: [
                getDbItem('01 subject', 74, 'كلب'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('02 verbs', 21, 'ينطوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        5: {
            title: "قطة و عصفور يغنوا",
            slots: [
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('03 object', 13, 'عصفور'),
                getDbItem('02 verbs', 37, 'يغنوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        6: {
            title: "شرطي و شرطية يمشوا",
            slots: [
                getDbItem('01 subject', 24, 'شرطي'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 25, 'شرطية'),
                getDbItem('02 verbs', 16, 'يمشوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        7: {
            title: "استاذ و طالب يحكوا",
            slots: [
                getDbItem('01 subject', 16, 'استاذ'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 18, 'طالب'),
                getDbItem('02 verbs', 29, 'يحكوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        8: {
            title: "ساحر و ساحرة يطيروا",
            slots: [
                getDbItem('01 subject', 68, 'ساحر'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 62, 'ساحرة'),
                getDbItem('02 verbs', 100, 'يطيروا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        9: {
            title: "نحلة و نملة يوقفوا",
            slots: [
                getDbItem('03 object', 10, 'نحلة'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('03 object', 2, 'نملة'),
                getDbItem('02 verbs', 13, 'يوقفوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        10: {
            title: "فيل و اسد يركضوا",
            slots: [
                getDbItem('01 subject', 90, 'فيل'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 96, 'اسد'),
                getDbItem('02 verbs', 17, 'يركضوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        11: {
            title: "اولاد و بنات يشربوا",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 9, 'بنات'),
                getDbItem('02 verbs', 2, 'يشربوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        12: {
            title: "بنات و اولاد يناموا",
            slots: [
                getDbItem('01 subject', 9, 'بنات'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 6, 'يناموا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        13: {
            title: "دب و نحلة يضحكوا",
            slots: [
                getDbItem('03 object', 8, 'دب'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('03 object', 10, 'نحلة'),
                getDbItem('02 verbs', 39, 'يضحكوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        14: {
            title: "اسد و زرافة يمشوا",
            slots: [
                getDbItem('01 subject', 96, 'اسد'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 111, 'زرافة'),
                getDbItem('02 verbs', 16, 'يمشوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        15: {
            title: "فارة و قطة يركضوا",
            slots: [
                getDbItem('01 subject', 77, 'فارة'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('02 verbs', 17, 'يركضوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        16: {
            title: "سيارة و باص يمشوا",
            slots: [
                getDbItem('03 object', 25, 'سيارة'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('03 object', 23, 'باص'),
                getDbItem('02 verbs', 16, 'يمشوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        17: {
            title: "طيارة و عصفور يطيروا",
            slots: [
                getDbItem('03 object', 84, 'طيارة'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('03 object', 13, 'عصفور'),
                getDbItem('02 verbs', 100, 'يطيروا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        18: {
            title: "قارب و سفينة يفوشوا",
            slots: [
                getDbItem('03 object', 148, 'قارب'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('03 object', 16, 'سفينة'),
                getDbItem('02 verbs', 73, 'يفوشوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        19: {
            title: "طباخ و ولد يطبخوا",
            slots: [
                getDbItem('01 subject', 56, 'طباخ'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 26, 'يطبخوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        20: {
            title: "دكتور و دكتورة يحكوا",
            slots: [
                getDbItem('01 subject', 21, 'دكتور'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 22, 'دكتورة'),
                getDbItem('02 verbs', 29, 'يحكوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        21: {
            title: "نملة و نحلة يكتبوا",
            slots: [
                getDbItem('03 object', 2, 'نملة'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('03 object', 10, 'نحلة'),
                getDbItem('02 verbs', 57, 'يكتبوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        22: {
            title: "شبح و مومياء يدرسوا",
            slots: [
                getDbItem('01 subject', 109, 'شبح'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 105, 'مومياء'),
                getDbItem('02 verbs', 77, 'يدرسوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        23: {
            title: "ديناصور و فيل يطلعوا",
            slots: [
                getDbItem('01 subject', 84, 'ديناصور'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 90, 'فيل'),
                getDbItem('02 verbs', 20, 'يطلعوا', { verbTense: 'present', conjugation: 'they' })
            ]
        },
        24: {
            title: "ماما و ولد يشتروا",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 46, 'يشتروا', { verbTense: 'present', conjugation: 'they' })
                ]
            }
        },
        4: { // Subgroup 4
        1: {
            title: "ولد بدو ياكل تفاحة",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 3, 'تفاحة')
            ]
        },
        2: {
            title: "بنت بدها تشرب عصير",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 2, 'تشرب', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 59, 'عصير')
            ]
        },
        3: {
            title: "بابا بدو يصلح سيارة",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 72, 'يصلح', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 25, 'سيارة')
            ]
        },
        4: {
            title: "ماما بدها تطبخ رز",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 26, 'تطبخ', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 89, 'رز')
            ]
        },
        5: {
            title: "دودات بدهم ياكلوا تفاحة",
            slots: [
                getDbItem('01 subject', 88, 'دودات'),
                getDbItem('02 verbs', 15, 'بدهم', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('02 verbs', 1, 'ياكلوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 3, 'تفاحة')
            ]
        },
        6: {
            title: "رسام بدو يرسم وردة",
            slots: [
                getDbItem('01 subject', 53, 'رسام'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 55, 'يرسم', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 43, 'وردة')
            ]
        },
        7: {
            title: "ساحرة بدها تطلع البرج",
            slots: [
                getDbItem('01 subject', 62, 'ساحرة'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 20, 'تطلع', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('04 place', 53, 'البرج')
            ]
        },
        8: {
            title: "دكتور بدو يسكر باب",
            slots: [
                getDbItem('01 subject', 21, 'دكتور'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 51, 'يسكر', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 36, 'باب')
            ]
        },
        9: {
            title: "ملكة بدها تمشط شعر",
            slots: [
                getDbItem('01 subject', 49, 'ملكة'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 3, 'تمشط', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 49, 'شعر')
            ]
        },
        10: {
            title: "ارنب بدو ياكل جزرة",
            slots: [
                getDbItem('01 subject', 100, 'ارنب'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 27, 'جزرة')
            ]
        },
        11: {
            title: "اولاد بدهم يلبسوا جاكيت",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 15, 'بدهم', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('02 verbs', 7, 'يلبسوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 58, 'جاكيت')
            ]
        },
        12: {
            title: "بنات بدهم يناموا تخت",
            slots: [
                getDbItem('01 subject', 9, 'بنات'),
                getDbItem('02 verbs', 15, 'بدهم', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('02 verbs', 6, 'يناموا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 9, 'تخت')
            ]
        },
        13: {
            title: "دب بدو ياكل عسل",
            slots: [
                getDbItem('03 object', 8, 'دب'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 54, 'عسل')
            ]
        },
        14: {
            title: "زرافة بدها تشرب عصير",
            slots: [
                getDbItem('01 subject', 111, 'زرافة'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 2, 'تشرب', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 59, 'عصير')
            ]
        },
        15: {
            title: "فارة بدها تاكل جبنة",
            slots: [
                getDbItem('01 subject', 77, 'فارة'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 1, 'تاكل', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 30, 'جبنة')
            ]
        },
        16: {
            title: "شرطي بدو يمسك حرامي",
            slots: [
                getDbItem('01 subject', 24, 'شرطي'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 31, 'يمسك', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('01 subject', 59, 'حرامي')
            ]
        },
        17: {
            title: "قطة بدها تطلع الشجرة",
            slots: [
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 20, 'تطلع', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 149, 'الشجرة')
            ]
        },
        18: {
            title: "كلب بدو ينزل الشجرة",
            slots: [
                getDbItem('01 subject', 74, 'كلب'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 19, 'ينزل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 149, 'الشجرة')
            ]
        },
        19: {
            title: "طباخ بدو يخبز كاتو",
            slots: [
                getDbItem('01 subject', 56, 'طباخ'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 25, 'يخبز', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 14, 'كاتو')
            ]
        },
        20: {
            title: "دكتور بدو يعطي ابرة",
            slots: [
                getDbItem('01 subject', 21, 'دكتور'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 48, 'يعطي', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 72, 'ابرة')
            ]
        },
        21: {
            title: "نملة بدها تحمل بسكوتة",
            slots: [
                getDbItem('03 object', 2, 'نملة'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 47, 'تحمل', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 140, 'بسكوتة')
            ]
        },
        22: {
            title: "شبح بدو ياكل كاتو",
            slots: [
                getDbItem('01 subject', 109, 'شبح'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 14, 'كاتو')
            ]
        },
        23: {
            title: "ديناصور بدو يطلع الجبل",
            slots: [
                getDbItem('01 subject', 84, 'ديناصور'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 20, 'يطلع', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('04 place', 37, 'الجبل')
            ]
        },
        24: {
            title: "ولد بدو يشتري قلم",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 46, 'يشتري', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 80, 'قلم')
                ]
            }
        },
        5: { // Subgroup 5
        1: {
            title: "ولد أكل تفاحة مبارح",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 1, 'أكل',{ verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 3, 'تفاحة'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        2: {
            title: "بنت أكلت تفاحة مبارح",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 1, 'أكلت', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('03 object', 3, 'تفاحة'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        3: {
            title: "ولد شرب عصير مبارح",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 2, 'شرب',{ verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 59, 'عصير'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        4: {
            title: "بنت شربت حليب مبارح",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 2, 'شربت', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('03 object', 67, 'حليب'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        5: {
            title: "بابا غسل سيارة مبارح",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 4, 'غسل',{ verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 25, 'سيارة'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        6: {
            title: "ماما غسلت خيار مبارح",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 4, 'غسلت', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('03 object', 141, 'خيار'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        7: {
            title: "بابا تحمم شامبو مبارح",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 5, 'تحمم', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 96, 'شامبو'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        8: {
            title: "ماما تحممت شامبو مبارح",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 5, 'تحممت', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('03 object', 96, 'شامبو'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        9: {
            title: "قطة نامت تخت مبارح",
            slots: [
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('02 verbs', 6, 'نامت', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('03 object', 9, 'تخت'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        10: {
            title: "كلب نام الارض مبارح",
            slots: [
                getDbItem('01 subject', 74, 'كلب'),
                getDbItem('02 verbs', 6, 'نام', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('04 place', 62, 'الارض'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        11: {
            title: "اولاد لعبوا طابة مبارح",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 30, 'لعبوا', { verbTense: 'past', conjugation: 'they' }),
                getDbItem('03 object', 4, 'طابة'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        12: {
            title: "بنات لعبوا سيارة مبارح",
            slots: [
                getDbItem('01 subject', 9, 'بنات'),
                getDbItem('02 verbs', 30, 'لعبوا', { verbTense: 'past', conjugation: 'they' }),
                getDbItem('03 object', 25, 'سيارة'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        13: {
            title: "فارة طلعت درج مبارح",
            slots: [
                getDbItem('01 subject', 77, 'فارة'),
                getDbItem('02 verbs', 20, 'طلعت', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('03 object', 109, 'درج'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        14: {
            title: "مصلح صلح موبايل مبارح",
            slots: [
                getDbItem('01 subject', 67, 'مصلح'),
                getDbItem('02 verbs', 72, 'صلح', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 82, 'موبايل'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        15: {
            title: "ولد فتح براد مبارح",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 50, 'فتح', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 45, 'براد'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        16: {
            title: "بنت ساعدت تاتا مبارح",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 75, 'ساعدت', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('01 subject', 12, 'تاتا'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        17: {
            title: "بابا قطف تفاح مبارح",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 83, 'قطف', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 150, 'تفاح'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        18: {
            title: "ماما ضبت حقيبة مبارح",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 81, 'ضبت', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('03 object', 142, 'حقيبة'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        19: {
            title: "عمو شاف فيلم مبارح",
            slots: [
                getDbItem('01 subject', 15, 'عمو'),
                getDbItem('02 verbs', 8, 'شاف', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 69, 'فيلم'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        20: {
            title: "ولد كتب قلم مبارح",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 57, 'كتب', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 80, 'قلم'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        21: {
            title: "بنت رسمت قطة مبارح",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 55, 'رسمت', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        22: {
            title: "تاتا لمست قطة مبارح",
            slots: [
                getDbItem('01 subject', 12, 'تاتا'),
                getDbItem('02 verbs', 10, 'لمست', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        23: {
            title: "بابا شخر كتير مبارح",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 90, 'شخر', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('05 adjectives', 41, 'كتير'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        24: {
            title: "ولد نفخ بالون مبارح",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 33, 'نفخ', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 143, 'بالون'),
                getDbItem('06 time', 30, 'مبارح')
                ]
            }
        },
        6: { // Subgroup 6
        1: {
            title: "ولد ياكل تفاحة الصبح",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 3, 'تفاحة'),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        2: {
            title: "ولد يشرب مي بليل",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 2, 'يشرب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 129, 'مي'),
                getDbItem('06 time', 17, 'بليل')
            ]
        },
        3: {
            title: "بنت تاكل بطيخ الصبح",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 1, 'تاكل', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 144, 'بطيخ'),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        4: {
            title: "بنت تشرب حليب بليل",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 2, 'تشرب', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 67, 'حليب'),
                getDbItem('06 time', 17, 'بليل')
            ]
        },
        5: {
            title: "بابا يغسل ايدين الان",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 4, 'يغسل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 145, 'ايدين'),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        6: {
            title: "ماما تغسل فواكه الان",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 4, 'تغسل', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 47, 'فواكه'),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        7: {
            title: "بابا يمشط شعر الان",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 3, 'يمشط', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 49, 'شعر'),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        8: {
            title: "ماما تمشط شعر الان",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 3, 'تمشط', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 49, 'شعر'),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        9: {
            title: "ولد يتحمم  الساعة 9",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 5, 'يتحمم', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 32, 'ساعة'),
                getDbItem('12 numbers', 9, '9')
            ]
        },
        10: {
            title: "بنت تتحمم  الساعة 6",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 5, 'تتحمم', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 32, 'ساعة'),
                getDbItem('12 numbers', 6, '6')
            ]
        },
        11: {
            title: "ولد يلعب طابة الصبح",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 30, 'يلعب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 4, 'طابة'),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        12: {
            title: "بنت تلعب طابة الغروب",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 30, 'تلعب', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 4, 'طابة'),
                getDbItem('06 time', 8, 'الغروب')
            ]
        },
        13: {
            title: "ولد ينام تخت مسا",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 6, 'ينام', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 9, 'تخت'),
                getDbItem('05 adjectives', 14, 'مسا')
            ]
        },
        14: {
            title: "بنت تنام تخت مسا",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 6, 'تنام', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 9, 'تخت'),
                getDbItem('05 adjectives', 14, 'مسا')
            ]
        },
        15: {
            title: "بابا يطبخ اكل الضهر",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 26, 'يطبخ', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 162, 'اكل') ,
                getDbItem('06 time', 1, 'الضهر')
            ]
        },
        16: {
            title: "ماما تطبخ اكل مسا",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 26, 'تطبخ', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 162, 'اكل') ,
                getDbItem('05 adjectives', 14, 'مسا')
            ]
        },
        17: {
            title: "ولد يسوق سيارة الشتاء",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 61, 'يسوق', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 25, 'سيارة'),
                getDbItem('06 time', 29, 'الشتاء')
            ]
        },
        18: {
            title: "بنت تسوق بسكليت الربيع",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 61, 'تسوق', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 11, 'بسكليت'),
                getDbItem('06 time', 21, 'الربيع')
            ]
        },
        19: {
            title: "عمو يشوف تلفزيون مسا",
            slots: [
                getDbItem('01 subject', 15, 'عمو'),
                getDbItem('02 verbs', 8, 'يشوف', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 126, 'تلفزيون'),
                getDbItem('05 adjectives', 14, 'مسا')
            ]
        },
        20: {
            title: "ولد يكتب ساعة 10",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 57, 'يكتب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 32, 'ساعة'),
                getDbItem('12 numbers', 10, '10')
            ]
        },
        21: {
            title: "بنت ترسم قطة الان",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 55, 'ترسم', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        22: {
            title: "تاتا تلمس قطة مسا",
            slots: [
                getDbItem('01 subject', 12, 'تاتا'),
                getDbItem('02 verbs', 10, 'تلمس', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('05 adjectives', 14, 'مسا')
            ]
        },
        23: {
            title: "بيبي ينام عرباية الصبح",
            slots: [
                getDbItem('01 subject', 7, 'بيبي'),
                getDbItem('02 verbs', 6, 'ينام', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 110, 'عرباية'),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        24: {
            title: "ولد ينفخ بالون الان",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 33, 'ينفخ', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 143, 'بالون'),
                getDbItem('06 time', 19, 'الان')
                ]
            }
        },
        7: { // Subgroup 7
        1: {
            title: "ولد ياكل في المطبخ",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 35, 'المطبخ')
            ]
        },
        2: {
            title: "بنت تاكل في الصالون",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 1, 'تاكل', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 60, 'الصالون')
            ]
        },
        3: {
            title: "اولاد ياكلوا في الحديقة",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 1, 'ياكلوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 4, 'الحديقة')
            ]
        },
        4: {
            title: "بنات ياكلوا في المدرسة",
            slots: [
                getDbItem('01 subject', 9, 'بنات'),
                getDbItem('02 verbs', 1, 'ياكلوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 47, 'المدرسة')
            ]
        },
        5: {
            title: "بابا يلعب في الملعب",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 30, 'يلعب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 52, 'الملعب')
            ]
        },
        6: {
            title: "ماما تشتري من الماركت",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 46, 'تشتري', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 7, 'من'),
                getDbItem('04 place', 29, 'الماركت')
            ]
        },
        7: {
            title: "بابا ينام غرفة نوم",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 6, 'ينام', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 9, 'غرفة نوم'),
            ]
        },
        8: {
            title: "ماما تكنس في الصالون",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 44, 'تكنس', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 60, 'الصالون')
            ]
        },
        9: {
            title: "ولد يمشي في الشارع",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 16, 'يمشي', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 50, 'الشارع')
            ]
        },
        10: {
            title: "بيبي تزحف في الحديقة",
            slots: [
                getDbItem('01 subject', 7, 'بيبي'),
                getDbItem('02 verbs', 18, 'تزحف', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 4, 'الحديقة')
            ]
        },
        11: {
            title: "بابا يقعد في العيادة",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 14, 'يقعد', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 22, 'العيادة')
            ]
        },
        12: {
            title: "ماما توقف امام الشجرة",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 13, 'توقف', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('09 Prepositions', 5, 'امام'),
                getDbItem('03 object', 149, 'الشجرة')
            ]
        },
        13: {
            title: "زرافة تنام تحت الشجرة",
            slots: [
                getDbItem('01 subject', 111, 'زرافة'),
                getDbItem('02 verbs', 6, 'تنام', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('09 Prepositions', 10, 'تحت'),
                getDbItem('03 object', 149, 'الشجرة')
            ]
        },
        14: {
            title: "ذئب يعيط جنب الكهف",
            slots: [
                getDbItem('01 subject', 114, 'ذئب'),
                getDbItem('02 verbs', 35, 'يعيط', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('09 Prepositions', 8, 'جنب'),
                getDbItem('04 place', 15, 'الكهف')
            ]
        },
        15: {
            title: "فارة تسرق من الماركت",
            slots: [
                getDbItem('01 subject', 77, 'فارة'),
                getDbItem('02 verbs', 93, 'تسرق', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 7, 'من'),
                getDbItem('04 place', 29, 'الماركت')
            ]
        },
        16: {
            title: "جدو يقعد محطة باصات",
            slots: [
                getDbItem('01 subject', 13, 'جدو'),
                getDbItem('02 verbs', 14, 'يقعد', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 12, 'محطة باصات')
            ]
        },
        17: {
            title: "رسام يرسم في مدينه العاب",
            slots: [
                getDbItem('01 subject', 53, 'رسام'),
                getDbItem('02 verbs', 55, 'يرسم', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),                   
                getDbItem('04 place', 2, 'مدينة الالعاب')
            ]
        },
        18: {
            title: "دودة تقعد على تفاحة",
            slots: [
                getDbItem('01 subject', 86, 'دودة'),
                getDbItem('02 verbs', 14, 'تقعد', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 3, 'تفاحة')
            ]
        },
        19: {
            title: "ولد يكتب في الصف",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 57, 'يكتب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 18, 'الصف')
            ]
        },
        20: {
            title: "ولد يبكي في الحديقة",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 34, 'يبكي', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 4, 'الحديقة')
            ]
        },
        21: {
            title: "ولد يضحك في مدينه العاب",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 39, 'يضحك', { verbTense: 'present', conjugation: 'he' }),
                 getDbItem('08 linking', 11, 'في'),                   
                getDbItem('04 place', 2, 'مدينة الالعاب')
            ]
        },
        22: {
            title: "طالب يسأل في الصف",
            slots: [
                getDbItem('01 subject', 18, 'طالب'),
                getDbItem('02 verbs', 42, 'يسأل', { verbTense: 'present', conjugation: 'he' }) ,
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 18, 'الصف')
            ]
        },
        23: {
            title: "بيبي يشرب في عرباية",
            slots: [
                getDbItem('01 subject', 7, 'بيبي'),
                getDbItem('02 verbs', 2, 'يشرب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('03 object', 110, 'عرباية')
            ]
        },
        24: {
            title: "بيبي يبكي في عرباية",
            slots: [
                getDbItem('01 subject', 7, 'بيبي'),
                getDbItem('02 verbs', 34, 'يبكي', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('03 object', 110, 'عرباية')
                ]
            }
        },
        8: { // Subgroup 8
        1: {
            title: "ولد فوق شجرة كبيرة",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('05 adjectives', 38, 'فوق'),
                getDbItem('03 object', 124, 'شجرة'),
                getDbItem('05 adjectives', 5, 'كبيرة')
            ]
        },
        2: {
            title: "ولد تحت شجرة كبيرة",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('09 Prepositions', 10, 'تحت'),
                getDbItem('03 object', 124, 'شجرة'),
                getDbItem('05 adjectives', 5, 'كبيرة')
            ]
        },
        3: {
            title: "بنت امام بيت اصفر",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('09 Prepositions', 5, 'أمام'),
                getDbItem('03 object', 94, 'بيت'),
                getDbItem('10 colors', 12, 'اصفر')
            ]
        },
        4: {
            title: "بنت جنب سيارة حمرا",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('09 Prepositions', 8, 'جنب'),
                getDbItem('03 object', 25, 'سيارة'),
                getDbItem('10 colors', 10, 'حمرا')
            ]
        },
        5: {
            title: "نحلة بين وردات حمرا",
            slots: [
                getDbItem('03 object', 10, 'نحلة'),
                getDbItem('09 Prepositions', 2, 'بين'),
                getDbItem('03 object', 134, 'وردات'),
                getDbItem('10 colors', 10, 'حمرا')
            ]
        },
        6: {
            title: "ارنب خلف حجرة كبيرة",
            slots: [
                getDbItem('01 subject', 100, 'ارنب'),
                getDbItem('09 Prepositions', 1, 'خلف'),
                getDbItem('03 object', 151, 'حجرة'),
                getDbItem('05 adjectives', 5, 'كبيرة')
            ]
        },
        7: {
            title: "فيل جوا صندوق اخضر",
            slots: [
                getDbItem('01 subject', 90, 'فيل'),
                getDbItem('05 adjectives', 23, 'جوا'),
                getDbItem('03 object', 18, 'صندوق'),
                getDbItem('10 colors', 6, 'اخضر')
            ]
        },
        8: {
            title: "زرافة برا صندوق ازرق",
            slots: [
                getDbItem('01 subject', 111, 'زرافة'),
                getDbItem('05 adjectives', 24, 'برا'),
                getDbItem('03 object', 18, 'صندوق'),
                getDbItem('10 colors', 3, 'ازرق')
            ]
        },
        9: {
            title: "بقرة على طابة بنفسجية",
            slots: [
                getDbItem('01 subject', 97, 'بقرة'),
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 4, 'طابة'),
                getDbItem('10 colors', 9, 'بنفسجية')
            ]
        },
        10: {
            title: "اسد على طابة بيضا",
            slots: [
                getDbItem('01 subject', 96, 'اسد'),
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 4, 'طابة'),
                getDbItem('10 colors', 11, 'بيضا')
            ]
        },
        11: {
            title: "نحلة صفرا فوق نملة",
            slots: [
                getDbItem('03 object', 10, 'نحلة'),
                getDbItem('10 colors', 12, 'صفرا'),
                getDbItem('05 adjectives', 38, 'فوق'),
                getDbItem('03 object', 2, 'نملة')
            ]
        },
        12: {
            title: "ارنب ابيض امام فيل",
            slots: [
                getDbItem('01 subject', 100, 'ارنب'),
                getDbItem('10 colors', 11, 'ابيض'),
                getDbItem('09 Prepositions', 5, 'أمام'),
                getDbItem('01 subject', 90, 'فيل')
            ]
        },
        13: {
            title: "ماما جنب براد ابيض",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('09 Prepositions', 8, 'جنب'),
                getDbItem('03 object', 45, 'براد'),
                getDbItem('10 colors', 11, 'ابيض')
            ]
        },
        14: {
            title: "بابا جنب سيارة صفرا",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('09 Prepositions', 8, 'جنب'),
                getDbItem('03 object', 25, 'سيارة'),
                getDbItem('10 colors', 12, 'صفرا')
            ]
        },
        15: {
            title: "ماما تحت طاولة كبيرة",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('09 Prepositions', 10, 'تحت'),
                getDbItem('03 object', 114, 'طاولة'),
                getDbItem('05 adjectives', 5, 'كبيرة')
            ]
        },
        16: {
            title: "بابا على كرسي صغيرة",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 28, 'كرسي'),
                getDbItem('05 adjectives', 6, 'صغيرة')
            ]
        },
        17: {
            title: "فيل جنب فارة سودا",
            slots: [
                getDbItem('01 subject', 90, 'فيل'),
                getDbItem('09 Prepositions', 8, 'جنب'),
                getDbItem('01 subject', 77, 'فارة'),
                getDbItem('10 colors', 2, 'سودا')
            ]
        },
        18: {
            title: "قطة تحت بطانية حمرا",
            slots: [
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('09 Prepositions', 10, 'تحت'),
                getDbItem('03 object', 15, 'بطانية'),
                getDbItem('10 colors', 10, 'حمرا')
            ]
        },
        19: {
            title: "كلب على بطانية خضرا",
            slots: [
                getDbItem('01 subject', 74, 'كلب'),
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 15, 'بطانية'),
                getDbItem('10 colors', 6, 'خضرا')
            ]
        },
        20: {
            title: "بيبي في عرباية زرقا",
            slots: [
                getDbItem('01 subject', 7, 'بيبي'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('03 object', 110, 'عرباية'),
                getDbItem('10 colors', 3, 'زرقا')
            ]
        },
        21: {
            title: "بيبي في تخت صغير",
            slots: [
                getDbItem('01 subject', 7, 'بيبي'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('03 object', 9, 'تخت'),
                getDbItem('05 adjectives', 6, 'صغير')
            ]
        },
        22: {
            title: "بيبي على صوفا صفرا",
            slots: [
                getDbItem('01 subject', 7, 'بيبي'),
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 104, 'صوفا'),
                getDbItem('10 colors', 12, 'صفرا')
            ]
        },
        23: {
            title: "ولدين في بيت شجرة",
            slots: [
                getDbItem('01 subject', 3, 'ولدين'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('03 object', 94, 'بيت'),
                getDbItem('03 object', 124, 'شجرة')
            ]
        },
        24: {
            title: "بنتين في سيارة حمرا",
            slots: [
                getDbItem('01 subject', 11, 'بنتين'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('03 object', 25, 'سيارة'),
                getDbItem('10 colors', 10, 'حمرا')
                ]
            }
        }
    },
    // ==========================================
    // FOLDER 5 (5-Word Sentences)
    // ==========================================
    "5": {
        1: { // Subgroup 1
        1: {
            title: "ولد ياكل تفاحة في المطبخ",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 3, 'تفاحة'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 35, 'المطبخ')
            ]
        },
        2: {
            title: "بنت تاكل بيتزا في الصالون",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 1, 'تاكل', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 133, 'بيتزا'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 60, 'الصالون')
            ]
        },
        3: {
            title: "بابا يسوق سيارة في الشارع",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 61, 'يسوق', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 25, 'سيارة'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 50, 'الشارع')
            ]
        },
        4: {
            title: "ماما تطبخ معكرونة في المطبخ",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 26, 'تطبخ', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 106, 'معكرونة'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 35, 'المطبخ')
            ]
        },
        5: {
            title: "عمو يسوق باص في المدينة",
            slots: [
                getDbItem('01 subject', 15, 'عمو'),
                getDbItem('02 verbs', 61, 'يسوق', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 23, 'باص'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 17, 'المدينة')
            ]
        },
        6: {
            title: "خالتو تلبس جاكيت في غرفة",
            slots: [
                getDbItem('01 subject', 14, 'خالتو'),
                getDbItem('02 verbs', 7, 'تلبس', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 58, 'جاكيت'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 9, 'غرفة النوم')
            ]
        },
        7: {
            title: "ولدين يلعبوا طابة في الحديقة",
            slots: [
                getDbItem('01 subject', 3, 'ولدين'),
                getDbItem('02 verbs', 30, 'يلعبوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 4, 'طابة'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 4, 'الحديقة')
            ]
        },
        8: {
            title: "بنتين ياكلوا فواكه في الصف",
            slots: [
                getDbItem('01 subject', 11, 'بنتين'),
                getDbItem('02 verbs', 1, 'ياكلوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 47, 'فواكه'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 18, 'الصف')
            ]
        },
        9: {
            title: "اولاد يرسموا سمكة على حيط",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 55, 'يرسموا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('01 subject', 93, 'سمكة'),
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 128, 'حيط')
            ]
        },
        10: {
            title: "بنات يشموا وردات في الحديقة",
            slots: [
                getDbItem('01 subject', 9, 'بنات'),
                getDbItem('02 verbs', 11, 'يشموا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 134, 'وردات'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 4, 'الحديقة')
            ]
        },
        11: {
            title: "فيل يشرب مي جنب البركة",
            slots: [
                getDbItem('01 subject', 90, 'فيل'),
                getDbItem('02 verbs', 2, 'يشرب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 129, 'مي'),
                getDbItem('09 Prepositions', 8, 'جنب'),
                getDbItem('04 place', 61, 'البركة')
            ]
        },
        12: {
            title: "دكتور يعطي ابرة في العيادة",
            slots: [
                getDbItem('01 subject', 21, 'دكتور'),
                getDbItem('02 verbs', 48, 'يعطي', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 72, 'ابرة'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 22, 'العيادة')
            ]
        },
        13: {
            title: "قطة تسمع صوت على شجرة",
            slots: [
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('02 verbs', 9, 'تسمع', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 135, 'صوت'),
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 124, 'شجرة')
            ]
        },
        14: {
            title: "كلب يشوف شاحنة في المدينة",
            slots: [
                getDbItem('01 subject', 74, 'كلب'),
                getDbItem('02 verbs', 8, 'يشوف', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 125, 'شاحنة'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 17, 'المدينة')
            ]
        },
        15: {
            title: "عمو يبني بناية في المدينة",
            slots: [
                getDbItem('01 subject', 15, 'عمو'),
                getDbItem('02 verbs', 84, 'يبني', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 136, 'بناية'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 17, 'المدينة')
            ]
        },
        16: {
            title: "شرطي يمسك قطة على الشجرة",
            slots: [
                getDbItem('01 subject', 24, 'شرطي'),
                getDbItem('02 verbs', 31, 'يمسك', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 149, 'الشجرة')
            ]
        },
        17: {
            title: "شرطي يمسك حرامي في محل",
            slots: [
                getDbItem('01 subject', 24, 'شرطي'),
                getDbItem('02 verbs', 31, 'يمسك', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('01 subject', 59, 'حرامي'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 19, 'محل الملابس') 
            ]
        },
        18: {
            title: "عصفور ياكل دودة في عش",
            slots: [
                getDbItem('03 object', 13, 'عصفور'),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('01 subject', 86, 'دودة'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('03 object', 73, 'عش')
            ]
        },
        19: {
            title: "استاذ يعطي طلاب في المدرسة",
            slots: [
                getDbItem('01 subject', 16, 'استاذ'),
                getDbItem('02 verbs', 48, 'يعطي', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('01 subject', 20, 'طلاب'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 47, 'المدرسة')
            ]
        },
        20: {
            title: "مصلح يصلح غسالة في المطبخ",
            slots: [
                getDbItem('01 subject', 67, 'مصلح'),
                getDbItem('02 verbs', 72, 'يصلح', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 137, 'غسالة'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 35, 'المطبخ')
            ]
        },
        21: {
            title: "ملكة تشوف ملك في القلعة",
            slots: [
                getDbItem('01 subject', 49, 'ملكة'),
                getDbItem('02 verbs', 8, 'تشوف', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('01 subject', 48, 'ملك'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 14, 'القلعة')
            ]
        },
        22: {
            title: "تاتا تقرا كتاب في الحديقة",
            slots: [
                getDbItem('01 subject', 12, 'تاتا'),
                getDbItem('02 verbs', 58, 'تقرا', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 17, 'كتاب'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 4, 'الحديقة')
            ]
        },
        23: {
            title: "جدو ينزل درج في الصالون",
            slots: [
                getDbItem('01 subject', 13, 'جدو'),
                getDbItem('02 verbs', 19, 'ينزل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 109, 'درج'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 60, 'الصالون')
            ]
        },
        24: {
            title: "ديناصور  لبس طاقية في الكهف",
            slots: [
                getDbItem('01 subject', 84, 'ديناصور'),
                getDbItem('02 verbs', 7, 'لبس', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 53, 'طاقية'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 15, 'الكهف')
            ]
        }
        },
        2: { // Subgroup 2
        1: {
            title: "ولد ياكل و ولد يشرب",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 2, 'يشرب', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        2: {
            title: "ولد يمشط و ولد يغسل",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 3, 'يمشط', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 4, 'يغسل', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        3: {
            title: "بنت تشرب و بنت تاكل",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 2, 'تشرب', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 1, 'تاكل', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        4: {
            title: "بنت تسمع و بنت ترقص",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 9, 'تسمع', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 65, 'ترقص', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        5: {
            title: "ولد يقص و بنت تكتب",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 59, 'يقص', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 57, 'تكتب', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        6: {
            title: "بنت تمشي و ولد يركض",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 16, 'تمشي', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 17, 'يركض', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        7: {
            title: "ماما تطبخ و بابا يكنس",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 26, 'تطبخ', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 44, 'يكنس', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        8: {
            title: "بابا يصلح و ماما تكنس",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 72, 'يصلح', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 44, 'تكنس', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        9: {
            title: "ماما تخلط و بابا يحمل",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 23, 'تخلط', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 47, 'يحمل', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        10: {
            title: "استاذ يعلم و طالب يكتب",
            slots: [
                getDbItem('01 subject', 16, 'استاذ'),
                getDbItem('02 verbs', 60, 'يعلم', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 18, 'طالب'),
                getDbItem('02 verbs', 57, 'يكتب', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        11: {
            title: "نحلة تطير و نملة تمشي",
            slots: [
                getDbItem('03 object', 10, 'نحلة'),
                getDbItem('02 verbs', 100, 'تطير', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('03 object', 2, 'نملة'),
                getDbItem('02 verbs', 16, 'تمشي', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        12: {
            title: "عصفور يطير و كلب يسبح",
            slots: [
                getDbItem('03 object', 13, 'عصفور'),
                getDbItem('02 verbs', 100, 'يطير', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 74, 'كلب'),
                getDbItem('02 verbs', 94, 'يسبح', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        13: {
            title: "زرافة تاكل و ارنب ينط",
            slots: [
                getDbItem('01 subject', 111, 'زرافة'),
                getDbItem('02 verbs', 1, 'تاكل', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 100, 'ارنب'),
                getDbItem('02 verbs', 21, 'ينط', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        14: {
            title: "ذئب يعيط و اسد يبكي",
            slots: [
                getDbItem('01 subject', 114, 'ذئب'),
                getDbItem('02 verbs', 35, 'يعيط', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 96, 'اسد'),
                getDbItem('02 verbs', 34, 'يبكي', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        15: {
            title: "فارة تركض و قطة تركض",
            slots: [
                getDbItem('01 subject', 77, 'فارة'),
                getDbItem('02 verbs', 17, 'تركض', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('02 verbs', 17, 'تركض', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        16: {
            title: "جدو يحفر و تاتا تقطف",
            slots: [
                getDbItem('01 subject', 13, 'جدو'),
                getDbItem('02 verbs', 70, 'يحفر', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 12, 'تاتا'),
                getDbItem('02 verbs', 83, 'تقطف', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        17: {
            title: "رسام يرسم و مومياء توقف",
            slots: [
                getDbItem('01 subject', 53, 'رسام'),
                getDbItem('02 verbs', 55, 'يرسم', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 105, 'مومياء'),
                getDbItem('02 verbs', 13, 'توقف', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        18: {
            title: "دودة ترقص و عصفور يغني",
            slots: [
                getDbItem('01 subject', 86, 'دودة'),
                getDbItem('02 verbs', 65, 'ترقص', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('03 object', 13, 'عصفور'),
                getDbItem('02 verbs', 37, 'يغني', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        19: {
            title: "ولد يكتب و بابا يحكي",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 57, 'يكتب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 29, 'يحكي', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        20: {
            title: "ولد يطعمي و قطة تبكي",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 63, 'يطعمي', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('02 verbs', 34, 'تبكي', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        21: {
            title: "ولد يشوط و حارس ينط",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 52, 'يشوط', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 51, 'حارس'),
                getDbItem('02 verbs', 21, 'ينط', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        22: {
            title: "طالب يسأل و استاذ يحكي",
            slots: [
                getDbItem('01 subject', 18, 'طالب'),
                getDbItem('02 verbs', 42, 'يسأل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 16, 'استاذ'),
                getDbItem('02 verbs', 29, 'يحكي', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        23: {
            title: "بيبي يزحف و ماما تضحك",
            slots: [
                getDbItem('01 subject', 7, 'بيبي'),
                getDbItem('02 verbs', 18, 'يزحف', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 39, 'تضحك', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        24: {
            title: "بيبي يعيط و بابا يبكي",
            slots: [
                getDbItem('01 subject', 7, 'بيبي'),
                getDbItem('02 verbs', 35, 'يعيط', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 34, 'يبكي', { verbTense: 'present', conjugation: 'he' })
                ]
            }
        },
        3: { // Subgroup 3
        1: {
            title: "ولد و بنت يلعبوا الصبح",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 30, 'يلعبوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        2: {
            title: "بنت و ولد ياكلوا الصبح",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 1, 'ياكلوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        3: {
            title: "بابا و ماما يحكوا الضهر",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 29, 'يحكوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('06 time', 1, 'الضهر')
            ]
        },
        4: {
            title: "كلب و قطة ينطوا النهار",
            slots: [
                getDbItem('01 subject', 74, 'كلب'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('02 verbs', 21, 'ينطوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('06 time', 6, 'النهار')
            ]
        },
        5: {
            title: "قطة و عصفور يغنوا النهار",
            slots: [
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('03 object', 13, 'عصفور'),
                getDbItem('02 verbs', 37, 'يغنوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('06 time', 6, 'النهار')
            ]
        },
        6: {
            title: "شرطي و شرطية يمشوا الان",
            slots: [
                getDbItem('01 subject', 24, 'شرطي'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 25, 'شرطية'),
                getDbItem('02 verbs', 16, 'يمشوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        7: {
            title: "استاذ و طالب يحكوا الصبح",
            slots: [
                getDbItem('01 subject', 16, 'استاذ'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 18, 'طالب'),
                getDbItem('02 verbs', 29, 'يحكوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        8: {
            title: "ساحر و ساحرة يطيروا الان",
            slots: [
                getDbItem('01 subject', 68, 'ساحر'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 62, 'ساحرة'),
                getDbItem('02 verbs', 100, 'يطيروا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        9: {
            title: "نحلة و نملة يوقفوا الان",
            slots: [
                getDbItem('03 object', 10, 'نحلة'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('03 object', 2, 'نملة'),
                getDbItem('02 verbs', 13, 'يوقفوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        10: {
            title: "فيل و اسد يركضوا الصبح",
            slots: [
                getDbItem('01 subject', 90, 'فيل'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 96, 'اسد'),
                getDbItem('02 verbs', 17, 'يركضوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        11: {
            title: "اولاد و بنات يشربوا الان",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 9, 'بنات'),
                getDbItem('02 verbs', 2, 'يشربوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        12: {
            title: "بنات و اولاد يناموا بليل",
            slots: [
                getDbItem('01 subject', 9, 'بنات'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 6, 'يناموا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('06 time', 17, 'بليل')
            ]
        },
        13: {
            title: "دب و نحلة يضحكوا الان",
            slots: [
                getDbItem('03 object', 8, 'دب'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('03 object', 10, 'نحلة'),
                getDbItem('02 verbs', 39, 'يضحكوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        14: {
            title: "اسد و زرافة يمشوا الصبح",
            slots: [
                getDbItem('01 subject', 96, 'اسد'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 111, 'زرافة'),
                getDbItem('02 verbs', 16, 'يمشوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        15: {
            title: "فارة و قطة يركضوا الان",
            slots: [
                getDbItem('01 subject', 77, 'فارة'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('02 verbs', 17, 'يركضوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        16: {
            title: "سيارة و باص يمشوا الان",
            slots: [
                getDbItem('03 object', 25, 'سيارة'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('03 object', 23, 'باص'),
                getDbItem('02 verbs', 16, 'يمشوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        17: {
            title: "طيارة و عصفور يطيروا النهار",
            slots: [
                getDbItem('03 object', 84, 'طيارة'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('03 object', 13, 'عصفور'),
                getDbItem('02 verbs', 100, 'يطيروا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('06 time', 6, 'النهار')
            ]
        },
        18: {
            title: "قارب و  سفينة يفوشوا النهار",
            slots: [
                getDbItem('03 object', 148, 'قارب'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('03 object', 16, 'سفينة'),
                getDbItem('02 verbs', 73, 'يفوشوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('06 time', 6, 'النهار')
            ]
        },
        19: {
            title: "طباخ و ولد يطبخوا الصبح",
            slots: [
                getDbItem('01 subject', 56, 'طباخ'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 26, 'يطبخوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        20: {
            title: "دكتور و دكتورة يحكوا الضهر",
            slots: [
                getDbItem('01 subject', 21, 'دكتور'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 22, 'دكتورة'),
                getDbItem('02 verbs', 29, 'يحكوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('06 time', 1, 'الضهر')
            ]
        },
        21: {
            title: "نملة و نحلة يكتبوا الصبح",
            slots: [
                getDbItem('03 object', 2, 'نملة'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('03 object', 10, 'نحلة'),
                getDbItem('02 verbs', 57, 'يكتبوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        22: {
            title: "شبح و مومياء يدرسوا الضهر",
            slots: [
                getDbItem('01 subject', 109, 'شبح'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 105, 'مومياء'),
                getDbItem('02 verbs', 77, 'يدرسوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('06 time', 1, 'الضهر')
            ]
        },
        23: {
            title: "ديناصور و فيل يطلعوا الان",
            slots: [
                getDbItem('01 subject', 84, 'ديناصور'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 90, 'فيل'),
                getDbItem('02 verbs', 20, 'يطلعوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        24: {
            title: "ماما و ولد يشتروا الضهر",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 46, 'يشتروا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('06 time', 1, 'الضهر')
                ]
            }            
        },
        4: { // Subgroup 4
        1: {
            title: "ولد بدو ياكل تفاحة حمرا",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 3, 'تفاحة'),
                getDbItem('10 colors', 10, 'حمرا')
            ]
        },
        2: {
            title: "بنت بدها تشرب عصير برتقال",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 2, 'تشرب', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 59, 'عصير'),
                getDbItem('03 object', 75, 'برتقال')
            ]
        },
        3: {
            title: "بابا بدو يصلح سيارة خضرا",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 72, 'يصلح', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 25, 'سيارة'),
                getDbItem('10 colors', 6, 'خضرا')
            ]
        },
        4: {
            title: "ماما بدها تطبخ رز ابيض",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 26, 'تطبخ', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 89, 'رز'),
                getDbItem('10 colors', 11, 'ابيض')
            ]
        },
        5: {
            title: "دودات بدهم ياكلوا تفاحة كبيرة",
            slots: [
                getDbItem('01 subject', 88, 'دودات'),
                getDbItem('02 verbs', 15, 'بدهم', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('02 verbs', 1, 'ياكلوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 3, 'تفاحة'),
                getDbItem('05 adjectives', 5, 'كبيرة')
            ]
        },
        6: {
            title: "رسام بدو يرسم وردة صفرا",
            slots: [
                getDbItem('01 subject', 53, 'رسام'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 55, 'يرسم', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 43, 'وردة'),
                getDbItem('10 colors', 12, 'صفرا')
            ]
        },
        7: {
            title: "ساحرة بدها تطلع البرج طويل",
            slots: [
                getDbItem('01 subject', 62, 'ساحرة'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 20, 'تطلع', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('04 place', 53, 'البرج'),
                getDbItem('05 adjectives', 32, 'طويل')
            ]
        },
        8: {
            title: "دكتور بدو يسكر  باب ازرق",
            slots: [
                getDbItem('01 subject', 21, 'دكتور'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 51, 'يسكر', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 36, 'باب'),
                getDbItem('10 colors', 3, 'ازرق')
            ]
        },
        9: {
            title: "ملكة بدها تمشط شعر احمر",
            slots: [
                getDbItem('01 subject', 49, 'ملكة'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 3, 'تمشط', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 49, 'شعر'),
                getDbItem('10 colors', 10, 'احمر')
            ]
        },
        10: {
            title: "ارنب بدو ياكل جزرة برتقالية",
            slots: [
                getDbItem('01 subject', 100, 'ارنب'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 27, 'جزرة'),
                getDbItem('10 colors', 7, 'برتقالية')
            ]
        },
        11: {
            title: "اولاد بدهم يلبسوا جاكيت صفرا",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 15, 'بدهم', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('02 verbs', 7, 'يلبسوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 58, 'جاكيت'),
                getDbItem('10 colors', 12, 'صفرا')
            ]
        },
        12: {
            title: "بنات بدهم يناموا تخت كبير",
            slots: [
                getDbItem('01 subject', 9, 'بنات'),
                getDbItem('02 verbs', 15, 'بدهم', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('02 verbs', 6, 'يناموا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 9, 'تخت'),
                getDbItem('05 adjectives', 5, 'كبير')
            ]
        },
        13: {
            title: "دب بدو ياكل عسل اصفر",
            slots: [
                getDbItem('03 object', 8, 'دب'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 54, 'عسل'),
                getDbItem('10 colors', 12, 'اصفر')
            ]
        },
        14: {
            title: "زرافة بدها تشرب عصير برتقال",
            slots: [
                getDbItem('01 subject', 111, 'زرافة'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 2, 'تشرب', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 59, 'عصير'),
                getDbItem('03 object', 75, 'برتقال')
            ]
        },
        15: {
            title: "فارة بدها تاكل جبنة صفرا",
            slots: [
                getDbItem('01 subject', 77, 'فارة'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 1, 'تاكل', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 30, 'جبنة'),
                getDbItem('10 colors', 12, 'صفرا')
            ]
        },
        16: {
            title: "شرطي بدو يمسك حرامي مصاري",
            slots: [
                getDbItem('01 subject', 24, 'شرطي'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 31, 'يمسك', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('01 subject', 59, 'حرامي'),
                getDbItem('03 object', 138, 'مصاري')
            ]
        },
        17: {
            title: "قطة بدها تطلع بيت شجرة",
            slots: [
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 20, 'تطلع', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 94, 'بيت'),
                getDbItem('03 object', 124, 'شجرة')
            ]
        },
        18: {
            title: "كلب بدو ينزل بيت شجرة",
            slots: [
                getDbItem('01 subject', 74, 'كلب'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 19, 'ينزل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 94, 'بيت'),
                getDbItem('03 object', 124, 'شجرة')
            ]
        },
        19: {
            title: "طباخ بدو يخبز قالب كاتو",
            slots: [
                getDbItem('01 subject', 56, 'طباخ'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 25, 'يخبز', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 139, 'قالب'),
                getDbItem('03 object', 14, 'كاتو')
            ]
        },
        20: {
            title: "دكتور بدو يعطي ابرة كبيرة",
            slots: [
                getDbItem('01 subject', 21, 'دكتور'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 48, 'يعطي', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 72, 'ابرة'),
                getDbItem('05 adjectives', 5, 'كبيرة')
            ]
        },
        21: {
            title: "نملة بدها تحمل بسكوتة صغيرة",
            slots: [
                getDbItem('03 object', 2, 'نملة'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 47, 'تحمل', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 140, 'بسكوتة'),
                getDbItem('05 adjectives', 6, 'صغيرة')
            ]
        },
        22: {
            title: "شبح بدو ياكل قالب كاتو",
            slots: [
                getDbItem('01 subject', 109, 'شبح'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 139, 'قالب'),
                getDbItem('03 object', 14, 'كاتو')
            ]
        },
        23: {
            title: "ديناصور بدو يطلع الجبل كبير",
            slots: [
                getDbItem('01 subject', 84, 'ديناصور'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 20, 'يطلع', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('04 place', 37, 'الجبل'),
                getDbItem('05 adjectives', 5, 'كبير')
            ]
        },
        24: {
            title: "ولد بدو يشتري قلم ازرق",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 46, 'يشتري', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 80, 'قلم'),
                getDbItem('10 colors', 3, 'ازرق')
                ]
            }
        },
        5: { // Subgroup 5
        1: {
            title: "ولد أكل تفاحة حمرا مبارح",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 1, 'أكل', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 3, 'تفاحة'),
                getDbItem('10 colors', 10, 'حمرا'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        2: {
            title: "بنت أكلت تفاحة صفرا مبارح",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 1, 'أكلت', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('03 object', 3, 'تفاحة'),
                getDbItem('10 colors', 12, 'صفرا'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        3: {
            title: "ولد شرب عصير برتقال مبارح",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 2, 'شرب', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 59, 'عصير'),
                getDbItem('03 object', 75, 'برتقال'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        4: {
            title: "بنت شربت حليب ابيض مبارح",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 2, 'شربت', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('03 object', 67, 'حليب'),
                getDbItem('10 colors', 11, 'ابيض'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        5: {
            title: "بابا غسل سيارة خضرا مبارح",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 4, 'غسل', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 25, 'سيارة'),
                getDbItem('10 colors', 6, 'خضرا'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        6: {
            title: "ماما غسلت خيار اخضر مبارح",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 4, 'غسلت', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('03 object', 141, 'خيار'),
                getDbItem('10 colors', 6, 'اخضر'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        7: {
            title: "بابا تحمم شامبو بنفسجي مبارح",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 5, 'تحمم', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 96, 'شامبو'),
                getDbItem('10 colors', 9, 'بنفسجي'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        8: {
            title: "ماما تحممت شامبو ازرق مبارح",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 5, 'تحممت', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('03 object', 96, 'شامبو'),
                getDbItem('10 colors', 3, 'ازرق'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        9: {
            title: "قطة نامت تخت كبير مبارح",
            slots: [
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('02 verbs', 6, 'نامت', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('03 object', 9, 'تخت'),
                getDbItem('05 adjectives', 5, 'كبير'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        10: {
            title: "كلب نام الارض وسخة مبارح",
            slots: [
                getDbItem('01 subject', 74, 'كلب'),
                getDbItem('02 verbs', 6, 'نام', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('04 place', 62, 'الارض'),
                getDbItem('05 adjectives', 8, 'وسخة'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        11: {
            title: "اولاد لعبوا طابة حمرا مبارح",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 30, 'لعبوا', { verbTense: 'past', conjugation: 'they' }),
                getDbItem('03 object', 4, 'طابة'),
                getDbItem('10 colors', 10, 'حمرا'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        12: {
            title: "بنات لعبوا سيارة صفرا مبارح",
            slots: [
                getDbItem('01 subject', 9, 'بنات'),
                getDbItem('02 verbs', 30, 'لعبوا', { verbTense: 'past', conjugation: 'they' }),
                getDbItem('03 object', 25, 'سيارة'),
                getDbItem('10 colors', 12, 'صفرا'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        13: {
            title: "فارة طلعت درج كبير مبارح",
            slots: [
                getDbItem('01 subject', 77, 'فارة'),
                getDbItem('02 verbs', 20, 'طلعت', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('03 object', 109, 'درج'),
                getDbItem('05 adjectives', 5, 'كبير'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        14: {
            title: "مصلح صلح موبايل اصفر مبارح",
            slots: [
                getDbItem('01 subject', 67, 'مصلح'),
                getDbItem('02 verbs', 72, 'صلح', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 82, 'موبايل'),
                getDbItem('10 colors', 12, 'اصفر'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        15: {
            title: "ولد فتح براد مليان مبارح",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 50, 'فتح', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 45, 'براد'),
                getDbItem('05 adjectives', 51, 'مليان'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        16: {
            title: "بابا قطف تفاحة حمرا مبارح",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 83, 'قطف', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 3, 'تفاحة'),
                getDbItem('10 colors', 10, 'حمرا'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        17: {
            title: "بنت ساعدت تاتا حلوة مبارح",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 75, 'ساعدت', { verbTense: 'past', conjugation: 'I' }),
                getDbItem('01 subject', 12, 'تاتا'),
                getDbItem('05 adjectives', 39, 'حلوة'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        18: {
            title: "ماما ضبت حقيبة حمرا مبارح",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 81, 'ضبت', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('03 object', 142, 'حقيبة'),
                getDbItem('10 colors', 10, 'حمرا'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        19: {
            title: "بنت رسمت قطة حلوة مبارح",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 55, 'رسمت', { verbTense: 'past', conjugation: 'I' }),
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('05 adjectives', 39, 'حلوة'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        20: {
            title: "تاتا لمست قطة بيضا مبارح",
            slots: [
                getDbItem('01 subject', 12, 'تاتا'),
                getDbItem('02 verbs', 10, 'لمست', { verbTense: 'past', conjugation: 'I' }),
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('10 colors', 11, 'بيضا'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        21: {
            title: "بابا نام تخت ازرق مبارح",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 6, 'نام', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 9, 'تخت'),
                getDbItem('10 colors', 3, 'ازرق'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        22: {
            title: "عمو شاف فيلم حلو مبارح",
            slots: [
                getDbItem('01 subject', 15, 'عمو'),
                getDbItem('02 verbs', 8, 'شاف', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 69, 'فيلم'),
                getDbItem('05 adjectives', 39, 'حلو'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        23: {
            title: "ولد كتب قلم ازرق مبارح",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 57, 'كتب', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 80, 'قلم'),
                getDbItem('10 colors', 3, 'ازرق'),
                getDbItem('06 time', 30, 'مبارح')
            ]
        },
        24: {
            title: "ولد نفخ بالون احمر مبارح",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 33, 'نفخ', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 143, 'بالون'),
                getDbItem('10 colors', 10, 'احمر'),
                getDbItem('06 time', 30, 'مبارح')
                ]
            }
        },
        6: { // Subgroup 6
        1: {
            title: "ولد ياكل تفاحة حمرا الصبح",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 3, 'تفاحة'),
                getDbItem('10 colors', 10, 'حمرا'),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        2: {
            title: "ولد يشرب مي كتير بليل",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 2, 'يشرب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 129, 'مي'),
                getDbItem('05 adjectives', 41, 'كتير'),
                getDbItem('06 time', 17, 'بليل')
            ]
        },
        3: {
            title: "بنت تاكل بطيخ احمر الصيف",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 1, 'تاكل', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 144, 'بطيخ'),
                getDbItem('10 colors', 10, 'احمر'),
                getDbItem('06 time', 22, 'الصيف')
            ]
        },
        4: {
            title: "بنت تشرب حليب ابيض بليل",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 2, 'تشرب', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 67, 'حليب'),
                getDbItem('10 colors', 11, 'ابيض'),
                getDbItem('06 time', 17, 'بليل')
            ]
        },
        5: {
            title: "بابا يغسل ايدين وسخة الان",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 4, 'يغسل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 145, 'ايدين'),
                getDbItem('05 adjectives', 8, 'وسخة'),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        6: {
            title: "ماما تغسل فواكه وسخة الان",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 4, 'تغسل', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 47, 'فواكه'),
                getDbItem('05 adjectives', 8, 'وسخة'),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        7: {
            title: "جدو يمشط شعر ابيض الان",
            slots: [
                getDbItem('01 subject', 13, 'جدو'),
                getDbItem('02 verbs', 3, 'يمشط', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 49, 'شعر'),
                getDbItem('10 colors', 11, 'ابيض'),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        8: {
            title: "ماما تمشط شعر اسود الان",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 3, 'تمشط', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 49, 'شعر'),
                getDbItem('10 colors', 2, 'اسود'),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        9: {
            title: "ولد يتحمم شامبو اصفر الساعة",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 5, 'يتحمم', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 96, 'شامبو'),
                getDbItem('10 colors', 12, 'اصفر'),
                getDbItem('06 time', 18, 'ساعة 9')
            ]
        },
        10: {
            title: "بنت تتحمم شامبو احمر الساعة",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 5, 'تتحمم', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 96, 'شامبو'),
                getDbItem('10 colors', 10, 'احمر'),
                getDbItem('06 time', 20, 'ساعة 6')
            ]
        },
        11: {
            title: "ولد يلعب طابة صغيرة الصبح",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 30, 'يلعب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 4, 'طابة'),
                getDbItem('05 adjectives', 6, 'صغيرة'),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        12: {
            title: "بنت تلعب طابة كبيرة الان",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 30, 'تلعب', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 4, 'طابة'),
                getDbItem('05 adjectives', 5, 'كبيرة'),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        13: {
            title: "ولد ينام تخت اصفر بليل",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 6, 'ينام', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 9, 'تخت'),
                getDbItem('10 colors', 12, 'اصفر'),
                getDbItem('06 time', 17, 'بليل')
            ]
        },
        14: {
            title: "بنت تنام تخت اخضر بليل",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 6, 'تنام', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 9, 'تخت'),
                getDbItem('10 colors', 6, 'اخضر'),
                getDbItem('06 time', 17, 'بليل')
            ]
        },
        15: {
            title: "بابا يطبخ اكل كتير الضهر",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 26, 'يطبخ', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 162, 'اكل'),
                getDbItem('05 adjectives', 41, 'كتير'),
                getDbItem('06 time', 1, 'الضهر')
            ]
        },
        16: {
            title: "ماما تطبخ اكل كتير بليل",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 26, 'تطبخ', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 162, 'اكل'),
                getDbItem('05 adjectives', 41, 'كتير'),
                getDbItem('06 time', 17, 'بليل')
            ]
        },
        17: {
            title: "ولد يسوق سيارة زرقا الشتاء",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 61, 'يسوق', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 25, 'سيارة'),
                getDbItem('10 colors', 3, 'زرقا'),
                getDbItem('06 time', 29, 'الشتاء')
            ]
        },
        18: {
            title: "بنت تسوق بسكليت صغير الربيع",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 61, 'تسوق', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 11, 'بسكليت'),
                getDbItem('05 adjectives', 6, 'صغير'),
                getDbItem('06 time', 21, 'الربيع')
            ]
        },
        19: {
            title: "عمو يشوف تلفزيون صغير بليل",
            slots: [
                getDbItem('01 subject', 15, 'عمو'),
                getDbItem('02 verbs', 8, 'يشوف', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 126, 'تلفزيون'),
                getDbItem('05 adjectives', 6, 'صغير'),
                getDbItem('06 time', 17, 'بليل')
            ]
        },
        20: {
            title: "ولد يكتب قلم احمر ساعة",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 57, 'يكتب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 80, 'قلم'),
                getDbItem('10 colors', 10, 'احمر'),
                getDbItem('06 time', 24, 'ساعة 3')
            ]
        },
        21: {
            title: "بنت ترسم قطة صفرا الان",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 55, 'ترسم', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('10 colors', 12, 'صفرا'),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        22: {
            title: "تاتا تلمس قطة بيضا بليل",
            slots: [
                getDbItem('01 subject', 12, 'تاتا'),
                getDbItem('02 verbs', 10, 'تلمس', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('10 colors', 11, 'بيضا'),
                getDbItem('06 time', 17, 'بليل')
            ]
        },
        23: {
            title: "بيبي ينام عرباية زرقا الصبح",
            slots: [
                getDbItem('01 subject', 7, 'بيبي'),
                getDbItem('02 verbs', 6, 'ينام', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 110, 'عرباية'),
                getDbItem('10 colors', 3, 'زرقا'),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        24: {
            title: "ولد ينفخ بالون كبير الان",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 33, 'ينفخ', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 143, 'بالون'),
                getDbItem('05 adjectives', 5, 'كبير'),
                getDbItem('06 time', 19, 'الان')
                ]
            }
        },
        7: { // Subgroup 7
        1: {
            title: "ولد ياكل و يشرب الان",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 2, 'يشرب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        2: {
            title: "بنت تاكل و تشرب الان",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 1, 'تاكل', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 2, 'تشرب', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        3: {
            title: "اولاد ياكلوا و يشربوا الصبح",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 1, 'ياكلوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 2, 'يشربوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        4: {
            title: "بنات ياكلوا و يشربوا الصبح",
            slots: [
                getDbItem('01 subject', 9, 'بنات'),
                getDbItem('02 verbs', 1, 'ياكلوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 2, 'يشربوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        5: {
            title: "بابا يلعب و يشوط الضهر",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 30, 'يلعب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 52, 'يشوط', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('06 time', 1, 'الضهر')
            ]
        },
        6: {
            title: "ماما تعصر و تقطع الضهر",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 92, 'تعصر', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 24, 'تقطع', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('06 time', 1, 'الضهر')
            ]
        },
        7: {
            title: "بابا ينام و يشخر بليل",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 6, 'ينام', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 90, 'يشخر', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('06 time', 17, 'بليل')
            ]
        },
        8: {
            title: "ماما تضحك و تغني بليل",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 39, 'تضحك', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 37, 'تغني', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('06 time', 17, 'بليل')
            ]
        },
        9: {
            title: "ولد يصفر و يمشي الشتاء",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 38, 'يصفر', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 16, 'يمشي', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('06 time', 29, 'الشتاء')
            ]
        },
        10: {
            title: "بنت تنط و تضحك الصيف",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 21, 'تنط', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 39, 'تضحك', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('06 time', 22, 'الصيف')
            ]
        },
        11: {
            title: "بابا يقعد و  يفكر الخريف",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 14, 'يقعد', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 67, 'يفكر', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('06 time', 12, 'الخريف')
            ]
        },
        12: {
            title: "ماما توقف و تعيط الربيع",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 13, 'توقف', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 35, 'تعيط', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('06 time', 21, 'الربيع')
            ]
        },
        13: {
            title: "زرافة تمشي و تضحك الصبح",
            slots: [
                getDbItem('01 subject', 111, 'زرافة'),
                getDbItem('02 verbs', 16, 'تمشي', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 39, 'تضحك', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        14: {
            title: "ذئب يعيط و يبكي بليل",
            slots: [
                getDbItem('01 subject', 114, 'ذئب'),
                getDbItem('02 verbs', 35, 'يعيط', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 34, 'يبكي', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('06 time', 17, 'بليل')
            ]
        },
        15: {
            title: "فارة تشم و تسرق الان",
            slots: [
                getDbItem('01 subject', 77, 'فارة'),
                getDbItem('02 verbs', 11, 'تشم', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 93, 'تسرق', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        16: {
            title: "جدو قاعد و يقرا بليل",
            slots: [
                getDbItem('01 subject', 13, 'جدو'),
                getDbItem('05 adjectives', 33, 'قاعد'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 58, 'يقرا', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('06 time', 17, 'بليل')
            ]
        },
        17: {
            title: "رسام يرسم و يلون النهار",
            slots: [
                getDbItem('01 subject', 53, 'رسام'),
                getDbItem('02 verbs', 55, 'يرسم', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 54, 'يلون', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('06 time', 6, 'النهار')
            ]
        },
        18: {
            title: "دودة ترقص و تغني الصبح",
            slots: [
                getDbItem('01 subject', 86, 'دودة'),
                getDbItem('02 verbs', 65, 'ترقص', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 37, 'تغني', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        19: {
            title: "ولد قعد و يكتب الصبح",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 14, 'قعد',  { verbTense: 'past', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 57, 'يكتب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        20: {
            title: "ولد فتح و يسلم  الان",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 50, 'فتح', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 36, 'يسلم', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        21: {
            title: "ولد يركض و يشوط الان",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 17, 'يركض', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 52, 'يشوط', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        22: {
            title: "طالب وقف و يسأل الصبح",
            slots: [
                getDbItem('01 subject', 18, 'طالب'),
                getDbItem('02 verbs', 13, 'وقف', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 42, 'يسأل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        23: {
            title: "بيبي يزحف و يضحك الصبح",
            slots: [
                getDbItem('01 subject', 7, 'بيبي'),
                getDbItem('02 verbs', 18, 'يزحف', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 39, 'يضحك', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        24: {
            title: "بيبي يعيط و يبكي بليل",
            slots: [
                getDbItem('01 subject', 7, 'بيبي'),
                getDbItem('02 verbs', 35, 'يعيط', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 34, 'يبكي', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('06 time', 17, 'بليل')
                ]
            }
        },
        8: { // Subgroup 8
        1: {
            title: "ولد حزين يقعد على كرسي",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('05 adjectives', 43, 'حزين'),
                getDbItem('02 verbs', 14, 'يقعد', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 28, 'كرسي')
            ]
        },
        2: {
            title: "ولد نظيف يوقف على تخت",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('05 adjectives', 7, 'نظيف'),
                getDbItem('02 verbs', 13, 'يوقف', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 9, 'تخت')
            ]
        },
        3: {
            title: "بنت كبيرة توقف على كرسي",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('05 adjectives', 5, 'كبيرة'),
                getDbItem('02 verbs', 13, 'توقف', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 28, 'كرسي')
            ]
        },
        4: {
            title: "بنت وسخة تقعد على طاولة",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('05 adjectives', 8, 'وسخة'),
                getDbItem('02 verbs', 14, 'تقعد', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 114, 'طاولة')
            ]
        },
        5: {
            title: "نحلة صفرا تطير في الحديقة",
            slots: [
                getDbItem('03 object', 10, 'نحلة'),
                getDbItem('10 colors', 12, 'صفرا'),
                getDbItem('02 verbs', 100, 'تطير', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 4, 'الحديقة')
            ]
        },
        6: {
            title: "ارنب ابيض ينط في الحديقة",
            slots: [
                getDbItem('01 subject', 100, 'ارنب'),
                getDbItem('10 colors', 11, 'ابيض'),
                getDbItem('02 verbs', 21, 'ينط', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 4, 'الحديقة')
            ]
        },
        7: {
            title: "فيل اصفر يلعب في البركة",
            slots: [
                getDbItem('01 subject', 90, 'فيل'),
                getDbItem('10 colors', 12, 'اصفر'),
                getDbItem('02 verbs', 30, 'يلعب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 61, 'البركة')
            ]
        },
        8: {
            title: "زرافة صفرا تاكل في الغابة",
            slots: [
                getDbItem('01 subject', 111, 'زرافة'),
                getDbItem('10 colors', 12, 'صفرا'),
                getDbItem('02 verbs', 1, 'تاكل', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 34, 'الغابة')
            ]
        },
        9: {
            title: "بقرة اسود تاكل في البيت",
            slots: [
                getDbItem('01 subject', 97, 'بقرة'),
                getDbItem('10 colors', 2, 'اسود'),
                getDbItem('02 verbs', 1, 'تاكل', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('01 subject', 122, 'البيت')
            ]
        },
        10: {
            title: "اسد كبير يعيط في الغابة",
            slots: [
                getDbItem('01 subject', 96, 'اسد'),
                getDbItem('05 adjectives', 5, 'كبير'),
                getDbItem('02 verbs', 35, 'يعيط', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 34, 'الغابة')
            ]
        },
        11: {
            title: "ماما سعيدة تطبخ في المطبخ",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('05 adjectives', 44, 'سعيدة'),
                getDbItem('02 verbs', 26, 'تطبخ', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 35, 'المطبخ')
            ]
        },
        12: {
            title: "بابا معصب يصلح في الصالون",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('05 adjectives', 45, 'معصب'),
                getDbItem('02 verbs', 72, 'يصلح', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 60, 'الصالون')
            ]
        },
        13: {
            title: "زرافة طويلة تاكل في الغابة",
            slots: [
                getDbItem('01 subject', 111, 'زرافة'),
                getDbItem('05 adjectives', 32, 'طويلة'),
                getDbItem('02 verbs', 1, 'تاكل', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 34, 'الغابة')
            ]
        },
        14: {
            title: "قطة ناعمة تمشي  في الشارع",
            slots: [
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('05 adjectives', 20, 'ناعمة'),
                getDbItem('02 verbs', 16, 'تمشي', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 50, 'الشارع')
            ]
        },
        15: {
            title: "فارة سودا تبكي في المطبخ",
            slots: [
                getDbItem('01 subject', 77, 'فارة'),
                getDbItem('10 colors', 2, 'سودا'),
                getDbItem('02 verbs', 34, 'تبكي', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 35, 'المطبخ')
            ]
        },
        16: {
            title: "جدو معصب يحفر في الحديقة",
            slots: [
                getDbItem('01 subject', 13, 'جدو'),
                getDbItem('05 adjectives', 45, 'معصب'),
                getDbItem('02 verbs', 70, 'يحفر', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 4, 'الحديقة')
            ]
        },
        17: {
            title: "رسام طويل يرسم في الشارع",
            slots: [
                getDbItem('01 subject', 53, 'رسام'),
                getDbItem('05 adjectives', 32, 'طويل'),
                getDbItem('02 verbs', 55, 'يرسم', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 50, 'الشارع')
            ]
        },
        18: {
            title: "دودة رفيعة تمشي على تفاحة",
            slots: [
                getDbItem('01 subject', 86, 'دودة'),
                getDbItem('05 adjectives', 35, 'رفيعة'),
                getDbItem('02 verbs', 16, 'تمشي', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 3, 'تفاحة')
            ]
        },
        19: {
            title: "ولد مبلول يلعب في مي",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('05 adjectives', 18, 'مبلول'),
                getDbItem('02 verbs', 30, 'يلعب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('03 object', 129, 'مي')
            ]
        },
        20: {
            title: "ولد صغير ينط في الحديقة",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('05 adjectives', 6, 'صغير'),
                getDbItem('02 verbs', 21, 'ينط', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 4, 'الحديقة')
            ]
        },
        21: {
            title: "دب بني يسبح جنب النهر",
            slots: [
                getDbItem('03 object', 8, 'دب'),
                getDbItem('10 colors', 4, 'بني'),
                getDbItem('02 verbs', 94, 'يسبح', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('09 Prepositions', 8, 'جنب'),
                getDbItem('04 place', 44, 'النهر')
            ]
        },
        22: {
            title: "سمكة زرقا تسبح في البركة",
            slots: [
                getDbItem('01 subject', 93, 'سمكة'),
                getDbItem('10 colors', 3, 'زرقا'),
                getDbItem('02 verbs', 94, 'تسبح', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 61, 'البركة')
            ]
        },
        23: {
            title: "بيبي حلو يشرب في المطبخ",
            slots: [
                getDbItem('01 subject', 7, 'بيبي'),
                getDbItem('05 adjectives', 39, 'حلو'),
                getDbItem('02 verbs', 2, 'يشرب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 35, 'المطبخ')
            ]
        },
        24: {
            title: "بيبي وسخ ياكل في المطبخ",
            slots: [
                getDbItem('01 subject', 7, 'بيبي'),
                getDbItem('05 adjectives', 8, 'وسخ'),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 35, 'المطبخ')
                ]
            }
        }
    },

    // ==========================================
    // FOLDER 6 (6-Word Sentences)
    // ==========================================
    "6": {
        1: { // Subgroup 1
        1: {
            title: "ولد ياكل تفاحة في المطبخ الصبح",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 3, 'تفاحة'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 35, 'المطبخ'),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        2: {
            title: "بنت تاكل بيتزا في الصالون الضهر",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 1, 'تاكل', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 133, 'بيتزا'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 60, 'الصالون'),
                getDbItem('06 time', 1, 'الضهر')
            ]
        },
        3: {
            title: "بابا يسوق سيارة في الشارع بليل",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 61, 'يسوق', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 25, 'سيارة'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 50, 'الشارع'),
                getDbItem('06 time', 17, 'بليل')
            ]
        },
        4: {
            title: "ماما تطبخ معكرونة في المطبخ الضهر",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 26, 'تطبخ', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 106, 'معكرونة'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 35, 'المطبخ'),
                getDbItem('06 time', 1, 'الضهر')
            ]
        },
        5: {
            title: "عمو يسوق باص في المدينة الان",
            slots: [
                getDbItem('01 subject', 15, 'عمو'),
                getDbItem('02 verbs', 61, 'يسوق', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 23, 'باص'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 17, 'المدينة'),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        6: {
            title: "خالتو تلبس جاكيت في غرفة نوم الان",
            slots: [
                getDbItem('01 subject', 14, 'خالتو'),
                getDbItem('02 verbs', 7, 'تلبس', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 58, 'جاكيت'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 9, 'غرفة النوم'),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        7: {
            title: "ولدين يلعبوا طابة في الحديقة بليل",
            slots: [
                getDbItem('01 subject', 3, 'ولدين'),
                getDbItem('02 verbs', 30, 'يلعبوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 4, 'طابة'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 4, 'الحديقة'),
                getDbItem('06 time', 17, 'بليل')
            ]
        },
        8: {
            title: "بنتين ياكلوا فواكه في الصف الضهر",
            slots: [
                getDbItem('01 subject', 11, 'بنتين'),
                getDbItem('02 verbs', 1, 'ياكلوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 47, 'فواكه'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 18, 'الصف'),
                getDbItem('06 time', 1, 'الضهر')
            ]
        },
        9: {
            title: "اولاد يرسموا سمكة على حيط الصبح",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 55, 'يرسموا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('01 subject', 93, 'سمكة'),
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 128, 'حيط'),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        10: {
            title: "بنات يشموا وردات في الحديقة الصبح",
            slots: [
                getDbItem('01 subject', 9, 'بنات'),
                getDbItem('02 verbs', 11, 'يشموا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 134, 'وردات'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 4, 'الحديقة'),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        11: {
            title: "فيل يشرب مي جنب البركة الصبح",
            slots: [
                getDbItem('01 subject', 90, 'فيل'),
                getDbItem('02 verbs', 2, 'يشرب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 129, 'مي'),
                getDbItem('09 Prepositions', 8, 'جنب'),
                getDbItem('04 place', 61, 'البركة'),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        12: {
            title: "دكتور يعطي ابرة في العيادة الان",
            slots: [
                getDbItem('01 subject', 21, 'دكتور'),
                getDbItem('02 verbs', 48, 'يعطي', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 72, 'ابرة'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 22, 'العيادة'),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        13: {
            title: "قطة تسمع صوت على شجرة الصبح",
            slots: [
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('02 verbs', 9, 'تسمع', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 135, 'صوت'),
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 124, 'شجرة'),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        14: {
            title: "كلب يشوف شاحنة في المدينة الصبح",
            slots: [
                getDbItem('01 subject', 74, 'كلب'),
                getDbItem('02 verbs', 8, 'يشوف', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 125, 'شاحنة'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 17, 'المدينة'),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        15: {
            title: "عمو يبني بناية في المدينة الضهر",
            slots: [
                getDbItem('01 subject', 15, 'عمو'),
                getDbItem('02 verbs', 84, 'يبني', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 136, 'بناية'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 17, 'المدينة'),
                getDbItem('06 time', 1, 'الضهر')
            ]
        },
        16: {
            title: "شرطي يمسك قطة على شجرة بليل",
            slots: [
                getDbItem('01 subject', 24, 'شرطي'),
                getDbItem('02 verbs', 31, 'يمسك', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 124, 'شجرة'),
                getDbItem('06 time', 17, 'بليل')
            ]
        },
        17: {
            title: "شرطي يمسك حرامي في محل ثياب الان",
            slots: [
                getDbItem('01 subject', 24, 'شرطي'),
                getDbItem('02 verbs', 31, 'يمسك', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('01 subject', 59, 'حرامي'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 19, 'محل الملابس'),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        18: {
            title: "انسة يعطي طلاب في المدرسة الصبح",
            slots: [
                getDbItem('01 subject', 17, 'انسة'),
                getDbItem('02 verbs', 48, 'يعطي', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('01 subject', 20, 'طلاب'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 47, 'المدرسة'),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        19: {
            title: "عصفور ياكل دودة في عش الصبح",
            slots: [
                getDbItem('03 object', 13, 'عصفور'),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('01 subject', 86, 'دودة'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('03 object', 73, 'عش'),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        20: {
            title: "مصلح يصلح غسالة في المطبخ الضهر",
            slots: [
                getDbItem('01 subject', 67, 'مصلح'),
                getDbItem('02 verbs', 72, 'يصلح', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 137, 'غسالة'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 35, 'المطبخ'),
                getDbItem('06 time', 1, 'الضهر')
            ]
        },
        21: {
            title: "ملكة تشوف ملك في القلعة الصبح",
            slots: [
                getDbItem('01 subject', 49, 'ملكة'),
                getDbItem('02 verbs', 8, 'تشوف', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('01 subject', 48, 'ملك'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 14, 'القلعة'),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        22: {
            title: "تاتا تقرا كتاب في الحديقة الصبح",
            slots: [
                getDbItem('01 subject', 12, 'تاتا'),
                getDbItem('02 verbs', 58, 'تقرا', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 17, 'كتاب'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 4, 'الحديقة'),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        23: {
            title: "جدو ينزل درج في الصالون بليل",
            slots: [
                getDbItem('01 subject', 13, 'جدو'),
                getDbItem('02 verbs', 19, 'ينزل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 109, 'درج'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 60, 'الصالون'),
                getDbItem('06 time', 17, 'بليل')
            ]
        },
        24: {
            title: "ديناصور لبس طاقية في الكهف بليل",
            slots: [
                getDbItem('01 subject', 84, 'ديناصور'),
                getDbItem('02 verbs', 7, 'لبس', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 53, 'طاقية'),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 15, 'الكهف'),
                getDbItem('06 time', 17, 'بليل')
            ]
        }
        },
        2: { // Subgroup 2
        1: {
            title: "ولد ياكل و ولد يشرب الصبح",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 2, 'يشرب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        2: {
            title: "ولد يمشط و ولد يغسل بليل",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 3, 'يمشط', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 4, 'يغسل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('06 time', 17, 'بليل')
            ]
        },
        3: {
            title: "بنت تشرب و بنت تاكل الضهر",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 2, 'تشرب', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 1, 'تاكل', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('06 time', 1, 'الضهر')
            ]
        },
        4: {
            title: "بنت تسمع و بنت ترقص بليل",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 9, 'تسمع', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 65, 'ترقص', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('06 time', 17, 'بليل')
            ]
        },
        5: {
            title: "ولد يقص و بنت تكتب الان",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 59, 'يقص', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 57, 'تكتب', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        6: {
            title: "بنت تمشي و ولد يركض الان",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 16, 'تمشي', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 17, 'يركض', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        7: {
            title: "ماما تطبخ و بابا يكنس الصبح",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 26, 'تطبخ', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 44, 'يكنس', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        8: {
            title: "بابا يصلح و ماما تكنس الضهر",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 72, 'يصلح', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 44, 'تكنس', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('06 time', 1, 'الضهر')
            ]
        },
        9: {
            title: "ماما تخلط و بابا يحمل الان",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 23, 'تخلط', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 47, 'يحمل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        10: {
            title: "انسة تعلم و طالب يكتب الصبح",
            slots: [
                getDbItem('01 subject', 17, 'انسة'),
                getDbItem('02 verbs', 60, 'تعلم', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 18, 'طالب'),
                getDbItem('02 verbs', 57, 'يكتب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        11: {
            title: "نحلة تطير و نملة تمشي الضهر",
            slots: [
                getDbItem('03 object', 10, 'نحلة'),
                getDbItem('02 verbs', 100, 'تطير', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('03 object', 2, 'نملة'),
                getDbItem('02 verbs', 16, 'تمشي', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('06 time', 1, 'الضهر')
            ]
        },
        12: {
            title: "عصفور يطير و كلب يسبح الضهر",
            slots: [
                getDbItem('03 object', 13, 'عصفور'),
                getDbItem('02 verbs', 100, 'يطير', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 74, 'كلب'),
                getDbItem('02 verbs', 94, 'يسبح', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('06 time', 1, 'الضهر')
            ]
        },
        13: {
            title: "زرافة تاكل و ارنب ينط الصبح",
            slots: [
                getDbItem('01 subject', 111, 'زرافة'),
                getDbItem('02 verbs', 1, 'تاكل', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 100, 'ارنب'),
                getDbItem('02 verbs', 21, 'ينط', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        14: {
            title: "ذئب يعيط و اسد يبكي الخريف",
            slots: [
                getDbItem('01 subject', 114, 'ذئب'),
                getDbItem('02 verbs', 35, 'يعيط', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 96, 'اسد'),
                getDbItem('02 verbs', 34, 'يبكي', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('06 time', 12, 'الخريف')
            ]
        },
        15: {
            title: "فارة تركض و قطة تركض الان",
            slots: [
                getDbItem('01 subject', 77, 'فارة'),
                getDbItem('02 verbs', 17, 'تركض', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('02 verbs', 17, 'تركض', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        16: {
            title: "جدو يحفر و تاتا تقطف الان",
            slots: [
                getDbItem('01 subject', 13, 'جدو'),
                getDbItem('02 verbs', 70, 'يحفر', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 12, 'تاتا'),
                getDbItem('02 verbs', 83, 'تقطف', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        17: {
            title: "رسام يرسم و مومياء توقف الان",
            slots: [
                getDbItem('01 subject', 53, 'رسام'),
                getDbItem('02 verbs', 55, 'يرسم', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 105, 'مومياء'),
                getDbItem('02 verbs', 13, 'توقف', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        18: {
            title: "دودة ترقص و عصفور يغني الصبح",
            slots: [
                getDbItem('01 subject', 86, 'دودة'),
                getDbItem('02 verbs', 65, 'ترقص', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('03 object', 13, 'عصفور'),
                getDbItem('02 verbs', 37, 'يغني', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        19: {
            title: "ولد يكتب و بابا يحكي بليل",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 57, 'يكتب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 29, 'يحكي', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('06 time', 17, 'بليل')
            ]
        },
        20: {
            title: "ولد يطعمي و قطة تبكي الان",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 63, 'يطعمي', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('02 verbs', 34, 'تبكي', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        21: {
            title: "ولد يشوط و حارس ينط الان",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 52, 'يشوط', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 51, 'حارس'),
                getDbItem('02 verbs', 21, 'ينط', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        22: {
            title: "طالب يسأل و انسة تحكي الان",
            slots: [
                getDbItem('01 subject', 18, 'طالب'),
                getDbItem('02 verbs', 42, 'يسأل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 17, 'انسة'),
                getDbItem('02 verbs', 29, 'تحكي', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        23: {
            title: "بيبي يزحف و ماما تضحك الصبح",
            slots: [
                getDbItem('01 subject', 7, 'بيبي'),
                getDbItem('02 verbs', 18, 'يزحف', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 39, 'تضحك', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        24: {
            title: "بيبي يعيط و بابا يبكي بليل",
            slots: [
                getDbItem('01 subject', 7, 'بيبي'),
                getDbItem('02 verbs', 35, 'يعيط', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 34, 'يبكي', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('06 time', 17, 'بليل')
                ]
            }
        },
        3: { // Subgroup 3
        1: {
            title: "ولد و بنت يلعبوا في الحديقة",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 30, 'يلعبوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 4, 'الحديقة')
            ]
        },
        2: {
            title: "بنت و ولد ياكلوا في المطبخ",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 1, 'ياكلوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 35, 'المطبخ')
            ]
        },
        3: {
            title: "بابا و ماما يحكوا في الصالون",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 29, 'يحكوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 60, 'الصالون')
            ]
        },
        4: {
            title: "كلب و قطة ينطوا في الشارع",
            slots: [
                getDbItem('01 subject', 74, 'كلب'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('02 verbs', 21, 'ينطوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 50, 'الشارع')
            ]
        },
        5: {
            title: "قطة و عصفور يغنوا على شجرة",
            slots: [
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('03 object', 13, 'عصفور'),
                getDbItem('02 verbs', 37, 'يغنوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 124, 'شجرة')
            ]
        },
        6: {
            title: "شرطي و شرطية يمشوا في المدينة",
            slots: [
                getDbItem('01 subject', 24, 'شرطي'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 25, 'شرطية'),
                getDbItem('02 verbs', 16, 'يمشوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 17, 'المدينة')
            ]
        },
        7: {
            title: "انسة و طالب يحكوا في الصف",
            slots: [
                getDbItem('01 subject', 17, 'انسة'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 18, 'طالب'),
                getDbItem('02 verbs', 29, 'يحكوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 18, 'الصف')
            ]
        },
        8: {
            title: "ساحر و ساحرة يطيروا بين الغيوم",
            slots: [
                getDbItem('01 subject', 68, 'ساحر'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 62, 'ساحرة'),
                getDbItem('02 verbs', 100, 'يطيروا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('09 Prepositions', 2, 'بين'),
                getDbItem('03 object', 146, 'الغيوم')
            ]
        },
        9: {
            title: "نحلة و نملة يوقفوا على وردات",
            slots: [
                getDbItem('03 object', 10, 'نحلة'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('03 object', 2, 'نملة'),
                getDbItem('02 verbs', 13, 'يوقفوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 134, 'وردات')
            ]
        },
        10: {
            title: "فيل و اسد يركضوا في الغابة",
            slots: [
                getDbItem('01 subject', 90, 'فيل'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 96, 'اسد'),
                getDbItem('02 verbs', 17, 'يركضوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 34, 'الغابة')
            ]
        },
        11: {
            title: "اولاد و بنات يشربوا في الصالون",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 9, 'بنات'),
                getDbItem('02 verbs', 2, 'يشربوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 60, 'الصالون')
            ]
        },
        12: {
            title: "بنات و اولاد يناموا في غرفة نوم",
            slots: [
                getDbItem('01 subject', 9, 'بنات'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 6, 'يناموا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 9, 'غرفة النوم')
            ]
        },
        13: {
            title: "دب و نحلة يضحكوا في الحديقة",
            slots: [
                getDbItem('03 object', 8, 'دب'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('03 object', 10, 'نحلة'),
                getDbItem('02 verbs', 39, 'يضحكوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 4, 'الحديقة')
            ]
        },
        14: {
            title: "اسد و زرافة يمشوا في القرية",
            slots: [
                getDbItem('01 subject', 96, 'اسد'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 111, 'زرافة'),
                getDbItem('02 verbs', 16, 'يمشوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 54, 'القرية')
            ]
        },
        15: {
            title: "فارة و قطة يركضوا في المطبخ",
            slots: [
                getDbItem('01 subject', 77, 'فارة'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('02 verbs', 17, 'يركضوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 35, 'المطبخ')
            ]
        },
        16: {
            title: "سيارة و باص يمشوا في الشارع",
            slots: [
                getDbItem('03 object', 25, 'سيارة'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('03 object', 23, 'باص'),
                getDbItem('02 verbs', 16, 'يمشوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 50, 'الشارع')
            ]
        },
        17: {
            title: "طيارة و عصفور يطيروا في السما",
            slots: [
                getDbItem('03 object', 84, 'طيارة'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('03 object', 13, 'عصفور'),
                getDbItem('02 verbs', 100, 'يطيروا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 24, 'السما')
            ]
        },
        18: {
            title: "سفينة و قارب يمشوا في البحر",
            slots: [
                getDbItem('03 object', 16, 'سفينة'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('03 object', 148, 'قارب'),
                getDbItem('02 verbs', 16, 'يمشوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 49, 'البحر')
            ]
        },
        19: {
            title: "طباخ و ولد يطبخوا في المطبخ",
            slots: [
                getDbItem('01 subject', 56, 'طباخ'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 26, 'يطبخوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 35, 'المطبخ')
            ]
        },
        20: {
            title: "دكتور و دكتورة يحكوا في المستشفى",
            slots: [
                getDbItem('01 subject', 21, 'دكتور'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 22, 'دكتورة'),
                getDbItem('02 verbs', 29, 'يحكوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 32, 'المستشفى')
            ]
        },
        21: {
            title: "نملة و نحلة يكتبوا في الصف",
            slots: [
                getDbItem('03 object', 2, 'نملة'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('03 object', 10, 'نحلة'),
                getDbItem('02 verbs', 57, 'يكتبوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 18, 'الصف')
            ]
        },
        22: {
            title: "شبح و مومياء يدرسوا جنب النهر",
            slots: [
                getDbItem('01 subject', 109, 'شبح'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 105, 'مومياء'),
                getDbItem('02 verbs', 77, 'يدرسوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('09 Prepositions', 8, 'جنب'),
                getDbItem('04 place', 44, 'النهر')
            ]
        },
        23: {
            title: "ديناصور و فيل يطلعوا على الجبل",
            slots: [
                getDbItem('01 subject', 84, 'ديناصور'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 90, 'فيل'),
                getDbItem('02 verbs', 20, 'يطلعوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('04 place', 37, 'الجبل')
            ]
        },
        24: {
            title: "ماما و ولد يشتروا من المكتبة",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 46, 'يشتروا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 7, 'من'),
                getDbItem('04 place', 10, 'المكتبة')
                ]
            }
        },
        4: { // Subgroup 4
        1: {
            title: "ولد بدو ياكل تفاحة حمرا الصبح",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 3, 'تفاحة'),
                getDbItem('10 colors', 10, 'حمرا'),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        2: {
            title: "بنت بدها تشرب عصير برتقال الان",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 2, 'تشرب', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 59, 'عصير'),
                getDbItem('03 object', 75, 'برتقال'),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        3: {
            title: "بابا بدو يصلح سيارة خضرا بكرا",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 72, 'يصلح', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 25, 'سيارة'),
                getDbItem('10 colors', 6, 'خضرا'),
                getDbItem('06 time', 25, 'بكرا')
            ]
        },
        4: {
            title: "ماما بدها تطبخ رز ابيض بكرا",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 26, 'تطبخ', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 89, 'رز'),
                getDbItem('10 colors', 11, 'ابيض'),
                getDbItem('06 time', 25, 'بكرا')
            ]
        },
        5: {
            title: "دودات بدهم ياكلوا تفاحة كبيرة الان",
            slots: [
                getDbItem('01 subject', 88, 'دودات'),
                getDbItem('02 verbs', 15, 'بدهم', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('02 verbs', 1, 'ياكلوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 3, 'تفاحة'),
                getDbItem('05 adjectives', 5, 'كبيرة'),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        6: {
            title: "رسام بدو يرسم وردة صفرا بكرا",
            slots: [
                getDbItem('01 subject', 53, 'رسام'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 55, 'يرسم', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 43, 'وردة'),
                getDbItem('10 colors', 12, 'صفرا'),
                getDbItem('06 time', 25, 'بكرا')
            ]
        },
        7: {
            title: "ساحرة بدها تطلع البرج طويل بليل",
            slots: [
                getDbItem('01 subject', 62, 'ساحرة'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 20, 'تطلع', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('04 place', 53, 'البرج'),
                getDbItem('05 adjectives', 32, 'طويل'),
                getDbItem('06 time', 17, 'بليل')
            ]
        },
        8: {
            title: "دكتور بدو يسكر باب ازرق الان",
            slots: [
                getDbItem('01 subject', 21, 'دكتور'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 51, 'يسكر', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 36, 'باب'),
                getDbItem('10 colors', 3, 'ازرق'),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        9: {
            title: "ملكة بدها تمشط شعر احمر بكرا",
            slots: [
                getDbItem('01 subject', 49, 'ملكة'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 3, 'تمشط', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 49, 'شعر'),
                getDbItem('10 colors', 10, 'احمر'),
                getDbItem('06 time', 25, 'بكرا')
            ]
        },
        10: {
            title: "ارنب بدو ياكل جزرة برتقالية الصبح",
            slots: [
                getDbItem('01 subject', 100, 'ارنب'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 27, 'جزرة'),
                getDbItem('10 colors', 7, 'برتقالية'),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        11: {
            title: "اولاد بدهم يلبسوا جاكيت صفرا الشتاء",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 15, 'بدهم', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('02 verbs', 7, 'يلبسوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 58, 'جاكيت'),
                getDbItem('10 colors', 12, 'صفرا'),
                getDbItem('06 time', 29, 'الشتاء')
            ]
        },
        12: {
            title: "بنات بدهم يناموا تخت كبير الان",
            slots: [
                getDbItem('01 subject', 9, 'بنات'),
                getDbItem('02 verbs', 15, 'بدهم', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('02 verbs', 6, 'يناموا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 9, 'تخت'),
                getDbItem('05 adjectives', 5, 'كبير'),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        13: {
            title: "دب بدو ياكل عسل اصفر الان",
            slots: [
                getDbItem('03 object', 8, 'دب'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 54, 'عسل'),
                getDbItem('10 colors', 12, 'اصفر'),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        14: {
            title: "زرافة بدها تشرب عصير برتقال  الصبح",
            slots: [
                getDbItem('01 subject', 111, 'زرافة'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 2, 'تشرب', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 59, 'عصير'),
                getDbItem('03 object', 75, 'برتقال'),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        15: {
            title: "فارة بدها تاكل جبنة صفرا بليل",
            slots: [
                getDbItem('01 subject', 77, 'فارة'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 1, 'تاكل', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 30, 'جبنة'),
                getDbItem('10 colors', 12, 'صفرا'),
                getDbItem('06 time', 17, 'بليل')
            ]
        },
        16: {
            title: "شرطي بدو يمسك حرامي مصاري بليل",
            slots: [
                getDbItem('01 subject', 24, 'شرطي'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 31, 'يمسك', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('01 subject', 59, 'حرامي'),
                getDbItem('03 object', 138, 'مصاري'),
                getDbItem('06 time', 17, 'بليل')
            ]
        },
        17: {
            title: "قطة بدها تطلع بيت شجرة الصبح",
            slots: [
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 20, 'تطلع', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 94, 'بيت'),
                getDbItem('03 object', 124, 'شجرة'),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        18: {
            title: "كلب بدو ينزل بيت شجرة بليل",
            slots: [
                getDbItem('01 subject', 74, 'كلب'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 19, 'ينزل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 94, 'بيت'),
                getDbItem('03 object', 124, 'شجرة'),
                getDbItem('06 time', 17, 'بليل')
            ]
        },
        19: {
            title: "طباخ بدو يخبز قالب كاتو  بليل",
            slots: [
                getDbItem('01 subject', 56, 'طباخ'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 25, 'يخبز', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 139, 'قالب'),
                getDbItem('03 object', 14, 'كاتو'),
                getDbItem('06 time', 17, 'بليل')
            ]
        },
        20: {
            title: "دكتور بدو يعطي ابرة كبيرة الان",
            slots: [
                getDbItem('01 subject', 21, 'دكتور'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 48, 'يعطي', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 72, 'ابرة'),
                getDbItem('05 adjectives', 5, 'كبيرة'),
                getDbItem('06 time', 19, 'الان')
            ]
        },
        21: {
            title: "نملة بدها تحمل بسكوتة كبيرة الصبح",
            slots: [
                getDbItem('03 object', 2, 'نملة'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 47, 'تحمل', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 140, 'بسكوتة'),
                getDbItem('05 adjectives', 5, 'كبيرة'),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        22: {
            title: "شبح بدو ياكل قالب كاتو بليل",
            slots: [
                getDbItem('01 subject', 109, 'شبح'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 139, 'قالب'),
                getDbItem('03 object', 14, 'كاتو'),
                getDbItem('06 time', 17, 'بليل')
            ]
        },
        23: {
            title: "ديناصور بدو يطلع الجبل كبير الصبح",
            slots: [
                getDbItem('01 subject', 84, 'ديناصور'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 20, 'يطلع', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('04 place', 37, 'الجبل'),
                getDbItem('05 adjectives', 5, 'كبير'),
                getDbItem('06 time', 15, 'الصبح')
            ]
        },
        24: {
            title: "ولد بدو يشتري قلم ازرق الان",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 46, 'يشتري', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 80, 'قلم'),
                getDbItem('10 colors', 3, 'ازرق'),
                getDbItem('06 time', 19, 'الان')
                ]
            }
        },
        5: { // Subgroup 5
        1: {
            title: "ولد ياكل تفاحة ولد أكل تفاحة",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 3, 'تفاحة'),
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 1, 'أكل', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 3, 'تفاحة')
            ]
        },
        2: {
            title: "بنت تاكل تفاحة بنت أكلت تفاحة",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 1, 'تاكل', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 3, 'تفاحة'),
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 1, 'أكلت', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('03 object', 3, 'تفاحة')
            ]
        },
        3: {
            title: "ولد يشرب مي ولد شرب مي",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 2, 'يشرب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 129, 'مي'),
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 2, 'شرب', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 129, 'مي')
            ]
        },
        4: {
            title: "بنت تشرب حليب بنت شربت حليب",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 2, 'تشرب', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 67, 'حليب'),
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 2, 'شربت', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('03 object', 67, 'حليب')
            ]
        },
        5: {
            title: "بابا يغسل سيارة بابا غسل سيارة",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 4, 'يغسل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 25, 'سيارة'),
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 4, 'غسل', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 25, 'سيارة')
            ]
        },
        6: {
            title: "ماما تغسل خضار ماما غسلت خضار",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 4, 'تغسل', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 127, 'خضار'),
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 4, 'غسلت', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('03 object', 127, 'خضار')
            ]
        },
        7: {
            title: "بابا يعمل دوش بابا عمل دوش",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 66, 'يعمل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 160, 'دوش'),
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 66, 'عمل', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 160, 'دوش')
            ]
        },
        8: {
            title: "ماما تعمل دوش ماما عملت دوش",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 66, 'تعمل', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 160, 'دوش'),
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 66, 'عملت', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('03 object', 160, 'دوش')
            ]
        },
        9: {
            title: "قطة تنام تخت قطة نامت تخت",
            slots: [
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('02 verbs', 6, 'تنام', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 9, 'تخت'),
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('02 verbs', 6, 'نامت', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('03 object', 9, 'تخت')
            ]
        },
        10: {
            title: "كلب ينام على الارض كلب نام على الارض",
            slots: [
                getDbItem('01 subject', 74, 'كلب'),
                getDbItem('02 verbs', 6, 'ينام', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('04 place', 62, 'الارض'),
                getDbItem('01 subject', 74, 'كلب'),
                getDbItem('02 verbs', 6, 'نام', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('04 place', 62, 'الارض')
            ]
        },
        11: {
            title: "اولاد يلعبوا طابة اولاد لعبوا طابة",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 30, 'يلعبوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 4, 'طابة'),
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 30, 'لعبوا', { verbTense: 'past', conjugation: 'they' }),
                getDbItem('03 object', 4, 'طابة')
            ]
        },
        12: {
            title: "بنات يلعبوا العاب بنات لعبوا العاب",
            slots: [
                getDbItem('01 subject', 9, 'بنات'),
                getDbItem('02 verbs', 30, 'يلعبوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('03 object', 122, 'العاب'),
                getDbItem('01 subject', 9, 'بنات'),
                getDbItem('02 verbs', 30, 'لعبوا', { verbTense: 'past', conjugation: 'they' }),
                getDbItem('03 object', 122, 'العاب')
            ]
        },
        13: {
            title: "فارة تطلع درج فارة طلعت درج",
            slots: [
                getDbItem('01 subject', 77, 'فارة'),
                getDbItem('02 verbs', 20, 'تطلع', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 109, 'درج'),
                getDbItem('01 subject', 77, 'فارة'),
                getDbItem('02 verbs', 20, 'طلعت', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('03 object', 109, 'درج')
            ]
        },
        14: {
            title: "مصلح يصلح موبايل مصلح صلح موبايل",
            slots: [
                getDbItem('01 subject', 67, 'مصلح'),
                getDbItem('02 verbs', 72, 'يصلح', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 82, 'موبايل'),
                getDbItem('01 subject', 67, 'مصلح'),
                getDbItem('02 verbs', 72, 'صلح', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 82, 'موبايل')
            ]
        },
        15: {
            title: "ولد يفتح براد ولد فتح براد",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 50, 'يفتح', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 45, 'براد'),
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 50, 'فتح', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 45, 'براد')
            ]
        },
        16: {
            title: "بنت تساعد تاتا بنت ساعدت تاتا",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 75, 'تساعد', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('01 subject', 12, 'تاتا'),
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 75, 'ساعدت', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('01 subject', 12, 'تاتا')
            ]
        },
        17: {
            title: "بابا يقطف برتقال بابا قطف برتقال",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 83, 'يقطف', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 75, 'برتقال'),
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 83, 'قطف', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 75, 'برتقال')
            ]
        },
        18: {
            title: "ماما تضب حقيبة ماما ضبت حقيبة",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 81, 'تضب', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 142, 'حقيبة'),
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 81, 'ضبت', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('03 object', 142, 'حقيبة')
            ]
        },
        19: {
            title: "عمو يشوف تلفزيون عمو شاف تلفزيون",
            slots: [
                getDbItem('01 subject', 15, 'عمو'),
                getDbItem('02 verbs', 8, 'يشوف', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 126, 'تلفزيون'),
                getDbItem('01 subject', 15, 'عمو'),
                getDbItem('02 verbs', 8, 'شاف', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 126, 'تلفزيون')
            ]
        },
        20: {
            title: "ولد يكتب قلم ولد كتب قلم",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 57, 'يكتب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 80, 'قلم'),
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 57, 'كتب', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 80, 'قلم')
            ]
        },
        21: {
            title: "بنت ترسم قطة بنت رسمت قطة",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 55, 'ترسم', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 55, 'رسمت', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('01 subject', 71, 'قطة')
            ]
        },
        22: {
            title: "تاتا تلمس قطة تاتا لمست قطة",
            slots: [
                getDbItem('01 subject', 12, 'تاتا'),
                getDbItem('02 verbs', 10, 'تلمس', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('01 subject', 12, 'تاتا'),
                getDbItem('02 verbs', 10, 'لمست', { verbTense: 'past', conjugation: 'she' }),
                getDbItem('01 subject', 71, 'قطة')
            ]
        },
        23: {
            title: "بابا يحكي موبايل بابا حكى موبايل",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 29, 'يحكي', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 82, 'موبايل'),
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 29, 'حكى', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 82, 'موبايل')
            ]
        },
        24: {
            title: "ولد ينفخ بالون ولد نفخ بالون",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 33, 'ينفخ', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 143, 'بالون'),
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 33, 'نفخ', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('03 object', 143, 'بالون')
                ]
            }
        },
        6: { // Subgroup 6
        1: {
            title: "ولد ياكل تفاحة ولد بدو ياكل",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 3, 'تفاحة'),
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        2: {
            title: "ولد يشرب مي ولد بدو يشرب",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 2, 'يشرب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 129, 'مي'),
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 2, 'يشرب', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        3: {
            title: "بنت تاكل موزة بنت بدها تاكل",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 1, 'تاكل', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 5, 'موزة'),
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 1, 'تاكل', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        4: {
            title: "بنت تشرب حليب بنت بدها تشرب",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 2, 'تشرب', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 67, 'حليب'),
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 2, 'تشرب', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        5: {
            title: "بابا يغسل ايدين بابا بدو يغسل",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 4, 'يغسل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 145, 'ايدين'),
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 4, 'يغسل', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        6: {
            title: "ماما تغسل فواكه ماما بدها تغسل",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 4, 'تغسل', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 47, 'فواكه'),
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 4, 'تغسل', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        7: {
            title: "بابا يمشط شعر بابا بدو يمشط",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 3, 'يمشط', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 49, 'شعر'),
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 3, 'يمشط', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        8: {
            title: "ماما تمشط شعر ماما بدها تمشط",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 3, 'تمشط', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 49, 'شعر'),
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 3, 'تمشط', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        9: {
            title: "ولد يتحمم شامبو ولد بدو يتحمم",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 5, 'يتحمم', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 96, 'شامبو'),
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 5, 'يتحمم', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        10: {
            title: "بنت تتحمم شامبو بنت بدها تتحمم",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 5, 'تتحمم', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 96, 'شامبو'),
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 5, 'تتحمم', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        11: {
            title: "ولد يلعب طابة ولد بدو يلعب طابة",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 30, 'يلعب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 4, 'طابة'),
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 30, 'يلعب', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        12: {
            title: "بنت تلعب طابة بنت بدها تلعب طابة",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 30, 'تلعب', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 4, 'طابة'),
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 30, 'تلعب', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        13: {
            title: "ولد ينام تخت ولد بدو ينام",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 6, 'ينام', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 9, 'تخت'),
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 6, 'ينام', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        14: {
            title: "بنت تنام تخت بنت بدها تنام",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 6, 'تنام', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 9, 'تخت'),
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 6, 'تنام', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        15: {
            title: "بابا يطبخ اكل بابا بدو يطبخ",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 26, 'يطبخ', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 object', 162, 'اكل'),
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 26, 'يطبخ', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        16: {
            title: "ماما تطبخ اكل ماما بدها تطبخ",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 26, 'تطبخ', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 object', 162, 'اكل'),
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 26, 'تطبخ', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        17: {
            title: "ولد يسوق سيارة ولد بدو يسوق",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 61, 'يسوق', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 25, 'سيارة'),
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 61, 'يسوق', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        18: {
            title: "بنت تسوق بسكليت بنت بدها تسوق",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 61, 'تسوق', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('03 object', 11, 'بسكليت'),
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 61, 'تسوق', { verbTense: 'present', conjugation: 'she' })
            ]
        },
        19: {
            title: "عمو يشوف تلفزيون عمو بدو يشوف",
            slots: [
                getDbItem('01 subject', 15, 'عمو'),
                getDbItem('02 verbs', 8, 'يشوف', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 126, 'تلفزيون'),
                getDbItem('01 subject', 15, 'عمو'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 8, 'يشوف', { verbTense: 'present', conjugation: 'he' })
            ]
        },
        20: {
            title: "ولد بدو يكتب ولد يكتب قلم",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 57, 'يكتب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 57, 'يكتب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 80, 'قلم')
            ]
        },
        21: {
            title: "بنت بدها ترسم بنت ترسم قطة",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 55, 'ترسم', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 55, 'ترسم', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('01 subject', 71, 'قطة')
            ]
        },
        22: {
            title: "تاتا بدها تلمس تاتا تلمس قطة",
            slots: [
                getDbItem('01 subject', 12, 'تاتا'),
                getDbItem('02 verbs', 15, 'بدها', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('02 verbs', 10, 'تلمس', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('01 subject', 12, 'تاتا'),
                getDbItem('02 verbs', 10, 'تلمس', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('01 subject', 71, 'قطة')
            ]
        },
        23: {
            title: "بابا بدو يحكي بابا يحكي موبايل",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 29, 'يحكي', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 29, 'يحكي', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 82, 'موبايل')
            ]
        },
        24: {
            title: "ولد بدو ينفخ ولد ينفخ بالون",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 15, 'بدو', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('02 verbs', 33, 'ينفخ', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 33, 'ينفخ', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('03 object', 143, 'بالون')
                ]
            }
        },
        7: { // Subgroup 7
        1: {
            title: "ولد ياكل و يشرب في المطبخ",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 2, 'يشرب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 35, 'المطبخ')
            ]
        },
        2: {
            title: "بنت تاكل و تشرب في الصالون",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 1, 'تاكل', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 2, 'تشرب', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 60, 'الصالون')
            ]
        },
        3: {
            title: "اولاد ياكلوا و يشربوا في بيت",
            slots: [
                getDbItem('01 subject', 4, 'اولاد'),
                getDbItem('02 verbs', 1, 'ياكلوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 2, 'يشربوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('03 object', 94, 'بيت')
            ]
        },
        4: {
            title: "بنات ياكلوا و يشربوا في بيت",
            slots: [
                getDbItem('01 subject', 9, 'بنات'),
                getDbItem('02 verbs', 1, 'ياكلوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 2, 'يشربوا', { verbTense: 'present', conjugation: 'they' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('03 object', 94, 'بيت')
            ]
        },
        5: {
            title: "بابا يلعب و يشوط في الحديقة",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 30, 'يلعب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 52, 'يشوط', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 4, 'الحديقة')
            ]
        },
        6: {
            title: "ماما تعصر و تقطع في المطبخ",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 92, 'تعصر', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 24, 'تقطع', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 35, 'المطبخ')
            ]
        },
        7: {
            title: "بابا ينام و يشخر في تخت",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 6, 'ينام', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 90, 'يشخر', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('03 object', 9, 'تخت')
            ]
        },
        8: {
            title: "ماما تغني و تضحك في الصالون",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 37, 'تغني', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 39, 'تضحك', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 60, 'الصالون')
            ]
        },
        9: {
            title: "ولد يصفر و يمشي في الشارع",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 38, 'يصفر', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 16, 'يمشي', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 50, 'الشارع')
            ]
        },
        10: {
            title: "بنت تنط و تضحك في الحديقة",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('02 verbs', 21, 'تنط', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 39, 'تضحك', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 4, 'الحديقة')
            ]
        },
        11: {
            title: "بابا يقعد و يسمع في العيادة",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('02 verbs', 14, 'يقعد', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 9, 'يسمع', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 22, 'العيادة')
            ]
        },
        12: {
            title: "ماما توقف و تعيط في بيت",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('02 verbs', 13, 'توقف', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 35, 'تعيط', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('03 object', 94, 'بيت')
            ]
        },
        13: {
            title: "زرافة تمشي و تضحك في الغابة",
            slots: [
                getDbItem('01 subject', 111, 'زرافة'),
                getDbItem('02 verbs', 16, 'تمشي', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 39, 'تضحك', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 34, 'الغابة')
            ]
        },
        14: {
            title: "ذئب يعيط و يبكي جنب الكهف",
            slots: [
                getDbItem('01 subject', 114, 'ذئب'),
                getDbItem('02 verbs', 35, 'يعيط', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 34, 'يبكي', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('09 Prepositions', 8, 'جنب'),
                getDbItem('04 place', 15, 'الكهف')
            ]
        },
        15: {
            title: "فارة تشم و تسرق في المطبخ",
            slots: [
                getDbItem('01 subject', 77, 'فارة'),
                getDbItem('02 verbs', 11, 'تشم', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 93, 'تسرق', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 35, 'المطبخ')
            ]
        },
        16: {
            title: "جدو قاعد و يقرا في الصالون",
            slots: [
                getDbItem('01 subject', 13, 'جدو'),
                getDbItem('05 adjectives', 33, 'قاعد'),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 58, 'يقرا', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 60, 'الصالون')
            ]
        },
        17: {
            title: "رسام يرسم و يلون في الشارع",
            slots: [
                getDbItem('01 subject', 53, 'رسام'),
                getDbItem('02 verbs', 55, 'يرسم', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 54, 'يلون', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 50, 'الشارع')
            ]
        },
        18: {
            title: "دودة ترقص و تغني على الوردة",
            slots: [
                getDbItem('01 subject', 86, 'دودة'),
                getDbItem('02 verbs', 65, 'ترقص', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 37, 'تغني', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('04 place', 27, 'الوردة')
            ]
        },
        19: {
            title: "ولد قعد و يكتب في الغرفة",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 14, 'قعد', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 57, 'يكتب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 46, 'الغرفة')
            ]
        },
        20: {
            title: "ولد فتح و يسلم  جنب باب",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 50, 'فتح', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 36, 'يسلم', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('09 Prepositions', 8, 'جنب'),
                getDbItem('03 object', 36, 'باب')
            ]
        },
        21: {
            title: "ولد يركض و يشوط في الملعب",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('02 verbs', 17, 'يركض', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 52, 'يشوط', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 52, 'الملعب')
            ]
        },
        22: {
            title: "طالب وقف و يسأل في الصف",
            slots: [
                getDbItem('01 subject', 18, 'طالب'),
                getDbItem('02 verbs', 13, 'وقف', { verbTense: 'past', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 42, 'يسأل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 18, 'الصف')
            ]
        },
        23: {
            title: "بيبي يزحف و يضحك في الصالون",
            slots: [
                getDbItem('01 subject', 7, 'بيبي'),
                getDbItem('02 verbs', 18, 'يزحف', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 39, 'يضحك', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 60, 'الصالون')
            ]
        },
        24: {
            title: "بيبي يعيط و يبكي في غرفة نوم",
            slots: [
                getDbItem('01 subject', 7, 'بيبي'),
                getDbItem('02 verbs', 35, 'يعيط', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 3, 'و'),
                getDbItem('02 verbs', 34, 'يبكي', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 9, 'غرفة النوم')
                ]
            }
        },
        8: { // Subgroup 8
        1: {
            title: "ولد صغير حزين يقعد على كرسي",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('05 adjectives', 6, 'صغير'),
                getDbItem('05 adjectives', 43, 'حزين'),
                getDbItem('02 verbs', 14, 'يقعد', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 28, 'كرسي')
            ]
        },
        2: {
            title: "ولد نظيف سعيد يوقف على تخت",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('05 adjectives', 7, 'نظيف'),
                getDbItem('05 adjectives', 44, 'سعيد'),
                getDbItem('02 verbs', 13, 'يوقف', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 9, 'تخت')
            ]
        },
        3: {
            title: "بنت كبيرة حزينة توقف على كرسي",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('05 adjectives', 5, 'كبيرة'),
                getDbItem('05 adjectives', 43, 'حزينة'),
                getDbItem('02 verbs', 13, 'توقف', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 28, 'كرسي')
            ]
        },
        4: {
            title: "بنت وسخة معصبة تقعد على طاولة",
            slots: [
                getDbItem('01 subject', 2, 'بنت'),
                getDbItem('05 adjectives', 8, 'وسخة'),
                getDbItem('05 adjectives', 45, 'معصبة'),
                getDbItem('02 verbs', 14, 'تقعد', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 114, 'طاولة')
            ]
        },
        5: {
            title: "نحلة اصفر اسود تطير في الحديقة",
            slots: [
                getDbItem('03 object', 10, 'نحلة'),
                getDbItem('10 colors', 12, 'اصفر'),
                getDbItem('10 colors', 2, 'اسود'),
                getDbItem('02 verbs', 100, 'تطير', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 4, 'الحديقة')
            ]
        },
        6: {
            title: "ارنب ابيض صغير ينط في الحديقة",
            slots: [
                getDbItem('01 subject', 100, 'ارنب'),
                getDbItem('10 colors', 11, 'ابيض'),
                getDbItem('05 adjectives', 6, 'صغير'),
                getDbItem('02 verbs', 21, 'ينط', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 4, 'الحديقة')
            ]
        },
        7: {
            title: "فيل اصفر كبير يلعب في البركة",
            slots: [
                getDbItem('01 subject', 90, 'فيل'),
                getDbItem('10 colors', 12, 'اصفر'),
                getDbItem('05 adjectives', 5, 'كبير'),
                getDbItem('02 verbs', 30, 'يلعب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 61, 'البركة')
            ]
        },
        8: {
            title: "زرافة صفرا طويلة تاكل في الغابة",
            slots: [
                getDbItem('01 subject', 111, 'زرافة'),
                getDbItem('10 colors', 12, 'صفرا'),
                getDbItem('05 adjectives', 32, 'طويلة'),
                getDbItem('02 verbs', 1, 'تاكل', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 34, 'الغابة')
            ]
        },
        9: {
            title: "بقرة اسود ابيض تاكل في بيت",
            slots: [
                getDbItem('01 subject', 97, 'بقرة'),
                getDbItem('10 colors', 2, 'اسود'),
                getDbItem('10 colors', 11, 'ابيض'),
                getDbItem('02 verbs', 1, 'تاكل', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('03 object', 94, 'بيت')
            ]
        },
        10: {
            title: "اسد كبير معصب يعيط في الغابة",
            slots: [
                getDbItem('01 subject', 96, 'اسد'),
                getDbItem('05 adjectives', 5, 'كبير'),
                getDbItem('05 adjectives', 45, 'معصب'),
                getDbItem('02 verbs', 35, 'يعيط', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 34, 'الغابة')
            ]
        },
        11: {
            title: "ماما حلوة مبسوطة تطبخ في المطبخ",
            slots: [
                getDbItem('01 subject', 6, 'ماما'),
                getDbItem('05 adjectives', 39, 'حلوة'),
                getDbItem('05 adjectives', 44, 'سعيدة'),
                getDbItem('02 verbs', 26, 'تطبخ', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 35, 'المطبخ')
            ]
        },
        12: {
            title: "بابا معصب وسخ يصلح في الصالون",
            slots: [
                getDbItem('01 subject', 5, 'بابا'),
                getDbItem('05 adjectives', 45, 'معصب'),
                getDbItem('05 adjectives', 8, 'وسخ'),
                getDbItem('02 verbs', 72, 'يصلح', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 60, 'الصالون')
            ]
        },
        13: {
            title: "زرافة صفرا طويلة تاكل في الغابة",
            slots: [
                getDbItem('01 subject', 111, 'زرافة'),
                getDbItem('10 colors', 12, 'صفرا'),
                getDbItem('05 adjectives', 32, 'طويلة'),
                getDbItem('02 verbs', 1, 'تاكل', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 34, 'الغابة')
            ]
        },
        14: {
            title: "قطة ناعمة حلوة تمشي  في الشارع",
            slots: [
                getDbItem('01 subject', 71, 'قطة'),
                getDbItem('05 adjectives', 20, 'ناعمة'),
                getDbItem('05 adjectives', 39, 'حلوة'),
                getDbItem('02 verbs', 16, 'تمشي', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 50, 'الشارع')
            ]
        },
        15: {
            title: "فارة سودا صغيرة تبكي في المطبخ",
            slots: [
                getDbItem('01 subject', 77, 'فارة'),
                getDbItem('10 colors', 2, 'سودا'),
                getDbItem('05 adjectives', 6, 'صغيرة'),
                getDbItem('02 verbs', 34, 'تبكي', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 35, 'المطبخ')
            ]
        },
        16: {
            title: "جدو احمر معصب يحفر في الحديقة",
            slots: [
                getDbItem('01 subject', 13, 'جدو'),
                getDbItem('10 colors', 10, 'احمر'),
                getDbItem('05 adjectives', 45, 'معصب'),
                getDbItem('02 verbs', 70, 'يحفر', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 4, 'الحديقة')
            ]
        },
        17: {
            title: "رسام وسخ طويل يرسم في الشارع",
            slots: [
                getDbItem('01 subject', 53, 'رسام'),
                getDbItem('05 adjectives', 8, 'وسخ'),
                getDbItem('05 adjectives', 32, 'طويل'),
                getDbItem('02 verbs', 55, 'يرسم', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 50, 'الشارع')
            ]
        },
        18: {
            title: "دودة رفيعة طويلة تمشي على تفاحة",
            slots: [
                getDbItem('01 subject', 86, 'دودة'),
                getDbItem('05 adjectives', 35, 'رفيعة'),
                getDbItem('05 adjectives', 32, 'طويلة'),
                getDbItem('02 verbs', 16, 'تمشي', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('09 Prepositions', 9, 'على'),
                getDbItem('03 object', 3, 'تفاحة')
            ]
        },
        19: {
            title: "ولد قصير مبلول يلعب في مي",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('05 adjectives', 31, 'قصير'),
                getDbItem('05 adjectives', 18, 'مبلول'),
                getDbItem('02 verbs', 30, 'يلعب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('03 object', 129, 'مي')
            ]
        },
        20: {
            title: "ولد حلو صغير ينط في الحديقة",
            slots: [
                getDbItem('01 subject', 1, 'ولد'),
                getDbItem('05 adjectives', 39, 'حلو'),
                getDbItem('05 adjectives', 6, 'صغير'),
                getDbItem('02 verbs', 21, 'ينط', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 4, 'الحديقة')
            ]
        },
        21: {
            title: "دب بني كبير يسبح جنب النهر",
            slots: [
                getDbItem('03 object', 8, 'دب'),
                getDbItem('10 colors', 4, 'بني'),
                getDbItem('05 adjectives', 5, 'كبير'),
                getDbItem('02 verbs', 94, 'يسبح', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('09 Prepositions', 8, 'جنب'),
                getDbItem('04 place', 44, 'النهر')
            ]
        },
        22: {
            title: "سمكة زرقا طويلة تسبح في البركة",
            slots: [
                getDbItem('01 subject', 93, 'سمكة'),
                getDbItem('10 colors', 3, 'زرقا'),
                getDbItem('05 adjectives', 32, 'طويلة'),
                getDbItem('02 verbs', 94, 'تسبح', { verbTense: 'present', conjugation: 'she' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 61, 'البركة')
            ]
        },
        23: {
            title: "بيبي حلو نظيف يشرب في المطبخ",
            slots: [
                getDbItem('01 subject', 7, 'بيبي'),
                getDbItem('05 adjectives', 39, 'حلو'),
                getDbItem('05 adjectives', 7, 'نظيف'),
                getDbItem('02 verbs', 2, 'يشرب', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 35, 'المطبخ')
            ]
        },
        24: {
            title: "بيبي حلو وسخ ياكل في المطبخ",
            slots: [
                getDbItem('01 subject', 7, 'بيبي'),
                getDbItem('05 adjectives', 39, 'حلو'),
                getDbItem('05 adjectives', 8, 'وسخ'),
                getDbItem('02 verbs', 1, 'ياكل', { verbTense: 'present', conjugation: 'he' }),
                getDbItem('08 linking', 11, 'في'),
                getDbItem('04 place', 35, 'المطبخ')
                ]
            }

        }
    }
};

