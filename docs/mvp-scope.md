# MVP kapsamı — Pomodoro ve Odak Zamanlayıcı

Bu doküman yalnız MVP’de yapılacak işleri içerir. Sıra, uygulama sırasıdır. Listede olmayan iş yapılmaz.

Korunan vaat: hesaplı kullanıcı tek bir turda kredili dakika üretir, serisini ve bugünkü/haftalık toplamını görür, oda koduyla birlikte çalışırken aynı kredili dakikayla yarışır.

`docs/requirements.md` içindeki şu maddeler bu sürümde yoktur: görev bağlama (FR-02), çoklu tur (FR-01’in tur sayısı, FR-06), orantılı mola katsayısı (FR-03’ün süre formülü), misafir (FR-07), aylık görünüm (FR-09’un ayı), önceki dönem kıyası (FR-10), arkadaşlık ve arkadaş sıralaması (FR-11, FR-12), canlı saniye senkronu, tarayıcı bildirimi, ölçek çalışması (NFR-08).

## Uygulama sırası

### 1. Hesap

Kayıt ve giriş e-posta ile şifredir. Üçüncü parti giriş yoktur.

Hesabın saat dilimi kayıtta `Europe/Istanbul` olarak yazılır. Ayar ekranı yoktur. Gün ve hafta sınırları bu saat dilimindedir. Hafta pazartesi 00:00’da başlar.

Zamanlayıcı, seri, toplam ve oda yalnız giriş yapmış kullanıcıya açıktır.

### 2. Tek tur

Kullanıcı bir odak süresi seçer ve tek tur başlatır. Süre tam dakikadır; alt sınır 15, üst sınır 180.

Kullanıcının aynı anda tek aktif turu vardır. Yeni tur başlatmak, aktif turu aşağıdaki kredi kuralıyla kapatır.

Tur sayısı seçilmez. Görev adı yok.

### 3. Mola kuralı

Mola, planlanan sürenin 2/3’ünde açılır. Nokta saniye cinsinden `floor(planlanan_saniye * 2 / 3)` ile hesaplanır.

Mola anındaki ham odak 45 dakikadan kısaysa mola 5 dakikadır. 45 dakika ve üzeriyse mola 15 dakikadır. Örnek: 30 dakikalık tur 20. dakikada 5 dakikalık molaya girer; 90 dakikalık tur 60. dakikada 15 dakikalık molaya girer.

Mola kendiliğinden odak devam etmez. Kullanıcı `Devam` veya `Bırak` der.

### 4. Kredi kararı

Süreler saniye tutulur. Ekranda dakika gösterilir. Yarım kredide saniye ikiye bölünür ve aşağı yuvarlanır.

| Durum | Sonuç | Kredili süre |
| --- | --- | --- |
| Mola bitmeden bırakılır veya moladayken `Bırak` seçilir | Bırakıldı | 0 |
| `Devam` edilir, planlanan süre bitmeden tur kapanır | Yarım | Turda biriken odak saniyesinin yarısı, aşağı yuvarlanmış |
| `Devam` edilir ve odak saniyesi planlanan süreye ulaşır | Tam | Planlanan odak süresinin tamamı |

Mola saniyesi odak süresine eklenmez. Bırakılan tur 0 yazar; mola öncesi ham süre yarışa, seriye ve toplama girmez.

Tur, planlanan odak süresi dolunca kendiliğinden `Tam` kapanır. Kopma, yenileme veya saat değiştirme turu `Tam` yapmaz.

### 5. Sunucu zamanı ve süren tur

Turun başlangıcı, mola anı, devam anı ve bitişi sunucuda zaman damgasıyla durur. Kredili süre bu damgalardan hesaplanır. İstemci saati krediyi değiştiremez.

Sekme arka plandayken geçen gerçek süre esas alınır. Sayacın ekranda kaç kare çizdiği krediyi belirlemez.

Sayfa yenilendiğinde veya kısa kopmada aynı tur, aynı durumla açılır: odak, mola kararı veya moladan sonraki odak. Karar yazılmadan kredi oluşmaz.

### 6. Bugün ve bu hafta

Hesapta iki toplam vardır: bugün ve bu hafta. İkisi de yalnız kredili saniyeyi toplar. Ham süre gösterilmez.

Aynı tur bir kez yazılır. Ay, dün, geçen hafta ve dönem kıyası yoktur.

### 7. Seri

Yerel günde kredili süre sıfırdan büyükse o gün seriye sayılır. Yalnız bırakılmış turların olduğu gün sayılmaz.

Seri, ardışık sayılan günlerdir. Yarış sıralamasından ayrı gösterilir.

### 8. Oda ve dakika yarışı

Kullanıcı oda açar ve oda kodunu alır. Başka bir hesap bu kodla odaya girer.

Kullanıcı aynı anda tek odadadır. Başka odaya girmek, öncekini terk etmektir. Terk etmek kişisel bugün, hafta ve seri toplamını silmez.

Oda, katılımcıyı ve o odada kazandığı kredili süreyi gösterir. Sıralama bu süreye göredir. Süre, tur ve mola her katılımcıda ayrıdır. Sayaçlar birbirine kilitlenmez.

Varlık, periyodik yoklamayla anlaşılır. Yoklama aralığının sayısı sistem tasarımında seçilir. Saniye saniye ortak sayaç yapılmaz.

Oda içeriği yalnız o odadaki hesaplara görünür.

## Başarı metrikleri

Bu sürümün başarısı pazar hedefi değil, vaadin tek yoldan kanıtlanmasıdır. Aşağıdakiler tutmuyorsa MVP tamamlanmış sayılmaz. Eşiklerin kabul testine dökümü `docs/acceptance-criteria.md` dosyasında yazılacaktır.

1. Giriş yapmış kullanıcı bir turu bitirir; bugünün toplamı ve seri, tam kredili süre kadar artar.
2. Moladan önce veya moladayken bırakılan tur; bugüne, bu haftaya, seriye ve oda sıralamasına 0 yazar.
3. Devam edilip erken kapanan tur, biriken odak saniyesinin yarısını, aşağı yuvarlanmış haliyle yazar.
4. Yenileme, süren turu aynı durumda geri getirir ve kredi yazmaz.
5. İstemci saati değiştirilerek kredili süre büyütülemez.
6. Aynı odadaki iki hesap birbirini görür. Sıralama, odadayken yazılmış kredili süreyle birebir örtüşür. Odadaki kişisel süreler birbirinden bağımsızdır.
