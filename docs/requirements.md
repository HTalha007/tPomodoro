# Gereksinimler — Pomodoro ve Odak Zamanlayıcı

Bu doküman ürünün anayasasıdır. Yalnızca “ürün ne yapmalı?” sorusunu yanıtlar. Teknoloji seçimi, ekran tasarımı, MVP kesiti ve kabul testleri burada kilitlenmez.

Durum: keşif mülakatının ilk turuna göre yazıldı. Sayısal katsayılar (mola payı, uzun mola bandı) sistem tasarımında netleşir. Başarı hedeflerinin eşiği kabul kriterlerinde konuşulur.

## 1. Ürün amacı

Yazılım geliştiricinin derin iş günü ve öğrencinin sınav çalışması için her gün açılan bir odak aracı.

Vaadi üç parçadır:

1. Birlikte çalışma seansı: aynı anda odaklanan kişiler birbirinin varlığını görür.
2. Dakika yarışı: sıralama, çalışılan ham süreye değil kredili dakikaya göredir.
3. Seri: kredili dakikaların ardışık günlerde sürdürülüp sürdürülmediği görünür.

Klasik 25/5 ritmi varsayılan bir şablon olabilir; ürünün omurgası değildir. Süre, tur sayısı ve görev bağlama kişiye aittir.

## 2. Çekirdek iş mantığı

Üründe iki ayrı süre vardır.

- Ham dakika: zamanlayıcının ölçtüğü odak süresi.
- Kredili dakika: yarış, seri ve karşılaştırmada kullanılan süre. Yalnızca tur sonucu belli olduktan sonra yazılır.

### 2.1 Turun akışı

Kullanıcı her tur için süreyi belirler. Bir seansta tur sayısı da kullanıcıya aittir. İsteğe bağlı olarak seans bir göreve bağlanır.

Her tur şu sırayla ilerler:

1. Odak bloğu, planlanan sürenin tanımlı oranında molaya girer. Referans oran 2/3'tür. Bu oran kullanıcının serbest ayarı değil, ürün kuralıdır.
2. Mola açıldığı anda sistem, o ana kadarki mesaiye bakarak molayı kısa veya uzun seçer. Aynı oran, kısa planda kısa mola, uzun planda uzun mola üretebilir. Örnek: 30 dakikalık turda 20. dakikadaki mola kısa kalır; 90 dakikalık turda 60. dakikadaki mola, önceki mesai uzun olduğu için uzun moladır.
3. Mola uzunluğu, seçilen türe ve önceki mesai dakikasına orantılıdır. Sabit 5 ve 15 dakika varsayılmaz. Katsayılar sistem tasarımında kilitlenir.
4. Mola bitince kullanıcı kalan odak süresine devam eder veya turu bırakır.

### 2.2 Kredi kararı

Kredi tur bazındadır. Karar, moladan sonraki davranışa bağlıdır.

| Moladan sonra | Tur sonucu | Kredili dakika |
| --- | --- | --- |
| Devam etmez | Bırakıldı | 0. Moladan önceki ham dakika da silinir. |
| Devam eder, planlanan turu bitirmez | Yarım | Turda biriken odak dakikasının yarısı (mola öncesi ve sonrası birlikte). |
| Devam eder ve planlanan turu bitirir | Tam | Turun odak dakikasının tamamı. |

Yarış, seri, günlük/haftalık/aylık karşılaştırma ve arkadaş sıralaması yalnız kredili dakikayı okur. Bırakılan tur bu yüzeylerde iz bırakmaz.

### 2.3 Seri

Seri, kullanıcının yerel takvim gününde kredili dakikası olup olmadığına bakar. Kredili dakikası sıfırdan büyük olan gün seriyi sürdürür. Yalnızca bırakılmış turların olduğu gün seriyi ilerletmez. Gün sınırı, hesabın saat dilimine göredir. Haftanın başlangıcı pazartesidir.

### 2.4 Birlikte çalışma ve dakika yarışı

Birlikte çalışma seansı ortak bir odadır. Oda, katılımcıların aynı anda odaklandığını gösterir. Süre, tur sayısı, görev ve mola hesabı her katılımcıda ayrıdır. Odadaki sıralama, o seans içinde kazanılan kredili dakikadır.

Dakika yarışı, arkadaşlar arasında kredili dakikanın günlük, haftalık veya aylık karşılaştırmasıdır. Canlı oda sıralaması ile dönem sıralaması aynı sayıdan beslenir; ikisi ayrı ekranlarda durur.

### 2.5 Misafir ve hesap

Misafir zamanlayıcıyı ve tur kuralını kullanabilir. Misafir seansı biter bitmez kredili dakika, seri, geçmiş ve sosyal bağ yazılmaz.

Hesap; günlük, haftalık ve aylık kişisel karşılaştırmayı, arkadaş eklemeyi, arkadaşlarla karşılaştırmayı, seriyi, yarışı ve birlikte çalışma odasını açar. Karşılaştırma hem kişinin kendi dönemleri arasındadır hem de eklediği arkadaşlarladır.

Arkadaşlık karşılıklıdır: bir taraf ekler, diğer taraf kabul eder. Kabul edilmemiş kişi saatleri göremez.

## 3. User personas

### Kerem — derin iş yapan geliştirici

Her iş günü kesintisiz bloklara ihtiyaç duyar. Süreyi işe göre değiştirir, turu bir geliştirme görevine bağlar. Arkadaşlarının haftalık kredili dakikasını ve kendi serisini görerek ritmini korur. Başarısız gün, sayacın kaydığı veya bıraktığı turun yanlışlıkla yarışa yazıldığı gündür.

### Zeynep — sınava çalışan öğrenci

Çalışma süresi derse göre değişir. Görevi “Organik kimya, bölüm 4” gibi bir çalışma hedefidir. Günlük ve haftalık saatini kendi geçmişiyle ve çalışma arkadaşlarıyla karşılaştırır. Birlikte çalışma odasını, tek başına başlayamadığı blokları açmak için kullanır.

### Misafir

Hesap açmadan ritmi dener. Geçmiş, seri ve arkadaş beklentisi yoktur. Değeri, tur ve mola kuralının o an çalışmasıdır.

## 4. Functional requirements

### Zamanlayıcı ve seans

- FR-01: Kullanıcı odak süresini ve tur sayısını seans başlamadan belirler.
- FR-02: Kullanıcı seansı isteğe bağlı bir göreve bağlar. Görev, kredi kuralını değiştirmez.
- FR-03: Sistem her turu bölüm 2.1’deki akışla yürütür: oranlı mola noktası, mesaiye göre kısa veya uzun mola, moladan sonra devam veya bırakma.
- FR-04: Sistem turu bölüm 2.2’deki üç sonuçtan biriyle kapatır ve yalnız bu sonuca göre kredili dakika yazar.
- FR-05: Kullanıcı devam eden turu bilinçli olarak bırakabilir. Bırakılan turun kredisi 0’dır.
- FR-06: Seans, planlanan turlar bitince veya kullanıcı seansı kapatınca sona erer. Seans toplamı, turların kredili dakikalarının toplamıdır.

### Kimlik ve geçmiş

- FR-07: Misafir, hesap açmadan tek başına zamanlayıcı kullanır. Bu kullanım kalıcı geçmişe yazılmaz.
- FR-08: Kullanıcı hesap açar ve sonraki oturumlarda aynı geçmişe döner.
- FR-09: Hesap sahibi kredili dakikasını günlük, haftalık ve aylık görür. Hafta pazartesi başlar; gün sınırı hesabın saat dilimindedir.
- FR-10: Kişisel karşılaştırma, seçilen dönemi bir önceki eş dönemle yan yana koyar (bugün / dün, bu hafta / geçen hafta, bu ay / geçen ay).

### Arkadaş, yarış ve seri

- FR-11: Hesap sahibi arkadaşlık isteği gönderir. Karşı taraf kabul edince iki kullanıcı birbirinin dönemlik kredili dakikasını görür.
- FR-12: Hesap sahibi, kabul edilmiş arkadaşlarıyla günlük, haftalık ve aylık kredili dakika sıralamasını görür.
- FR-13: Sistem, kredili dakikası olan ardışık yerel günlerden seri üretir. Seri, yarış sıralamasından ayrı gösterilir.
- FR-14: Hesap sahibi birlikte çalışma odası açar veya açık bir odaya katılır. Katılımcılar birbirinin odadaki varlığını ve o seanstaki kredili dakikasını görür.
- FR-15: Odadaki her katılımcının süre, tur, görev, mola ve kredi hesabı kendi ayarıyla yürür.

### Tutarlılık

- FR-16: Sayfa yenilense veya uygulama kısa süre kopsa da süren tur, mola noktası ve kredi kararı aynı tur üzerinden devam eder. Hesaplı kullanıcıda bu durum kalıcıdır. Misafirde yalnız o ziyaret süresincedir.
- FR-17: Kredili dakika bir kez yazıldıktan sonra istemci saati değiştirilerek büyütülemez.
- FR-18: Kullanıcı yalnız kendi seansını ve kabul edilmiş arkadaşlarının paylaştığı özetlerini görür. Başka bir hesabın tur detayı, görevi veya odası görünmez.

## 5. Non-functional requirements

- NFR-01 Zaman doğruluğu: Odak ve mola süresi, sekme arka plandayken de gerçek geçen süreye göre ilerler. Arayüzün kare hızı krediyi belirlemez.
- NFR-02 Kredi bütünlüğü: Yarış, seri ve karşılaştırma aynı kredili dakika kayıtlarını okur. Ham süre bu yüzeylere sızmaz.
- NFR-03 Günlük kullanılabilirlik: Odak ekranı, süre ve tur dışındaki bilgiyi ikincil tutar. Bildirim, molanın başladığını ve tur kararının beklendiğini haber verir.
- NFR-04 Gizlilik: Odak geçmişi, görev adları ve arkadaş listesi hesabın verisidir. Misafir seansı başka bir hesaba yazılmaz.
- NFR-05 Yetki: Arkadaş özeti yalnız kabul edilmiş ilişkide açılır. Oda içeriği yalnız o odanın katılımcılarına görünür.
- NFR-06 Dönem hesabı: Günlük, haftalık ve aylık toplamlar, hesabın saat diliminde ve pazartesi başlangıcında tutarlıdır. Aynı tur iki döneme çift yazılmaz.
- NFR-07 Dayanıklılık: Hesaplı kullanıcının süren turu, yenileme ve kısa kopma sonrası aynı kredi kuralıyla sürer. Kopma, turu kendiliğinden “tam” yazmaz.
- NFR-08 Performans: Sayaç akışı günlük kullanımda takılmadan güncellenir. Günlük, haftalık ve aylık özetler, o anki seansı bekletmeden açılır.
- NFR-09 Erişilebilirlik: Süre, tur durumu ve kredi sonucu yalnız renkle anlatılmaz. Odak ve mola durumları metin olarak da anlaşılır.

## 6. Success metrics

Başarı eşikleri bu dokümanda kilitlenmez. Kabul kriterleri yazılırken tartışılır. Aşağıdaki sinyaller yalnızca o tartışmanın girdisidir:

- Hesaplı kullanıcının haftalık kredili dakikası ve bunu izleyen hafta geri dönmesi.
- Tamamlanan turların, bırakılan turlara oranı.
- Serinin kaç gün sürdüğü ve serinin hangi günde koptuğu.
- Arkadaş karşılaştırmasının ve birlikte çalışma odasının tekrar kullanılması.
- Misafirin, tur kuralını hesap açmadan da baştan sona deneyebilmesi.

Bu liste kabul testi değildir. Hedef sayılar `docs/acceptance-criteria.md` içinde konuşulacaktır.

## 7. Bilinçli olarak ertelenenler

- Teknoloji yığını, mimari ve veritabanı şeması.
- Hangi parçanın MVP’de olacağı.
- Arayüz yerleşimi. Ekranlar, iletilecek Stitch veya Figma tasarımlarına göre kurulacaktır.
- Mola katsayılarının ve uzun/kısa mola bandının sayısal değerleri.
- Başarı metriklerinin eşikleri.
