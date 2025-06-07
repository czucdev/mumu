# Kawaii Photobooth 📸

Ứng dụng chụp ảnh kawaii với filters, stickers và khung ảnh cute.

## Tính năng

- Chụp ảnh với camera selfie/sau
- 6 bộ lọc: Bình thường, Mềm mại, Đồng quê, Trắng đen, Cổ điển, Ảnh cũ
- 16 sticker kawaii
- 5 khung ảnh: Không khung, Trái tim, Hoa, Sao, Cầu vồng
- Cài đặt số ảnh và thời gian trễ
- Lưu ảnh PNG chất lượng cao
- Database PostgreSQL lưu trữ

## Deploy lên GitHub Pages

### Bước 1: Tạo repository
1. Tạo repository mới trên GitHub
2. Clone về máy hoặc upload trực tiếp

### Bước 2: Upload code
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/kawaii-photobooth.git
git push -u origin main
```

### Bước 3: Cấu hình GitHub Pages
1. Vào Settings > Pages
2. Source: GitHub Actions
3. Chọn Node.js workflow template

### Bước 4: Cấu hình build (tạo file .github/workflows/pages.yml)
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build:static
      - uses: actions/upload-pages-artifact@v1
        with:
          path: ./dist
      - uses: actions/deploy-pages@v1
```

## Deploy thay thế

### Netlify (Khuyến nghị)
1. Tạo tài khoản tại netlify.com
2. Connect GitHub repository
3. Build command: `npm run build:static`
4. Publish directory: `dist`

### Vercel
1. Tạo tài khoản tại vercel.com
2. Import GitHub repository
3. Tự động detect và deploy

## Cài đặt local

```bash
# Clone repository
git clone https://github.com/username/kawaii-photobooth.git
cd kawaii-photobooth

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Mở http://localhost:5000
```

## Yêu cầu hệ thống

- Node.js 18+
- Modern browser với camera support
- HTTPS (cho camera access)

## Cấu trúc dự án

```
├── client/src/           # React frontend
├── server/              # Express backend
├── shared/              # Database schema
├── components.json      # shadcn/ui config
├── package.json
└── vite.config.ts
```

## License

MIT License