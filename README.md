# health-room

어드민/유저 앱을 함께 관리하는 모노레포 (npm workspaces + Turborepo).

```
apps/user       유저 앱   (http://localhost:5173)
apps/admin      어드민 앱 (http://localhost:5174)
packages/shared 공용 타입/유틸  (@health-room/shared)
packages/ui     공용 컴포넌트   (@health-room/ui)
```

```bash
npm install
npm run dev     # 두 앱 동시 실행
npm run build
```
