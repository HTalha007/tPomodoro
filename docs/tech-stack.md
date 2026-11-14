# Teknoloji yığını — Pomodoro ve Odak Zamanlayıcı

Bu belge MVP’nin teknik referansıdır. `docs/system-design.md` içindeki kapılar değişmez. Uygulama, geliştirici makinesinde `docker compose up` ile ayağa kalkar.

Ücretli hesap, barındırılan sunucu, yönetilen veritabanı, alan adı, sertifika ve dış kimlik hizmeti gerekmez. Kayıt e-postası gönderilmez. Çalışma zamanı üç yerel süreçtir: API, statik arayüz, PostgreSQL.

## 1. Seçim

| | Seçilen: TypeScript | Django + React | ASP.NET Core + React |
| --- | --- | --- | --- |
| Dil | Tek dil, web ve API | İki dil | İki ekosistem |
| Kredi sınırı | Saf paket + veritabanı kısıtı | ORM modeli çekirdekle yarışır | İşlem modeli güçlüdür, araç zinciri ayrıdır |
| Ayağa kalkırma | Ücretsiz yerel konteyner | Aynı | Aynı |

Üçü de ücretsiz kurulabilir. TypeScript seçildi çünkü kredi kuralı, HTTP kapısı ve Figma arayüzü aynı dilde kalır. İkinci dil, bu MVP’de doğruluk kazandırmaz.

## 2. Ana teknolojiler

| Seçim | Neden |
| --- | --- |
| TypeScript | Tur fazı ve kredi sonucu derleme anında görünür. API ve arayüz aynı tipleri okur. |
| Node.js LTS | API sürecinin çalışma zamanı. Ek bir sanal makine veya lisans yoktur. |
| pnpm çalışma alanları | `apps/api`, `apps/web`, `packages/domain`, `packages/contracts` tek depoda durur. Ücretli monorepo hizmeti yoktur. |
| Vitest | Çekirdek, enjekte edilen saatle sınanır. Ağ ve veritabanı gerekmez. |

## 3. Backend

| Seçim | Neden |
| --- | --- |
| NestJS | Denetleyici, MVC’nin giriş katmanıdır. Modül, saat, depo ve şifre kapılarını bağlar. İş kuralı denetleyicide yazılmaz. |
| Saf `packages/domain` | Tur makinesi, 2/3 mola, 45 dakika eşiği, 0 / yarım / tam karar ve İstanbul gün sınırı burada durur. Nest, Drizzle ve React bu pakete sızmaz. |
| `packages/contracts` | İstek ve yanıt tipleri. Kredi formülü bu pakete konmaz. Web, `packages/domain` içe aktarmaz. |
| Argon2id | Şifre tek yönlü özetlenir. Hizmet olarak kimlik doğrulama yoktur. |
| HttpOnly oturum çerezi | Taşıyıcı rastgeledir ve PostgreSQL’deki oturum satırına bakar. Tarayıcı yerel deposuna konmaz. JWT hizmeti yoktur. |

Kayıt, e-posta adresini ve şifre özetini yerel veritabanına yazar. Doğrulama postası, sihirli bağlantı ve SMS yoktur. Bunlar dış hesap ve çoğu zaman ücret ister.

## 4. Frontend

| Seçim | Neden |
| --- | --- |
| React + Vite | Girişin arkasındaki zamanlayıcı için sunucu tarafı sayfa üretimi gerekmez. Arayüz yalnız API’ye konuşur. Yerleşim, gelecek Stitch veya Figma tasarımına göre kurulur. |
| TanStack Query | Aktif tur, özet ve oda yoklamasını sunucudan okur. 10 saniyelik oda yoklaması burada durur. |
| Yerel geri sayım fonksiyonu | Son anlık görüntüdeki sunucu damgalarından ekranı çizer. Kredi yazmaz. |
| Tailwind CSS | Tasarım jetonları doğrudan yazılır. Hazır bileşen kiti yoktur. |

Redux ve benzeri bir istemci durum kütüphanesi yoktur. Kredinin kaynağı sunucu satırıdır.

## 5. Veritabanı

| Seçim | Neden |
| --- | --- |
| PostgreSQL 16, Compose içinde | İşlem, `timestamptz` ve kısmi tekil indeks kredi bütünlüğünün kendisidir. Lisans ücreti yoktur. Yönetilen veritabanı hesabı açılmaz. |
| Drizzle ORM ve drizzle-kit | Şema ve migrasyon repoda durur. Kısmi tekil indeksler şemada yazılır: hesap başına bir açık tur, tur başına bir kredi satırı, hesap başına bir aktif üyelik. |
| Ayrı migrasyon adımı | Migrasyon, API her açıldığında kendiliğinden değil, Compose içindeki açık bir adımla uygulanır. |

SQLite kurulumu daha az süreç ister. Seçilmedi. Eşzamanlı oda yoklaması ve kısmi tekil kısıt bu ürünün doğruluk sınırıdır. PostgreSQL konteyneri ücret üretmez.

Prisma ve TypeORM seçilmedi. Prisma'nın ağır binary motoru, PostgreSQL'deki kısmi tekil indeksleri (partial unique indexes: `WHERE left_at IS NULL` veya açık tur tekilliği) şemada doğal ve esnek yönetmedeki kısıtları nedeniyle tercih edilmedi. Drizzle ORM'in sıfır ek yükü (zero-overhead), SQL-first yaklaşımı ve doğrudan şema seviyesinde kısmi tekil indeks tanımlama kabiliyeti projede "Single Source of Truth" olarak kilitlenmiştir.

Dönem toplamı ayrı sayaç tablosu değildir. Kredi satırları sorguyla toplanır.

## 6. DevOps ve altyapı

| Seçim | Neden |
| --- | --- |
| Docker Compose | Tek komutla API, nginx ve PostgreSQL kalkar. Bulut hesabı, sunucu kirası ve küme yoktur. |
| nginx | Vite’ın üretim çıktısını statik sunar. Ayrı bir barındırma hizmeti yoktur. |
| Resmi genel imajlar | `node`, `postgres` ve `nginx`. Özel kayıt defteri ve ücretli imaj yoktur. |
| Gizli dizeler yerel ortam dosyasında | Veritabanı şifresi ve çerez sırrı geliştirici makinesindedir. Dış sır kasası yoktur. |

Kubernetes, Redis, kuyruk, CDN, hata izleme hizmeti ve analiz hizmeti yoktur. Sürekli kanal olmadığı için ayrıca bir yayın sunucusu da yoktur.

Yerel adres `http://localhost` olur. Alan adı ve sertifika, uygulama kalkarken gerekmez.

## 7. Kod organizasyonu

```text
apps/api          NestJS bileşke kökü, denetleyiciler, Drizzle depoları
apps/web          Vite ve React
packages/domain   Saf kredi ve takvim kuralları
packages/contracts
docker-compose.yml
```

İstek yolu: React niyeti gönderir, denetleyici oturumu çözer, kullanım senaryosu çekirdeği çağırır, depo PostgreSQL işlemini yapar. Turun kapanışı ve kredi satırı aynı işlemdedir.

Veritabanı sınavı, Compose ile kalkan PostgreSQL’e karşı aynı migrasyonu uygular. Ayrı bir test bulutu yoktur.

İkinci platform yazılırsa `packages/domain` sunucuda kalır ve o platform `packages/contracts` üzerinden konuşur. Çekirdek, arayüz paketine kopyalanmaz.

## 8. Bilinçli olarak alınmayanlar

Prisma, TypeORM, Auth0, Clerk, Firebase, Supabase, Neon, RDS, Vercel, Fly.io, Railway, SendGrid ve Redis Cloud alınmaz. Ürünün ayağa kalkması bunlardan birinin hesabına bağlı değildir. İleride bir sunucuya konacaksa aynı Compose dosyası, aynı ücretsiz imgelerle konur. Bu belge o konmayı şart koşmaz.
