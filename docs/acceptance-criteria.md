# Kabul kriterleri — Pomodoro ve Odak Zamanlayıcı

Bu belge MVP’nin test kontrol listesidir. Madde geçmeden özellik bitti sayılmaz. Kapsam `docs/mvp-scope.md` dışına çıkmaz.

Ortam, yerel Docker Compose üzerinde masaüstü Chrome ve Safari’dir. İki tarayıcıda faz, kredili saniye, toplam ve ret aynı olmalıdır. Ekran yerleşimi bu listeye girmez. Stitch veya Figma geldikten sonra ayrıca yazılır.

Süreler saniyedir. Gün ve hafta `Europe/Istanbul` takvimindedir. Hafta pazartesi 00:00’da başlar, sonraki pazartesi 00:00 hariçtir.

## 1. Kredi kararı

- [x] AC-K01. 30 dakikalık tur (`1800` saniye) `1200.` saniyede molaya girer. Mola `300` saniyedir. Kredi satırı yazılmaz.
- [x] AC-K02. 90 dakikalık tur (`5400` saniye) `3600.` saniyede molaya girer. Mola `900` saniyedir.
- [x] AC-K03. 67 dakika (`4020` saniye) `2680.` saniyede `300` saniyelik molaya girer. 68 dakika (`4080` saniye) `2720.` saniyede `900` saniyelik molaya girer.
- [x] AC-K04. Mola bitmeden `Devam` reddedilir. Faz `awaiting_decision` kalır. Satır yazılmaz.
- [x] AC-K05. Mola süresi dolunca `Devam` kabul edilir. Faz `focus_after_break` olur. Satır hâlâ yoktur.
- [x] AC-K06. Mola öncesi veya molada `Bırak`, `abandoned` ve `0` yazar.
- [x] AC-K07. Devamdan sonra, plan dolmadan kapanan turda biriken odak `break_after_seconds + (kapanış - resumed_at)` değeridir ve planı aşamaz. Kredili saniye bunun yarısının aşağı yuvarlanmış halidir. 30 dakikalık turda devamdan `100` saniye sonra kapanış `650` yazar.
- [x] AC-K08. Devam edilip plan dolunca kredili saniye planın tamamıdır. 30 dakikalık turda bu `1800`’dir. `closed_at`, `resumed_at + 600` saniyedir. İsteğin vardığı saat değildir.
- [x] AC-K09. Aynı turda ikinci `Bırak` veya ikinci kendiliğinden kapanış aynı satırı döner. Kredili saniye değişmez. Satır sayısı bir kalır.
- [x] AC-K10. Soğuk başlangıç hariç, yerel Compose’ta `Başlat`, `Devam`, `Bırak` ve aktif tur sorgusu `500 ms` içinde döner.
- [x] AC-K11. İstemci saati `+24 saat` kaydırılsa da kredili saniye ve `closed_at` sunucu damgasıyla hesaplanan değerle aynı kalır.
- [x] AC-K12. Başka hesabın tur kimliğiyle `Devam` veya `Bırak` reddedilir. O turun satırı değişmez.
- [x] AC-K13. `14` ve `181` dakika reddedilir. Tur açılmaz. `15` ve `180` dakika kabul edilir.
- [x] AC-K14. Mola anı geçmişken gelen ilk sorgu fazı `awaiting_decision` yapar. `break_started_at`, `started_at + break_after_seconds` olur. Geç yoklama bu anı ötelemez ve kredi yazmaz.
- [x] AC-K15. Plan dolduktan sonraki ilk sorgu turu `full` kapatır. Plan dolmadan yapılan yenileme `full` yazmaz.
- [x] AC-K16. Karar bekleyen tur varken yeni tur, eskisini `0` ile kapatıp yenisini açar. Devam edilmiş ve bitmemiş tur yarım kapanır. Planı dolmuş tur tam kapanır.
- [x] AC-K17. İki eşzamanlı başlatmadan yalnız biri açık tur bırakır. Hesap başına açık tur sayısı en fazla biridir.
- [x] AC-K18. Bağlantı moladayken koparsa faz karar bekler. Kopma `0`, yarım veya tam yazmaz. Bağlantı dönünce aynı tur okunur.
- [x] AC-K19. Chrome ve Safari, AC-K01 ile AC-K18 arasında aynı fazı, aynı kredili saniyeyi ve aynı reddi üretir.

## 2. Hesap

- [x] AC-H01. Kayıt e-posta ve şifre ister. Veritabanında şifrenin düz metni yoktur. Argon2id özeti vardır.
- [x] AC-H02. Aynı e-posta ile ikinci kayıt reddedilir. İkinci hesap açılmaz.
- [x] AC-H03. Doğru şifre girişinde oturum çerezi yazılır. Çerez `HttpOnly` olur. Taşıyıcı `localStorage` veya `sessionStorage` içinde görünmez.
- [x] AC-H04. Yanlış şifre reddedilir. Çerez yazılmaz. Özet değişmez.
- [x] AC-H05. Çerez olmadan tur, özet ve oda istekleri reddedilir.
- [x] AC-H06. Çıkış, aynı taşıyıcıyla yapılan sonraki isteği reddeder.
- [x] AC-H07. Kayıt ve giriş yanıtında şifre ve özet yoktur. Doğrulama postası, sihirli bağlantı ve SMS gönderilmez.
- [x] AC-H08. Yeni hesabın saat dilimi `Europe/Istanbul` olur. Bunu değiştiren bir uç yoktur.
- [x] AC-H09. Chrome ve Safari’de aynı hesapla giriş, aynı turu ve aynı toplamı gösterir.

## 3. Bugün ve bu hafta

- [x] AC-O01. Özet yalnız kredili saniyeyi toplar. `abandoned` satır toplamı artırmaz. Ham odak süresi özette görünmez.
- [x] AC-O02. `full` ve `half` satırlar, `closed_at` hangi güne düşüyorsa o günün toplamına bir kez eklenir.
- [x] AC-O03. İstanbul’da pazar `23:59`’da kapanan tur o haftaya yazılır. Pazartesi `00:00`’da kapanan tur sonraki haftaya yazılır. Pazartesi gelen geç yoklama, pazarın kapanışını pazartesiye taşımaz.
- [x] AC-O04. Özet yanıtında ay, dün, geçen hafta ve dönem kıyası yoktur.
- [x] AC-O05. Chrome ve Safari aynı hesapta aynı bugün ve aynı hafta saniyesini gösterir.

## 4. Seri

- [x] AC-S01. Kredili saniyesi sıfırdan büyük yerel gün seriye sayılır. Yalnız `0` satırı olan gün sayılmaz.
- [x] AC-S02. Bugünün kredisi varsa seri bugünden geriye, kesintisiz günleri sayar.
- [x] AC-S03. Bugün henüz boşsa seri dünden geriye sayılır. Gün bitene kadar seri kopmuş sayılmaz. Dün de boşsa seri `0`’dır.
- [x] AC-S04. Kredisiz gün bittiğinde seri `0` olur. Ertesi gün yazılan kredi seriyi `1` yapar.
- [x] AC-S05. Seri, oda sıralamasından ayrı bir alandadır. Oda skoru seri sayısını değiştirmez.
- [x] AC-S06. Chrome ve Safari aynı seri sayısını gösterir.

## 5. Oda ve dakika yarışı

- [x] AC-R01. Oda açılınca tahmin edilemeyen bir kod döner. Kod en az `128` bit entropi taşır. Ardışık iki oda aynı kodu almaz.
- [x] AC-R02. İkinci hesap bu kodla odaya girer. İki hesap birbirini üye listesinde görür.
- [x] AC-R03. Bilinmeyen kodla katılım reddedilir. Üyelik oluşmaz.
- [x] AC-R04. Üye olmayan hesabın oda okuması ile bilinmeyen kodun okuması aynı reddi döner. Skor ve üye listesi sızmaz.
- [x] AC-R05. Başka odaya girmek önceki aktif üyeliği kapatır. Hesabın bugün, hafta ve seri toplamı değişmez.
- [x] AC-R06. Aktif üyelik varken kapanan turun satırına o `room_id` yazılır. Üyelik yokken kapanan satırda `room_id` boştur ve oda skoruna girmez.
- [x] AC-R07. Sıralama, aktif üyelerin bu `room_id` ile yazılmış kredili saniyelerinin toplamıdır. `0` satır sıralamayı büyütmez.
- [x] AC-R08. Ayrılan hesap listeden düşer. Kişisel satırları durur. Aynı odaya geri girince eski oda satırları skora yeniden eklenir.
- [x] AC-R09. İki üyenin tur süreleri birbirinden bağımsızdır. Birinin molası diğerinin fazını değiştirmez.
- [x] AC-R10. Oda ekranı açıkken yoklama `10` saniyede bir gider. `last_seen_at` son `30` saniye içindeyse üye odada görünür. `31.` saniyede uzakta görünür. Skoru listede kalır.
- [x] AC-R11. Hesap başına aktif üyelik sayısı en fazla biridir. İki eşzamanlı katılmadan yalnız biri aktif kalır.
- [x] AC-R12. Chrome’daki hesap ile Safari’deki hesap aynı odada birbirinin skorunu aynı saniye değeriyle görür.

## 6. Bitti sayılması

MVP bitti sayılırsa aşağıdakilerin hepsi geçmiştir:

- [x] AC-K01 … AC-K19 (Kredi kararı kuralları)
- [x] AC-H01 … AC-H09 (Hesap ve Argon2id kimlik doğrulama)
- [x] AC-O01 … AC-O05 (Bugün ve bu hafta Istanbul dönemi hesabı)
- [x] AC-S01 … AC-S06 (Seri hesaplama kuralları)
- [x] AC-R01 … AC-R12 (Birlikte çalışma odası ve dakika yarışı)

Çekirdek kurallar, Vitest içinde enjekte edilen saatle de geçer. Veritabanı kısıtları, Compose içindeki PostgreSQL’de aynı migrasyonla doğrulanır. Bu listede olmayan iş, bitişin şartı değildir.
