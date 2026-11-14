# 🍅 tPomodoro

> **Quiet Paper** tasarım dili, **Heksagonal Mimari (DDD)** ve **Tek Doğruluk Kaynağı (Single Source of Truth)** prensipleriyle geliştirilmiş modern, dikkat dağıtmayan odaklanma ve Pomodoro platformu.

[![CI Pipeline](https://github.com/users/tpomodoro/workflows/CI%20Pipeline/badge.svg)](https://github.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg?logo=nodedotjs)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-red.svg?logo=nestjs)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-18.x-61dafb.svg?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ed.svg?logo=docker)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📖 Genel Bakış

**tPomodoro**, kullanıcıların bireysel odaklanma seansları yürütebileceği veya ortak odak odalarında arkadaşlarıyla birlikte çalışabileceği yüksek performanslı bir monorepo uygulamasıdır.

### 🎨 "Quiet Paper" Tasarım Sistemi
- **Sakin ve Sıcak Renk Paleti:** Saf beyaz yerine sıcak kağıt tonları (`#FBFBF9`, `#F7F7F4`), mürekkep grisi ve derin siyah tipografi.
- **Odak Odaklı Arayüz:** Dikkat dağıtıcı animasyonlar, parlak neon renkler ve agresif bildirimler yerine yumuşak geçişler ve dokunsal kartlar.
- **Hafif Ses Efektleri:** Web Audio API ile sıfır harici dosya bağımlılığıyla üretilen sakinleştirici seans tamamlama ve tıklama sesleri.

---

## 🏛️ Mimari Yapı

Proje, **pnpm workspaces** ile yönetilen monorepo yapısına sahiptir:

```
tPomodoro/
├── packages/
│   ├── domain/        # Saf TypeScript iş mantığı (Heksagonal Çekirdek, 0 dış bağımlılık)
│   └── contracts/     # Zod ve ts-rest ile paylaşılan tip ve API sözleşmeleri (SSOT)
├── apps/
│   ├── api/           # NestJS REST API, Drizzle ORM, Oturum Kimlik Doğrulama, SmartStoreAdapter
│   └── web/           # React 18, Vite, Tailwind CSS, TanStack Query, Lucide Icons
├── docker/            # Nginx ters vekil ve üretim yapılandırmaları
├── docker-compose.yml # Tüm yığını (Postgres, API, Web, Nginx) tek komutla ayağa kaldıran yapı
└── .github/workflows/ # GitHub Actions CI/CD otomatik test ve derleme hattı
```

### ✨ Öne Çıkan Özellikler

1. **Heksagonal Mimari (Hexagonal Architecture / DDD):**
   - `@tpomodoro/domain` paketi hiçbir harici kütüphaneye veya framework'e (NestJS/React/DB) bağımlı değildir.
   - Zamanlayıcı durum makinesi (Timer State Machine), odak kredisi hesaplama ve oda yönetimi 43/43 birim test kapsamı ile korunmaktadır.
2. **Tek Doğruluk Kaynağı (Single Source of Truth):**
   - API istek ve yanıt şemaları `@tpomodoro/contracts` içerisinde Zod ile tanımlanmıştır.
   - Backend ve frontend aynı tipleri paylaşır, tip uyumsuzluğu riski ortadan kaldırılmıştır.
3. **Akıllı Veri Katmanı (SmartStoreAdapter & Dev Fallback):**
   - PostgreSQL veritabanı bağlı olmadığında bile sistem kesintiye uğramaz; otomatik olarak **In-Memory (Bellek İçi)** moda geçer.
   - Geliştirici veya jüri testi için hazır seed hesaplar anında kullanılabilir.
4. **Birlikte Odaklanma Odaları:**
   - 6 haneli veya özel oda kodlarıyla arkadaşlarınızla aynı odada senkronize odaklanma seansı yürütme.
5. **Gelişmiş Seans Yönetimi:**
   - Standart Pomodoro (25 dk odak / 5 dk mola / 15 dk uzun mola)
   - Derin Çalışma (45 dk odak / 10 dk mola)
   - Tamamlanan seanslar için tebrik modalı, odak puanı kazanımı ve seans geçmişi.

---

## 🚀 Hızlı Başlangıç

### Gereksinimler
- **Node.js:** `v22.x` veya üzeri
- **pnpm:** `v9.x` veya üzeri (`corepack enable` ile otomatik kullanılabilir)

### 1. Projeyi Klonlayın ve Bağımlılıkları Yükleyin

```bash
git clone https://github.com/<kullanici-adiniz>/tPomodoro.git
cd tPomodoro
pnpm install
```

### 2. Ortam Değişkenlerini Hazırlayın

```bash
cp .env.example .env
```

### 3. Geliştirme Sunucularını Başlatın

İki ayrı terminal penceresinde veya tek komutla servisleri çalıştırabilirsiniz:

**Terminal 1 (Backend API):**
```bash
pnpm run dev:api
```
> API `http://localhost:3000` adresinde çalışacaktır. (Postgres yoksa otomatik olarak Bellek Modunda başlar).

**Terminal 2 (Frontend Web):**
```bash
pnpm run dev:web
```
> Web arayüzü `http://localhost:5173` adresinde açılacaktır.

---

## 🔑 Test Hesapları (Geliştirici / Demo Modu)

Uygulamanın giriş ekranında hızlı doldurma butonları mevcuttur. Dilerseniz aşağıdaki önceden tanımlanmış hesaplarla hemen test edebilirsiniz:

| Rol / Kullanıcı | Kullanıcı Adı | Şifre | Odak Puanı |
| :--- | :--- | :--- | :--- |
| **Kerem (Demo)** | `@kerem` | `Password123!` | 150 Puan |
| **Zeynep (Demo)** | `@zeynep` | `Password123!` | 320 Puan |

> *Not: Yeni bir hesap oluşturmak için "Kayıt Ol" sekmesini kullanarak dilediğiniz kullanıcı adıyla anında yeni hesap açabilirsiniz.*

---

## 🐳 Docker ile Çalıştırma

Tüm uygulamayı (PostgreSQL, NestJS API, React Web ve Nginx) Docker Compose ile tek adımda ayağa kaldırabilirsiniz:

```bash
docker compose up --build
```

- **Web Arayüzü:** `http://localhost`
- **Backend API:** `http://localhost:3000`
- **PostgreSQL:** `localhost:5432`

Durdurmak için:
```bash
docker compose down
```

---

## 🧪 Testler ve Derleme

Monorepo genelinde testleri ve tip kontrollerini çalıştırmak için:

```bash
# Saf Domain birim testlerini çalıştır (43 test)
pnpm run test:domain

# Tüm paketleri ve uygulamaları derle (TypeScript & Vite)
pnpm run build
```

---

## 📜 Lisans

Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır.
